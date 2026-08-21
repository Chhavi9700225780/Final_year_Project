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

export default API;