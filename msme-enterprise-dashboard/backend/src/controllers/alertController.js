import Alert from "../models/Alert.js";
import RawMaterial from "../models/RawMaterial.js";
import ProductionRecord from "../models/ProductionRecord.js";

export const generateAlerts = async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId is required",
      });
    }

    const generatedAlerts = [];

    const materials = await RawMaterial.find({ companyId });

    for (const material of materials) {
      if (material.currentStock < material.minimumStock) {
        const existingAlert = await Alert.findOne({
          companyId,
          type: "low_stock",
          title: `Low stock: ${material.materialName}`,
          isResolved: false,
        });

        if (!existingAlert) {
          const alert = await Alert.create({
            companyId,
            type: "low_stock",
            severity: "high",
            title: `Low stock: ${material.materialName}`,
            message: `${material.materialName} is below its minimum stock threshold.`,
            sourceDepartment: "raw-materials",
          });

          generatedAlerts.push(alert);
        }
      }
    }

    const productionRecords = await ProductionRecord.find({ companyId });

    for (const record of productionRecords) {
      if (record.actualQuantity > 0) {
        const defectRate =
          record.defectiveQuantity / record.actualQuantity;

        if (defectRate > 0.05) {
          const existingAlert = await Alert.findOne({
            companyId,
            type: "high_defect_rate",
            title: `High defect rate: ${record.productName}`,
            isResolved: false,
          });

          if (!existingAlert) {
            const alert = await Alert.create({
              companyId,
              type: "high_defect_rate",
              severity: "high",
              title: `High defect rate: ${record.productName}`,
              message: `Defect rate exceeded 5% for ${record.productName}.`,
              sourceDepartment: "production",
            });

            generatedAlerts.push(alert);
          }
        }
      }
    }

    return res.json({
      success: true,
      generatedCount: generatedAlerts.length,
      data: generatedAlerts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Alert generation failed",
      error: error.message,
    });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const { companyId } = req.query;

    const alerts = await Alert.find({ companyId }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};