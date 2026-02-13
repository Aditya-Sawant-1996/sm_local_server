const Subject = require("../models/subject");

exports.addSubject = async (data) => {
  if (!data || !data.subjectName) {
    throw new Error("Subject name is required");
  }

  const existing = await Subject.findOne({
    subjectName: { $regex: `^${data.subjectName}$`, $options: "i" },
  });

  if (existing) {
    const err = new Error("Subject already exists");
    err.code = "SUBJECT_EXISTS";
    throw err;
  }

  const subject = new Subject(data);
  return await subject.save();
};

exports.getSubjects = async ({ page = 1, limit = 10, search = "" }) => {
  const query = { isDeleted: false };

  if (search) {
    const regex = new RegExp(search, "i");
    query.subjectName = regex;
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Subject.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Subject.countDocuments(query),
  ]);

  return { data, total, page, limit };
};

exports.getSubjectById = async (id) => {
  return await Subject.findOne({ _id: id, isDeleted: false });
};

exports.updateSubject = async (id, data) => {
  return await Subject.findOneAndUpdate({ _id: id, isDeleted: false }, data, {
    new: true,
  });
};

exports.deleteSubject = async (id) => {
  return await Subject.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
};
