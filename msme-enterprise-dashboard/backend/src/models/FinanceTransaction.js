import mongoose from "mongoose";

const financeTransactionSchema = new mongoose.Schema(
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
    department: {
      type: String,
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["revenue", "expense"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: "",
    },
    transactionDate: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "FinanceTransaction",
  financeTransactionSchema
);