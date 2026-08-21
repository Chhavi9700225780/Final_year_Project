import Company from "../models/Company.js";

export const createCompany = async (req, res) => {
  try {
    const {
      name,
      industry,
      location,
      employeeCount,
      annualRevenue,
    } = req.body;

    const company = await Company.create({
      name,
      industry,
      location,
      employeeCount,
      annualRevenue,
    });

    return res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: company,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create company",
      error: error.message,
    });
  }
};