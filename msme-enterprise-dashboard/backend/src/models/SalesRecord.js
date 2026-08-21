import mongoose from "mongoose";

const salesRecordSchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    revenue: {
      type: Number,
      required: true,
      min: 0,
    },
    customerRegion: {
      type: String,
      default: "Unknown",
    },
    saleDate: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SalesRecord", salesRecordSchema);