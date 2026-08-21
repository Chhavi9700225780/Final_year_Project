import ProductionRecord from "../models/ProductionRecord.js";
import InventoryRecord from "../models/InventoryRecord.js";
import RawMaterial from "../models/RawMaterial.js";
import FinanceTransaction from "../models/FinanceTransaction.js";
import SalesRecord from "../models/SalesRecord.js";
import Alert from "../models/Alert.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId is required",
      });
    }

    const companyFilter = { companyId };

    const [
      production,
      inventory,
      materials,
      finances,
      sales,
      activeAlerts,
    ] = await Promise.all([
      ProductionRecord.find(companyFilter),
      InventoryRecord.find(companyFilter),
      RawMaterial.find(companyFilter),
      FinanceTransaction.find(companyFilter),
      SalesRecord.find(companyFilter),
      Alert.countDocuments({
        companyId,
        isResolved: false,
      }),
    ]);

    const totalPlannedProduction = production.reduce(
      (sum, item) => sum + item.plannedQuantity,
      0
    );

    const totalActualProduction = production.reduce(
      (sum, item) => sum + item.actualQuantity,
      0
    );

    const totalDefects = production.reduce(
      (sum, item) => sum + item.defectiveQuantity,
      0
    );

    const productionEfficiency =
      totalPlannedProduction === 0
        ? 0
        : (totalActualProduction / totalPlannedProduction) * 100;

    const defectRate =
      totalActualProduction === 0
        ? 0
        : (totalDefects / totalActualProduction) * 100;

    const inventoryValue = inventory.reduce(
      (sum, item) => sum + item.closingStock,
      0
    );

    const rawMaterialValue = materials.reduce(
      (sum, item) => sum + item.currentStock * item.unitCost,
      0
    );

    const financeRevenue = finances
      .filter((item) => item.transactionType === "revenue")
      .reduce((sum, item) => sum + item.amount, 0);

    const totalExpenses = finances
      .filter((item) => item.transactionType === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    const salesRevenue = sales.reduce(
      (sum, item) => sum + item.revenue,
      0
    );

    return res.json({
      success: true,

      data: {
        totalPlannedProduction,
        totalActualProduction,

        productionEfficiency: Number(
          productionEfficiency.toFixed(2)
        ),

        defectRate: Number(defectRate.toFixed(2)),

        totalInventoryUnits: inventoryValue,

        rawMaterialInventoryValue: rawMaterialValue,

        financeRevenue,

        salesRevenue,

        totalExpenses,

        estimatedProfit: financeRevenue - totalExpenses,

        activeAlerts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to calculate dashboard summary",
      error: error.message,
    });
  }
};