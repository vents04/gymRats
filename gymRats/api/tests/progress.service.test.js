const ProgressService = require("../services/cards/progress.service")

test('@getTemplateProgressVolume/parameters/length', async () => {
    await expect(ProgressService.getTemplateProgressVolume([])).resolves.toBe(0);
    await expect(ProgressService.getTemplateProgressVolume(["1"])).resolves.toBe(0);
})

test('@getTemplateProgressVolume/parameters/types', async () => {
    await expect(ProgressService.getTemplateProgressVolume([[], []])).rejects.toThrow('Invalid parameters')
    await expect(ProgressService.getTemplateProgressVolume([{}, {}])).rejects.toThrow('Invalid parameters');
    await expect(ProgressService.getTemplateProgressVolume([{ exercises: [] }, { exercises: [] }])).rejects.toThrow('Invalid parameters');
    await expect(ProgressService.getTemplateProgressVolume([
        {
            exercises: [
                {
                    test: []
                }
            ]
        },
        {
            exercises: [
                {
                    test: []
                }
            ]
        }
    ])).rejects.toThrow('Invalid parameters');
    await expect(ProgressService.getTemplateProgressVolume([
        {
            exercises: [
                {
                    sets: [
                        { test: 1 }, { test: 2 }
                    ]
                }
            ]
        },
        {
            exercises: [
                {
                    sets: [
                        { test: 1 }, { test: 2 }
                    ]
                }
            ]
        }
    ])).rejects.toThrow('Invalid parameters');
})

test('@getTemplateProgressVolume/result/value', () => {
})