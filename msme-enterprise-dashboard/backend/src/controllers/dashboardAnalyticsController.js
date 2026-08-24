import ProductionRecord from "../models/ProductionRecord.js";
import FinanceTransaction from "../models/FinanceTransaction.js";
import InventoryRecord from "../models/InventoryRecord.js";
import SalesRecord from "../models/SalesRecord.js";

/*
==================================================
1. PRODUCTION TREND
==================================================
*/

export const getProductionTrend = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId is required",
      });
    }

    const records = await ProductionRecord.find({
      companyId,
    })
      .sort({ productionDate: 1 })
      .lean();

    const grouped = {};

    records.forEach((record) => {
      const date = new Date(
        record.productionDate
      )
        .toISOString()
        .split("T")[0];

      if (!grouped[date]) {
        grouped[date] = {
          date,
          planned: 0,
          actual: 0,
          defective: 0,
        };
      }

      grouped[date].planned +=
        Number(record.plannedQuantity) || 0;

      grouped[date].actual +=
        Number(record.actualQuantity) || 0;

      grouped[date].defective +=
        Number(record.defectiveQuantity) || 0;
    });

    const data = Object.values(grouped);

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(
      "Production trend error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate production trend",
      error: error.message,
    });
  }
};


/*
==================================================
2. FINANCE TREND
==================================================
*/

export const getFinanceTrend = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId is required",
      });
    }

    const records =
      await FinanceTransaction.find({
        companyId,
      })
        .sort({ transactionDate: 1 })
        .lean();

    const grouped = {};

    records.forEach((record) => {
      const date = new Date(
        record.transactionDate
      )
        .toISOString()
        .split("T")[0];

      if (!grouped[date]) {
        grouped[date] = {
          date,
          revenue: 0,
          expenses: 0,
        };
      }

      const amount =
        Number(record.amount) || 0;

      if (
        record.transactionType ===
        "revenue"
      ) {
        grouped[date].revenue += amount;
      }

      if (
        record.transactionType ===
        "expense"
      ) {
        grouped[date].expenses += amount;
      }
    });

    const data = Object.values(grouped);

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(
      "Finance trend error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate finance trend",
      error: error.message,
    });
  }
};


/*
==================================================
3. INVENTORY OVERVIEW
==================================================
*/
export const getInventoryOverview = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId is required",
      });
    }

    const records = await InventoryRecord.find({
      companyId,
    })
      .sort({ createdAt: 1 })
      .lean();

    const data = records.map((record) => {
      const closingStock = Number(record.closingStock) || 0;

      const openingStock = Number(record.openingStock) || 0;

      const producedQuantity =
        Number(record.producedQuantity) || 0;

      const soldQuantity =
        Number(record.soldQuantity) || 0;

      /*
       * Maximum stock used by the dashboard bar.
       *
       * We use the highest meaningful stock value
       * available for this inventory record.
       */
      const max = Math.max(
        openingStock,
        closingStock,
        producedQuantity,
        1
      );

      return {
        product: record.productName || "Unknown Product",

        units: closingStock,

        max,

        // Keep the original backend values too
        productId: record.productId,

        openingStock,

        producedQuantity,

        soldQuantity,

        closingStock,

        warehouse:
          record.warehouse || "Main Warehouse",
      };
    });

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(
      "Inventory overview error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate inventory overview",
      error: error.message,
    });
  }
};

/*
==================================================
4. SALES BY REGION
==================================================
*/

export const getSalesByRegion = async (
  req,
  res
) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId is required",
      });
    }

    const records =
      await SalesRecord.find({
        companyId,
      }).lean();

    const grouped = {};

    records.forEach((record) => {
      const region =
        record.customerRegion ||
        "Unknown";

      if (!grouped[region]) {
        grouped[region] = {
          region,
          revenue: 0,
          quantity: 0,
        };
      }

      grouped[region].revenue +=
        Number(record.revenue) || 0;

      grouped[region].quantity +=
        Number(record.quantity) || 0;
    });

    const data = Object.values(grouped).sort(
      (a, b) =>
        b.revenue - a.revenue
    );

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(
      "Sales region error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate sales region analytics",
      error: error.message,
    });
  }
};