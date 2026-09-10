import ProductionRecord from "../models/ProductionRecord.js";
import InventoryRecord from "../models/InventoryRecord.js";
import RawMaterial from "../models/RawMaterial.js";
import FinanceTransaction from "../models/FinanceTransaction.js";
import SalesRecord from "../models/SalesRecord.js";
import Alert from "../models/Alert.js";


// ======================================================
// DASHBOARD SUMMARY
// ======================================================

export const getDashboardSummary = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a company",
      });
    }

    const companyFilter = {
      companyId,
    };

    const [
      production,
      inventory,
      materials,
      finances,
      sales,
      activeAlerts,
    ] = await Promise.all([
      ProductionRecord.find(companyFilter).lean(),

      InventoryRecord.find(companyFilter).lean(),

      RawMaterial.find(companyFilter).lean(),

      FinanceTransaction.find(companyFilter).lean(),

      SalesRecord.find(companyFilter).lean(),

      Alert.countDocuments({
        companyId,
        isResolved: false,
      }),
    ]);


    // ==================================================
    // PRODUCTION
    // ==================================================

    const totalPlannedProduction =
      production.reduce(
        (sum, item) =>
          sum +
          (Number(item.plannedQuantity) || 0),
        0
      );


    const totalActualProduction =
      production.reduce(
        (sum, item) =>
          sum +
          (Number(item.actualQuantity) || 0),
        0
      );


    const totalDefects =
      production.reduce(
        (sum, item) =>
          sum +
          (Number(item.defectiveQuantity) || 0),
        0
      );


    const productionEfficiency =
      totalPlannedProduction === 0
        ? 0
        : (totalActualProduction /
            totalPlannedProduction) *
          100;


    const defectRate =
      totalActualProduction === 0
        ? 0
        : (totalDefects /
            totalActualProduction) *
          100;


    // ==================================================
    // INVENTORY
    // ==================================================

    const totalInventoryUnits =
      inventory.reduce(
        (sum, item) =>
          sum +
          (Number(item.closingStock) || 0),
        0
      );


    // ==================================================
    // RAW MATERIALS
    // ==================================================

    const rawMaterialInventoryValue =
      materials.reduce(
        (sum, item) =>
          sum +
          (Number(item.currentStock) || 0) *
          (Number(item.unitCost) || 0),
        0
      );


    // ==================================================
    // FINANCE
    // ==================================================

    const financeRevenue =
      finances
        .filter(
          (item) =>
            String(
              item.transactionType || ""
            ).toLowerCase() === "revenue"
        )
        .reduce(
          (sum, item) =>
            sum +
            (Number(item.amount) || 0),
          0
        );


    const totalExpenses =
      finances
        .filter(
          (item) =>
            String(
              item.transactionType || ""
            ).toLowerCase() === "expense"
        )
        .reduce(
          (sum, item) =>
            sum +
            (Number(item.amount) || 0),
          0
        );


    // ==================================================
    // SALES
    // ==================================================

    const salesRevenue =
      sales.reduce(
        (sum, item) =>
          sum +
          (Number(item.revenue) || 0),
        0
      );


    // ==================================================
    // RESPONSE
    // ==================================================

    return res.json({
      success: true,

      data: {
        totalPlannedProduction,

        totalActualProduction,

        productionEfficiency:
          Number(
            productionEfficiency.toFixed(2)
          ),

        defectRate:
          Number(
            defectRate.toFixed(2)
          ),

        totalInventoryUnits,

        rawMaterialInventoryValue,

        financeRevenue,

        salesRevenue,

        totalExpenses,

        estimatedProfit:
          financeRevenue -
          totalExpenses,

        activeAlerts,
      },
    });

  } catch (error) {

    console.error(
      "Dashboard summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to calculate dashboard summary",
      error: error.message,
    });
  }
};


// ======================================================
// PRODUCTION TREND
// ======================================================

