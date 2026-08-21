import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getDashboardSummary = (companyId) =>
  API.get(`/dashboard/summary?companyId=${companyId}`);

export const getProductions = (companyId) =>
  API.get(`/production?companyId=${companyId}`);

export const getInventory = (companyId) =>
  API.get(`/inventory?companyId=${companyId}`);

export const getRawMaterials = (companyId) =>
  API.get(`/raw-materials?companyId=${companyId}`);

export const getFinance = (companyId) =>
  API.get(`/finance?companyId=${companyId}`);

export const getFinanceTransactions = async (companyId) => {
  return API.get(`/finance?companyId=${companyId}`);
};

export const getSales = (companyId) =>
  API.get(`/sales?companyId=${companyId}`);

export const getAlerts = (companyId) =>
  API.get(`/alerts?companyId=${companyId}`);

export const uploadDataset = (file, department) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("department", department);

  return API.post("/uploads", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


export const getProductionTrend = async (companyId) => {
  return API.get(
    `/dashboard/production-trend?companyId=${companyId}`
  );
};

export const getFinanceTrend = async (companyId) => {
  return API.get(
    `/dashboard/finance-trend?companyId=${companyId}`
  );
};

export const getInventoryOverview = async (companyId) => {
  return API.get(
    `/dashboard/inventory-overview?companyId=${companyId}`
  );
};

export const getSalesRegions = async (companyId) => {
  return API.get(
    `/dashboard/sales-regions?companyId=${companyId}`
  );
};



export default API;