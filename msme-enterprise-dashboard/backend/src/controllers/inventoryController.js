import InventoryRecord from "../models/InventoryRecord.js";

import {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} from "./crudFactory.js";

export const createInventory =
  createRecord(InventoryRecord);

export const getInventories =
  getRecords(InventoryRecord);

export const getInventory =
  getRecordById(InventoryRecord);

export const updateInventory =
  updateRecord(InventoryRecord);

export const deleteInventory =
  deleteRecord(InventoryRecord);