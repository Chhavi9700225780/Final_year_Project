import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
  fingerprint: { type: String, default: undefined, select: false },
  type: { type: String, enum: ["low_stock", "high_defect_rate", "production_shortfall", "financial", "system"], required: true },
  severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  title: { type: String, required: true, maxlength: 160 },
  message: { type: String, required: true, maxlength: 1000 },
  sourceDepartment: { type: String, required: true },
  isResolved: { type: Boolean, default: false },
  resolvedAt: { type: Date, default: null },
}, { timestamps: true });

alertSchema.index({ companyId: 1, fingerprint: 1 }, { unique: true, partialFilterExpression: { fingerprint: { $type: "string" } } });
export default mongoose.models.Alert || mongoose.model("Alert", alertSchema);
