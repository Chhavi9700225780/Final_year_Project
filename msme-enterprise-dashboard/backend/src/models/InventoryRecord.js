import mongoose from "mongoose";

const inventoryRecordSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    uploadJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadJob",
      default: null,
    },
    productId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    openingStock: {
      type: Number,
      required: true,
      min: 0,
    },
    producedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    soldQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    closingStock: {
      type: Number,
      required: true,
      min: 0,
    },
    warehouse: {
      type: String,
      default: "Main Warehouse",
    },
    recordDate: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("InventoryRecord", inventoryRecordSchema);