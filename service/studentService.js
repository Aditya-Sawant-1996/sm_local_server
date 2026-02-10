const Student = require('../models/student');

exports.addStudent = async (data) => {
  if (data) {
    const nameParts = [data.firstName, data.middleName, data.lastName].filter(Boolean);
    if (nameParts.length) {
      data.name = nameParts.join(' ').trim();
    }
  }
  const student = new Student(data);
  return await student.save();
};

exports.getStudents = async ({ page = 1, limit = 10, search = '' }) => {
  const query = {};

  if (search) {
    const regex = new RegExp(search, 'i');
    query.$or = [{ name: regex }, { class: regex }];
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
  if (data && (data.firstName || data.middleName || data.lastName)) {
    const existing = await Student.findById(id);
    if (existing) {
      const firstName = data.firstName ?? existing.firstName;
      const middleName = data.middleName ?? existing.middleName;
      const lastName = data.lastName ?? existing.lastName;
      const nameParts = [firstName, middleName, lastName].filter(Boolean);
      if (nameParts.length) {
        data.name = nameParts.join(' ').trim();
      }
    }
  }
  return await Student.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteStudent = async (id) => {
  return await Student.findByIdAndDelete(id);
};
