import mongoose from "mongoose";

const uploadJobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },

    storedFileName: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      enum: [
        "production",
        "inventory",
        "raw-materials",
        "finance",
        "sales",
      ],
      required: true,
    },

    fileHash: {
      type: String,
      required: true,
    },

    recordCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "processing",
        "completed",
        "failed",
      ],
      default: "processing",
    },

    errorMessage: {
      type: String,
      default: "",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// Duplicate Protection
// ==========================================

uploadJobSchema.index(
  {
    companyId: 1,
    department: 1,
    fileHash: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "UploadJob",
  uploadJobSchema
);