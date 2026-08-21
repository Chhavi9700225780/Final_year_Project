export const createRecord = (Model) => async (req, res) => {
  try {
    const record = await Model.create(req.body);

    return res.status(201).json({
      success: true,
      data: record,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecords = (Model) => async (req, res) => {
  try {
    const filter = {};

    if (req.query.companyId) {
      filter.companyId = req.query.companyId;
    }

    const records = await Model.find(filter).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecordById = (Model) => async (req, res) => {
  try {
    const record = await Model.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    return res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateRecord = (Model) => async (req, res) => {
  try {
    const record = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    return res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteRecord = (Model) => async (req, res) => {
  try {
    const record = await Model.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    return res.json({
      success: true,
      message: "Record deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};