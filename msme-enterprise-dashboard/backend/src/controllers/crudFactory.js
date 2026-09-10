// ==========================================
// CREATE
// ==========================================

export const createRecord = (Model) => async (req, res) => {
  try {
    if (!req.user?.companyId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a company",
      });
    }

    const record = await Model.create({
      ...req.body,
      companyId: req.user.companyId,
    });

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


// ==========================================
// GET ALL
// ==========================================

export const getRecords = (Model) => async (req, res) => {
  try {
    if (!req.user?.companyId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a company",
      });
    }

    const records = await Model.find({
      companyId: req.user.companyId,
    }).sort({
      createdAt: -1,
    });

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


// ==========================================
// GET BY ID
// ==========================================

export const getRecordById = (Model) => async (req, res) => {
  try {
    if (!req.user?.companyId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a company",
      });
    }

    const record = await Model.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
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


// ==========================================
// UPDATE
// ==========================================

export const updateRecord = (Model) => async (req, res) => {
  try {
    if (!req.user?.companyId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a company",
      });
    }

    const updateData = {
      ...req.body,

      // Never allow client to change company
      companyId: req.user.companyId,
    };

    const record = await Model.findOneAndUpdate(
      {
        _id: req.params.id,
        companyId: req.user.companyId,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

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


// ==========================================
// DELETE
// ==========================================

export const deleteRecord = (Model) => async (req, res) => {
  try {
    if (!req.user?.companyId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a company",
      });
    }

    const record = await Model.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

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