import FinanceTransaction from "../models/FinanceTransaction.js";

import {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} from "./crudFactory.js";

export const createFinance = createRecord(FinanceTransaction);
export const getFinances = getRecords(FinanceTransaction);
export const getFinance = getRecordById(FinanceTransaction);
export const updateFinance = updateRecord(FinanceTransaction);
export const deleteFinance = deleteRecord(FinanceTransaction);