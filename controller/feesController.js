const feesService = require('../service/feesService');

exports.addFees = async (req, res) => {
  try {
    const fees = await feesService.addFees(req.body);
    res.json({ success: true, fees });
  } catch (err) {
    if (err.code === 'STUDENT_NOT_FOUND' || err.code === 'INVALID_NUMERIC') {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFees = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';

    const result = await feesService.getFees({ page, limit, search });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFeesById = async (req, res) => {
  try {
    const fees = await feesService.getFeesById(req.params.id);
    if (!fees) {
      return res.status(404).json({ success: false, message: 'Fees record not found' });
    }
    res.json({ success: true, fees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFeesSummaryByStudent = async (req, res) => {
  try {
    const data = await feesService.getFeesSummaryByStudent();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMonthlyFeesSummary = async (req, res) => {
  try {
    const yearParam = req.query.year;
    const year = yearParam ? parseInt(yearParam, 10) : undefined;
    const data = await feesService.getMonthlyFeesSummary(year);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLastFeesForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const fees = await feesService.getLastFeesForStudent(studentId);
    res.json({ success: true, fees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateFees = async (req, res) => {
  try {
    const fees = await feesService.updateFees(req.params.id, req.body);
    if (!fees) {
      return res.status(404).json({ success: false, message: 'Fees record not found' });
    }
    res.json({ success: true, fees });
  } catch (err) {
    if (err.code === 'STUDENT_NOT_FOUND' || err.code === 'INVALID_NUMERIC') {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteFees = async (req, res) => {
  try {
    const deleted = await feesService.deleteFees(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Fees record not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
