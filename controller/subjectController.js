const subjectService = require("../service/subjectService");

exports.addSubject = async (req, res) => {
  try {
    const subject = await subjectService.addSubject(req.body);
    res.json({ success: true, subject });
  } catch (err) {
    if (err.code === "SUBJECT_EXISTS") {
      return res
        .status(400)
        .json({ success: false, message: "Subject already exists" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";

    const result = await subjectService.getSubjects({ page, limit, search });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSubjectById = async (req, res) => {
  try {
    const subject = await subjectService.getSubjectById(req.params.id);
    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }
    res.json({ success: true, subject });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const subject = await subjectService.updateSubject(
      req.params.id,
      req.body,
    );
    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }
    res.json({ success: true, subject });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const deleted = await subjectService.deleteSubject(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
