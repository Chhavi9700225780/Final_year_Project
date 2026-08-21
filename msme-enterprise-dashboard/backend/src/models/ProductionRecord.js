import mongoose from "mongoose";

const productionRecordSchema = new mongoose.Schema(
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
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    plannedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    actualQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    defectiveQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    productionCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    productionDate: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProductionRecord", productionRecordSchema);