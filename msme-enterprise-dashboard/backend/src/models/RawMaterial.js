import mongoose from "mongoose";

const rawMaterialSchema = new mongoose.Schema(
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
    materialId: {
      type: String,
      required: true,
    },
    materialName: {
      type: String,
      required: true,
    },
    supplier: {
      type: String,
      required: true,
    },
    currentStock: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumStock: {
      type: Number,
      required: true,
      min: 0,
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("RawMaterial", rawMaterialSchema);