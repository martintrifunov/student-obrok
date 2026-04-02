export class AnalyticsController {
  constructor(analyticsService) {
    this.analyticsService = analyticsService;
  }

  heartbeat = async (req, res) => {
    const result = await this.analyticsService.trackHeartbeat({
      visitorId: req.visitorId,
      userId: req.user || null,
      path: req.body?.path || req.path,
      isPageView: req.body?.isPageView === true,
      ip: req.ip,
      userAgent: req.headers["user-agent"] || null,
    });

    res.status(200).json(result);
  };

  summary = async (req, res) => {
    const days = req.query.days ? Number(req.query.days) : 30;
    const result = await this.analyticsService.getSummary({ days, activeWindowMinutes: 5 });
    res.status(200).json(result);
  };

  featureTrends = async (req, res) => {
    const days = req.query.days ? Number(req.query.days) : 30;
    const result = await this.analyticsService.getFeatureUsageTrend({ days });
    res.status(200).json(result);
  };

  exportCsv = async (req, res) => {
    const days = req.query.days ? Number(req.query.days) : 30;
    const { csv, fileName } = await this.analyticsService.exportSummaryCsv({
      days,
      activeWindowMinutes: 5,
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.status(200).send(csv);
  };
}
