import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "low_stock",
        "high_defect_rate",
        "production_shortfall",
        "financial",
        "system",
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    sourceDepartment: {
      type: String,
      required: true,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Alert", alertSchema);