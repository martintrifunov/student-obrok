import { createReadStream } from "fs";

export class ReportController {
  constructor(reportService) {
    this.reportService = reportService;
  }

  create = async (req, res) => {
    const userId = req.user;
    const filters = req.body;
    const result = await this.reportService.createJob(userId, filters);
    res.status(202).json(result);
  };

  getStatus = async (req, res) => {
    const userId = req.user;
    const { jobId } = req.params;
    const result = await this.reportService.getJobStatus(jobId, userId);
    res.status(200).json(result);
  };

  cancel = async (req, res) => {
    const userId = req.user;
    const { jobId } = req.params;
    const result = await this.reportService.cancelJob(jobId, userId);
    res.status(200).json(result);
  };

  download = async (req, res) => {
    const userId = req.user;
    const { jobId } = req.params;
    const { filePath, fileName } = await this.reportService.downloadReport(jobId, userId);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    createReadStream(filePath).pipe(res);
  };
}
