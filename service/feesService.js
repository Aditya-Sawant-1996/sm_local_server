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
    mobileNo: student.mobileNo,
    subjects: student.subject || [],
    batchStart: student.batchStart,
    batchEnd: student.batchEnd,
  };

  const totalFees = Number(data.totalFees);
  const totalInstallments = Number(data.totalInstallments);
  const feesPaid = Number(data.feesPaid);
  const instalmentNumber = Number(data.instalmentNumber);

  if (
    !Number.isFinite(totalFees) ||
    !Number.isFinite(totalInstallments) ||
    !Number.isFinite(feesPaid) ||
    !Number.isFinite(instalmentNumber)
  ) {
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
    instalmentNumber,
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

// Aggregate fees by student to produce a single summary row per student.
exports.getFeesSummaryByStudent = async () => {
  // Group all non-deleted fees records by student
  const agg = await Fees.aggregate([
    {
      $match: { isDeleted: false },
    },
    {
      $group: {
        _id: "$selectedStudent.studentId",
        lastPaymentDate: { $max: "$date" },
        totalFees: { $max: "$totalFees" },
        totalInstallments: { $max: "$totalInstallments" },
        monthlyInstallments: { $max: "$monthlyInstallments" },
        totalPaid: { $sum: "$feesPaid" },
      },
    },
  ]);

  if (!agg.length) {
    return [];
  }

  const studentIds = agg.map((row) => row._id).filter(Boolean);
  const students = await Student.find({
    _id: { $in: studentIds },
    isDeleted: false,
  });
  const studentMap = new Map();
  for (const s of students) {
    studentMap.set(String(s._id), s);
  }

  return agg.map((row) => {
    const student = studentMap.get(String(row._id));
    let name = "";
    let subjects = [];
    let batchStart = null;
    let batchEnd = null;
    if (student) {
      const parts = [];
      if (student.surName) parts.push(student.surName);
      if (student.firstName) parts.push(student.firstName);
      if (student.guardianName) parts.push(student.guardianName);
      name = parts.join(" ");
      subjects = Array.isArray(student.subject) ? student.subject : [];
      batchStart = student.batchStart || null;
      batchEnd = student.batchEnd || null;
    }

    const totalFees = row.totalFees ?? 0;
    const totalInstallments = row.totalInstallments ?? 0;
    const monthlyInstallments = row.monthlyInstallments ?? 0;
    const totalPaid = row.totalPaid ?? 0;
    const amountDue = Math.max(0, totalFees - totalPaid);

    return {
      studentId: row._id,
      name,
      subjects,
      batchStart,
      batchEnd,
      totalInstallments,
      totalFees,
      monthlyInstallments,
      totalPaid,
      amountDue,
      lastPaymentDate: row.lastPaymentDate,
    };
  });
};

exports.getLastFeesForStudent = async (studentId) => {
  if (!studentId) {
    return null;
  }
  return await Fees.findOne({
    "selectedStudent.studentId": studentId,
    isDeleted: false,
  }).sort({ date: -1, createdAt: -1 });
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
      mobileNo: student.mobileNo,
      subjects: student.subject || [],
      batchStart: student.batchStart,
      batchEnd: student.batchEnd,
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

// Aggregate total fees collected per month (by payment date) for all time
// or optionally within a given year if a year argument is provided.
exports.getMonthlyFeesSummary = async (year) => {
  const match = { isDeleted: false };
  if (year) {
    const start = new Date(Number(year), 0, 1);
    const end = new Date(Number(year) + 1, 0, 1);
    match.date = { $gte: start, $lt: end };
  }

  const agg = await Fees.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        totalCollected: { $sum: "$feesPaid" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return agg.map((row) => ({
    year: row._id.year,
    month: row._id.month,
    totalCollected: row.totalCollected ?? 0,
  }));
};
