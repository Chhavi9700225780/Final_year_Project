import RawMaterial from "../models/RawMaterial.js";

import {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} from "./crudFactory.js";

export const createRawMaterial = createRecord(RawMaterial);
export const getRawMaterials = getRecords(RawMaterial);
export const getRawMaterial = getRecordById(RawMaterial);
export const updateRawMaterial = updateRecord(RawMaterial);
export const deleteRawMaterial = deleteRecord(RawMaterial);