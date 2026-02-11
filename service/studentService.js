const Student = require('../models/student');

const buildFullName = (data) => {
  const parts = [];
  if (data.firstName) {
    parts.push(data.firstName);
  }
  if (data.surName) {
    parts.push(data.surName);
  }
  return parts.join(' ').trim();
};

exports.addStudent = async (data) => {
  if (data) {
    data.name = buildFullName(data);
  }
  const student = new Student(data);
  return await student.save();
};

exports.getStudents = async ({ page = 1, limit = 10, search = '' }) => {
  const query = {};

  if (search) {
    const regex = new RegExp(search, 'i');
    query.$or = [{ name: regex }, { mobileNo: regex }, { batch: regex }];
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Student.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Student.countDocuments(query),
  ]);

  return { data, total, page, limit };
};

exports.getStudentById = async (id) => {
  return await Student.findById(id);
};

exports.updateStudent = async (id, data) => {
  if (data && (data.firstName || data.surName)) {
    const existing = await Student.findById(id);
    if (existing) {
      const firstName = data.firstName ?? existing.firstName;
      const surName = data.surName ?? existing.surName;
      data.name = buildFullName({ firstName, surName });
    }
  }
  return await Student.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteStudent = async (id) => {
  return await Student.findByIdAndDelete(id);
};
