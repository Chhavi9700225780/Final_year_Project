
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// AUTH
export const login = (email, password) =>
  API.post("/auth/login", { email, password });

export const getCurrentUser = () =>
  API.get("/auth/me");

export const logout = () =>
  API.post("/auth/logout");

// DASHBOARD
export const getDashboardSummary = () =>
  API.get("/dashboard/summary");

export const getProductionTrend = () =>
  API.get("/dashboard/production-trend");

export const getFinanceTrend = () =>
  API.get("/dashboard/finance-trend");

export const getInventoryOverview = () =>
  API.get("/dashboard/inventory-overview");

export const getSalesRegions = () =>
  API.get("/dashboard/sales-regions");

// PRODUCTION
export const getProductions = () =>
  API.get("/production");

// INVENTORY
export const getInventory = () =>
  API.get("/inventory");

// RAW MATERIALS
export const getRawMaterials = () =>
  API.get("/raw-materials");

// FINANCE
export const getFinance = () =>
  API.get("/finance");

export const getFinanceTransactions = () =>
  API.get("/finance");

// SALES
export const getSales = () =>
  API.get("/sales");

// ALERTS
export const getAlerts = () =>
  API.get("/alerts");

// DATASET UPLOAD
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

export default API;
