import mongoose from "mongoose";

const companySettingsSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true,
      index: true,
    },

    modules: {
      dashboard: {
        type: Boolean,
        default: true,
      },

      production: {
        type: Boolean,
        default: true,
      },

      inventory: {
        type: Boolean,
        default: true,
      },

      rawMaterials: {
        type: Boolean,
        default: true,
      },

      finance: {
        type: Boolean,
        default: true,
      },

      sales: {
        type: Boolean,
        default: true,
      },

      reports: {
        type: Boolean,
        default: true,
      },

      alerts: {
        type: Boolean,
        default: true,
      },
    },

    notifications: {
      lowInventory: {
        type: Boolean,
        default: true,
      },

      productionDefects: {
        type: Boolean,
        default: true,
      },

      salesDrop: {
        type: Boolean,
        default: true,
      },

      failedUploads: {
        type: Boolean,
        default: true,
      },
    },

    companyProfile: {
      industry: {
        type: String,
        default: "",
        trim: true,
      },

      currency: {
        type: String,
        default: "INR",
        trim: true,
      },

      timezone: {
        type: String,
        default: "Asia/Kolkata",
        trim: true,
      },

      dateFormat: {
        type: String,
        default: "DD/MM/YYYY",
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("CompanySettings", companySettingsSchema);