const studentService = require('../service/studentService');

exports.addStudent = async (req, res) => {
  try {
    if (req.body.selectedSubjects && typeof req.body.selectedSubjects === 'string') {
      try {
        req.body.selectedSubjects = JSON.parse(req.body.selectedSubjects);
      } catch (e) {
        // ignore parse errors and let validation/model handle it
      }
    }
    const student = await studentService.addStudent(req.body);
    res.json({ success: true, student });
  } catch (err) {
    if (err && (err.code === 11000 || err.code === "AADHAAR_DUP")) {
      const key =
        (Object.keys(err.keyPattern || {})[0] ||
          Object.keys(err.keyValue || {})[0] ||
          'field');
      let message = 'Duplicate value.';
      if (key === 'aadhaarNumber' || err.code === "AADHAAR_DUP") {
        message = 'Aadhaar number already exists.';
      } else if (key === 'mobileNo') {
        message = 'Mobile number already exists.';
      } else {
        message = `Duplicate value for ${key}.`;
      }
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';

    const result = await studentService.getStudents({ page, limit, search });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    if (req.body.selectedSubjects && typeof req.body.selectedSubjects === 'string') {
      try {
        req.body.selectedSubjects = JSON.parse(req.body.selectedSubjects);
      } catch (e) {
        // ignore parse errors and let validation/model handle it
      }
    }
    const student = await studentService.updateStudent(req.params.id, req.body);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, student });
  } catch (err) {
    if (err && (err.code === 11000 || err.code === "AADHAAR_DUP")) {
      const key =
        (Object.keys(err.keyPattern || {})[0] ||
          Object.keys(err.keyValue || {})[0] ||
          'field');
      let message = 'Duplicate value.';
      if (key === 'aadhaarNumber' || err.code === "AADHAAR_DUP") {
        message = 'Aadhaar number already exists.';
      } else if (key === 'mobileNo') {
        message = 'Mobile number already exists.';
      } else {
        message = `Duplicate value for ${key}.`;
      }
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const deleted = await studentService.deleteStudent(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
