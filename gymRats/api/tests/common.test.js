const ProgressService = require("../services/cards/progress.service");

test('nulls', () => {
    expect.assertions(3);
    expect(ProgressService.getTemplateProgress(null)).resolves.toBe(0);
    expect(ProgressService.getTemplateProgressVolume(null)).resolves.toBe(0);
    expect(ProgressService.returnPercentage(null, null)).toBe(0);
})