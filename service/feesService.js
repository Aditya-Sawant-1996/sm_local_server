const Fees = require("../models/fees");
const Student = require("../models/student");

exports.addFees = async (data) => {
  if (!data.studentId) {
    throw new Error("studentId is required");
  }

  const student = await Student.findOne({ _id: data.studentId, isDeleted: false });
  if (!student) {
    const err = new Error("Student not found");
    err.code = "STUDENT_NOT_FOUND";
    throw err;
  }

  const selectedStudent = {
    studentId: student._id,
    name: student.name,
    aadhaarNumber: student.aadhaarNumber,
    subjects: student.subject || [],
  };

  const totalFees = Number(data.totalFees);
  const totalInstallments = Number(data.totalInstallments);
  const feesPaid = Number(data.feesPaid);

  if (!Number.isFinite(totalFees) || !Number.isFinite(totalInstallments) || !Number.isFinite(feesPaid)) {
    const err = new Error("Invalid numeric values for fees");
    err.code = "INVALID_NUMERIC";
    throw err;
  }

  const monthlyInstallments = totalInstallments > 0 ? totalFees / totalInstallments : 0;

  const doc = new Fees({
    selectedStudent,
    subjects: selectedStudent.subjects,
    admissionDate: data.admissionDate,
    totalFees,
    totalInstallments,
    monthlyInstallments,
    instalmentNumber: data.instalmentNumber,
    feesPaid,
    date: data.date,
  });

  return await doc.save();
};

exports.getFees = async ({ page = 1, limit = 10, search = "" }) => {
  const query = { isDeleted: false };

  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [
      { "selectedStudent.name": regex },
      { "selectedStudent.aadhaarNumber": regex },
    ];
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Fees.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Fees.countDocuments(query),
  ]);

  return { data, total, page, limit };
};

exports.getFeesById = async (id) => {
  return await Fees.findOne({ _id: id, isDeleted: false });
};

exports.updateFees = async (id, data) => {
  const update = { ...data };

  if (data.studentId) {
    const student = await Student.findOne({ _id: data.studentId, isDeleted: false });
    if (!student) {
      const err = new Error("Student not found");
      err.code = "STUDENT_NOT_FOUND";
      throw err;
    }
    update.selectedStudent = {
      studentId: student._id,
      name: student.name,
      aadhaarNumber: student.aadhaarNumber,
      subjects: student.subject || [],
    };
    update.subjects = update.selectedStudent.subjects;
  }

  if (data.totalFees !== undefined || data.totalInstallments !== undefined) {
    const existing = await Fees.findOne({ _id: id, isDeleted: false });
    if (!existing) {
      return null;
    }
    const totalFees =
      data.totalFees !== undefined ? Number(data.totalFees) : existing.totalFees;
    const totalInstallments =
      data.totalInstallments !== undefined
        ? Number(data.totalInstallments)
        : existing.totalInstallments;

    update.totalFees = totalFees;
    update.totalInstallments = totalInstallments;
    update.monthlyInstallments =
      totalInstallments > 0 ? totalFees / totalInstallments : 0;
  }

  if (data.feesPaid !== undefined) {
    update.feesPaid = Number(data.feesPaid);
  }

  return await Fees.findOneAndUpdate({ _id: id, isDeleted: false }, update, {
    new: true,
  });
};

exports.deleteFees = async (id) => {
  return await Fees.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true },
  );
};
