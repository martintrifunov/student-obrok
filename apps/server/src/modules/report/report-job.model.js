import mongoose from "mongoose";

export const ReportJobStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  ABORTED: "ABORTED",
};

const reportJobSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: String,
      required: true,
    },
    filters: {
      chainId: { type: mongoose.Schema.Types.ObjectId, ref: "Chain", default: null },
      marketId: { type: mongoose.Schema.Types.ObjectId, ref: "Market", default: null },
      from: { type: Date, default: null },
      to: { type: Date, default: null },
    },
    status: {
      type: String,
      enum: Object.values(ReportJobStatus),
      default: ReportJobStatus.PENDING,
    },
    artifact: { type: String, default: null },
    error: { type: String, default: null },
    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

reportJobSchema.index({ requestedBy: 1, status: 1 });
reportJobSchema.index({ createdAt: 1 });

export const ReportJobModel = mongoose.model("ReportJob", reportJobSchema);
