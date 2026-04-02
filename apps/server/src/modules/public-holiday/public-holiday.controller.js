export class PublicHolidayController {
  constructor(publicHolidayService) {
    this.publicHolidayService = publicHolidayService;
  }

  getAll = async (req, res) => {
    const result = await this.publicHolidayService.getAllHolidays(req.query);
    res.status(200).json(result);
  };

  getById = async (req, res) => {
    const holiday = await this.publicHolidayService.getHolidayById(req.params.id);
    res.status(200).json(holiday);
  };

  create = async (req, res) => {
    const holiday = await this.publicHolidayService.createHoliday(req.body);
    res.status(201).json(holiday);
  };

  update = async (req, res) => {
    const holiday = await this.publicHolidayService.updateHoliday(
      req.body.id,
      req.body,
    );
    res.status(200).json(holiday);
  };

  delete = async (req, res) => {
    await this.publicHolidayService.deleteHoliday(req.body.id);
    res.status(200).json({ message: "Holiday deleted." });
  };
}
