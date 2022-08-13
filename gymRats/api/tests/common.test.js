const LogbookService = require("../services/cards/logbook.service");
const ProgressService = require("../services/cards/progress.service");

test('null/undefined', async () => {
    expect.assertions(4);

    await expect(ProgressService.getTemplateProgress(null)).rejects.toThrow('Parameter/s with null/undefined value provided');
    await expect(ProgressService.getTemplateProgressVolume(null)).rejects.toThrow('Parameter/s with null/undefined value provided');
    await expect(ProgressService.getTemplateProgressStrength(null)).rejects.toThrow('Parameter/s with null/undefined value provided');

    try {
        ProgressService.returnPercentage(null, null)
    } catch (err) {
        expect(err).toHaveProperty('message', 'Parameter/s with null/undefined value provided');
    }
})