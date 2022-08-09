const LogbookService = require("../services/cards/logbook.service");
const ProgressService = require("../services/cards/progress.service");

test('null/undefined', async () => {
    expect.assertions(2);

    await expect(ProgressService.getTemplateProgress(null)).rejects.toThrow('Parameter/s with null/undefined value provided');
    await expect(ProgressService.getTemplateProgressVolume(null)).rejects.toThrow('Parameter/s with null/undefined value provided');
    expect(ProgressService.returnPercentage(null, null)).toThrow('Parameter/s with null/undefined value provided');
})