import SalesRecord from "../models/SalesRecord.js";

import {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} from "./crudFactory.js";

export const createSale = createRecord(SalesRecord);
export const getSales = getRecords(SalesRecord);
export const getSale = getRecordById(SalesRecord);
export const updateSale = updateRecord(SalesRecord);
export const deleteSale = deleteRecord(SalesRecord);