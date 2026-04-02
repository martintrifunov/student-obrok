import { ReportJobModel } from "./report-job.model.js";

export class ReportJobRepository {
  async findById(id) {
    return ReportJobModel.findById(id).exec();
  }

  async findByIdAndUser(id, userId) {
    return ReportJobModel.findOne({ _id: id, requestedBy: userId }).exec();
  }

  async findActiveByUser(userId) {
    return ReportJobModel.findOne({
      requestedBy: userId,
      status: { $in: ["PENDING", "PROCESSING"] },
    }).exec();
  }

  async create(data) {
    return ReportJobModel.create(data);
  }

  async save(job) {
    return job.save();
  }
}
