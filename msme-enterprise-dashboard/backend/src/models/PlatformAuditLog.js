
import mongoose from "mongoose";

const platformAuditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      immutable: true,
    },

    action: {
      type: String,
      enum: ["COMPANY_ACTIVATED", "COMPANY_DEACTIVATED"],
      required: true,
      immutable: true,
    },

    previousStatus: {
      type: Boolean,
      required: true,
      immutable: true,
    },

    newStatus: {
      type: Boolean,
      required: true,
      immutable: true,
    },

    ipAddress: {
      type: String,
      maxlength: 100,
      default: null,
      immutable: true,
    },

    userAgent: {
      type: String,
      maxlength: 500,
      default: null,
      immutable: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for audit history queries.
platformAuditLogSchema.index({ companyId: 1, createdAt: -1 });
platformAuditLogSchema.index({ createdAt: -1 });

// Prevent ordinary Mongoose update/delete operations.
const blockAuditMutation = function () {
  throw new Error("Platform audit records cannot be modified or deleted.");
};

platformAuditLogSchema.pre("updateOne", blockAuditMutation);
platformAuditLogSchema.pre("updateMany", blockAuditMutation);
platformAuditLogSchema.pre("findOneAndUpdate", blockAuditMutation);
platformAuditLogSchema.pre("deleteOne", blockAuditMutation);
platformAuditLogSchema.pre("deleteMany", blockAuditMutation);
platformAuditLogSchema.pre("findOneAndDelete", blockAuditMutation);

// Reuse the registered model during development reloads.
const PlatformAuditLog =
  mongoose.models.PlatformAuditLog ||
  mongoose.model("PlatformAuditLog", platformAuditLogSchema);

export default PlatformAuditLog;
