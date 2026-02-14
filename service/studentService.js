const Student = require("../models/student");
const Fees = require("../models/fees");

const buildFullName = (data) => {
  const parts = [];
  if (data.firstName) {
    parts.push(data.firstName);
  }
  if (data.surName) {
    parts.push(data.surName);
  }
  return parts.join(" ").trim();
};

exports.addStudent = async (data) => {
  if (data) {
    data.name = buildFullName(data);

    // Normalise optional Aadhaar values
    if (
      data.aadhaarNumber === null ||
      data.aadhaarNumber === undefined ||
      data.aadhaarNumber === "" ||
      data.aadhaarNumber === "null" ||
      data.aadhaarNumber === "undefined"
    ) {
      delete data.aadhaarNumber;
    }

    // If Aadhaar is provided, enforce uniqueness at application level
    if (data.aadhaarNumber) {
      const existing = await Student.findOne({
        aadhaarNumber: data.aadhaarNumber,
        isDeleted: false,
      });
      if (existing) {
        const err = new Error("Aadhaar number already exists.");
        // Custom code so controller can distinguish this
        // from other errors and return a 400.
        // (Different from Mongo's 11000 duplicate key.)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        err.code = "AADHAAR_DUP";
        throw err;
      }
    }
  }
  const student = new Student(data);
  return await student.save();
};

exports.getStudents = async ({ page = 1, limit = 10, search = "" }) => {
  const query = { isDeleted: false };

  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [
      { name: regex },
      { mobileNo: regex },
      { aadhaarNumber: regex },
    ];
  }

  const skip = (page - 1) * limit;

  const [students, total] = await Promise.all([
    Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Student.countDocuments(query),
  ]);

  // Enrich students with aggregated fees information
  const studentIds = students.map((s) => s._id).filter(Boolean);
  let data = students;
  if (studentIds.length) {
    const feesAgg = await Fees.aggregate([
      {
        $match: {
          "selectedStudent.studentId": { $in: studentIds },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$selectedStudent.studentId",
          totalFees: { $max: "$totalFees" },
          totalPaid: { $sum: "$feesPaid" },
        },
      },
    ]);

    const feesMap = new Map();
    for (const row of feesAgg) {
      const totalFees = row.totalFees ?? 0;
      const totalPaid = row.totalPaid ?? 0;
      const pendingFees = Math.max(0, totalFees - totalPaid);
      feesMap.set(String(row._id), {
        totalFees,
        totalFeesPaid: totalPaid,
        pendingFees,
      });
    }

    data = students.map((s) => {
      const plain = s.toObject();
      const fees = feesMap.get(String(s._id)) || {
        totalFees: 0,
        totalFeesPaid: 0,
        pendingFees: 0,
      };
      plain.totalFees = fees.totalFees;
      plain.totalFeesPaid = fees.totalFeesPaid;
      plain.pendingFees = fees.pendingFees;
      return plain;
    });
  }

  return { data, total, page, limit };
};

exports.getStudentById = async (id) => {
  return await Student.findOne({ _id: id, isDeleted: false });
};

exports.updateStudent = async (id, data) => {
  const existing = await Student.findOne({ _id: id, isDeleted: false });
  if (!existing) {
    return null;
  }

  if (data) {
    // Normalise optional Aadhaar values
    if (
      data.aadhaarNumber === null ||
      data.aadhaarNumber === undefined ||
      data.aadhaarNumber === "" ||
      data.aadhaarNumber === "null" ||
      data.aadhaarNumber === "undefined"
    ) {
      delete data.aadhaarNumber;
    }

    // If Aadhaar is provided and changed, enforce uniqueness
    if (data.aadhaarNumber && data.aadhaarNumber !== existing.aadhaarNumber) {
      const dup = await Student.findOne({
        aadhaarNumber: data.aadhaarNumber,
        isDeleted: false,
        _id: { $ne: id },
      });
      if (dup) {
        const err = new Error("Aadhaar number already exists.");
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        err.code = "AADHAAR_DUP";
        throw err;
      }
    }

    // Rebuild full name if firstName/surName changed
    if (data.firstName || data.surName) {
      const firstName = data.firstName ?? existing.firstName;
      const surName = data.surName ?? existing.surName;
      data.name = buildFullName({ firstName, surName });
    }
  }

  return await Student.findOneAndUpdate({ _id: id, isDeleted: false }, data, {
    new: true,
  });
};

exports.deleteStudent = async (id) => {
  return await Student.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
};
