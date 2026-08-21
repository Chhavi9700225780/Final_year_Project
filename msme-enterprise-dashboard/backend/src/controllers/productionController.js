import ProductionRecord from "../models/ProductionRecord.js";

import {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} from "./crudFactory.js";

export const createProduction = createRecord(ProductionRecord);
export const getProductions = getRecords(ProductionRecord);
export const getProduction = getRecordById(ProductionRecord);
export const updateProduction = updateRecord(ProductionRecord);
export const deleteProduction = deleteRecord(ProductionRecord);