export const getProductionTrend = async (req, res) => {
  try {

    const companyId =
      req.user.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message:
          "User is not associated with a company",
      });
    }


    const records =
      await ProductionRecord.find({
        companyId,
      })
        .sort({
          productionDate: 1,
        })
        .lean();


    const monthlyData = {};


    records.forEach((item) => {

      if (!item.productionDate) {
        return;
      }


      const date =
        new Date(item.productionDate);


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return;
      }


      const month =
        date.toLocaleString(
          "en-US",
          {
            month: "short",
          }
        );


      if (!monthlyData[month]) {

        monthlyData[month] = {
          month,
          planned: 0,
          actual: 0,
        };

      }


      monthlyData[month].planned +=
        Number(
          item.plannedQuantity
        ) || 0;


      monthlyData[month].actual +=
        Number(
          item.actualQuantity
        ) || 0;

    });


    return res.json({
      success: true,
      data:
        Object.values(
          monthlyData
        ),
    });

  } catch (error) {

    console.error(
      "Production trend error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to calculate production trend",
      error: error.message,
    });
  }
};


// ======================================================
// FINANCE TREND
// ======================================================

export const getFinanceTrend = async (req, res) => {
  try {

    const companyId =
      req.user.companyId;


    if (!companyId) {
      return res.status(400).json({
        success: false,
        message:
          "User is not associated with a company",
      });
    }


    const records =
      await FinanceTransaction.find({
        companyId,
      })
        .sort({
          transactionDate: 1,
        })
        .lean();


    const monthlyData = {};


    records.forEach((item) => {

      if (!item.transactionDate) {
        return;
      }


      const date =
        new Date(
          item.transactionDate
        );


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return;
      }


      const month =
        date.toLocaleString(
          "en-US",
          {
            month: "short",
          }
        );


      if (!monthlyData[month]) {

        monthlyData[month] = {
          month,
          revenue: 0,
          expenses: 0,
        };

      }


      const amount =
        Number(item.amount) || 0;


      const type =
        String(
          item.transactionType || ""
        ).toLowerCase();


      if (type === "revenue") {
        monthlyData[month].revenue +=
          amount;
      }


      if (type === "expense") {
        monthlyData[month].expenses +=
          amount;
      }

    });


    return res.json({
      success: true,
      data:
        Object.values(
          monthlyData
        ),
    });

  } catch (error) {

    console.error(
      "Finance trend error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to calculate finance trend",
      error: error.message,
    });
  }
};


// ======================================================
// INVENTORY OVERVIEW
// ======================================================
// ======================================================
// INVENTORY OVERVIEW
// ======================================================

export const getInventoryOverview = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a company",
      });
    }

    const records = await InventoryRecord.find({
      companyId,
    })
      .sort({ record_date: 1 })
      .lean();

    const data = records.map((item) => ({
      // Actual field stored in MongoDB
      product:
        item.itemName ||
        item.productName ||
        "Unknown Product",

      // Actual closing stock
      units:
        Number(item.closingStock) || 0,

      // Use opening stock as the dashboard
      // reference capacity
      max:
        Number(item.openingStock) ||
        Number(item.closingStock) ||
        0,
    }));

    console.log(
      "Dashboard Inventory Overview:",
      data
    );

    return res.json({
      success: true,
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
        "Failed to calculate inventory overview",
      error: error.message,
    });
  }
};
// ======================================================
// SALES BY REGION
// ======================================================
// ======================================================
// SALES BY REGION
// ======================================================

export const getSalesRegions = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a company",
      });
    }

    const records = await SalesRecord.find({
      companyId,
    }).lean();

    const regionTotals = {};

    records.forEach((item) => {
      // Canonical SalesRecord field
      const region =
        item.customerRegion ||
        "Unknown";

      const revenue =
        Number(item.revenue) || 0;

      if (!regionTotals[region]) {
        regionTotals[region] = 0;
      }

      regionTotals[region] += revenue;
    });

    const totalRevenue = Object.values(
      regionTotals
    ).reduce(
      (sum, value) => sum + value,
      0
    );

    const data = Object.entries(
      regionTotals
    ).map(([region, revenue]) => ({
      region,
      revenue,
      pct:
        totalRevenue > 0
          ? Number(
              (
                (revenue / totalRevenue) *
                100
              ).toFixed(2)
            )
          : 0,
    }));

    console.log(
      "Dashboard Sales By Region:",
      data
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Sales regions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to calculate sales regions",
      error: error.message,
    });
  }
};