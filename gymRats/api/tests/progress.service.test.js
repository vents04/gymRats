const mongoose = require('mongoose');
const { WEIGHT_UNITS } = require("../global");
const ProgressService = require("../services/cards/progress.service")

test('@getTemplateProgressVolume/parameters/length', async () => {
    await expect(ProgressService.getTemplateProgressVolume([])).resolves.toBe(0)
    await expect(ProgressService.getTemplateProgressVolume(["1"])).rejects.toThrow('Invalid parameters');
})

test('@getTemplateProgressStrength/parameters/length', async () => {
    await expect(ProgressService.getTemplateProgressStrength([])).resolves.toBe(0)
    await expect(ProgressService.getTemplateProgressStrength(["1"])).rejects.toThrow('Invalid parameters');
})

test('@getTemplateProgress/parameters/length', async () => {
    await expect(ProgressService.getTemplateProgress([])).resolves.toBe(0)
    await expect(ProgressService.getTemplateProgress(["1"])).rejects.toThrow('Invalid parameters');
})

test('@getTemplateProgressVolume/parameters/types', async () => {
    await expect(ProgressService.getTemplateProgressVolume([[], []])).rejects.toThrow('Invalid parameters')
    await expect(ProgressService.getTemplateProgressVolume([{}, {}])).rejects.toThrow('Invalid parameters');
    await expect(ProgressService.getTemplateProgressVolume([{ exercises: [] }, { exercises: [] }])).rejects.toThrow('Invalid parameters');
    await expect(ProgressService.getTemplateProgressVolume([{ exercises: [] }, { exercises: [{ test: [] }] }])).rejects.toThrow('Invalid parameters');
    await expect(ProgressService.getTemplateProgressVolume([
        {
            exercises: [
                {
                    sets: []
                }
            ]
        },
        {
            exercises: [
                {
                    sets: []
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

test('@getTemplateProgressStrength/parameters/types', async () => {
    await expect(ProgressService.getTemplateProgressStrength([[], []])).rejects.toThrow('Invalid parameters')
    await expect(ProgressService.getTemplateProgressStrength([{}, {}])).rejects.toThrow('Invalid parameters');
    await expect(ProgressService.getTemplateProgressStrength([{ exercises: [] }, { exercises: [] }])).rejects.toThrow('Invalid parameters');
    await expect(ProgressService.getTemplateProgressStrength([{ exercises: [] }, { exercises: [{ test: [] }] }])).rejects.toThrow('Invalid parameters');
    await expect(ProgressService.getTemplateProgressStrength([
        {
            exercises: [
                {
                    sets: []
                }
            ]
        },
        {
            exercises: [
                {
                    sets: []
                }
            ]
        }
    ])).rejects.toThrow('Invalid parameters');
    await expect(ProgressService.getTemplateProgressStrength([
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

test('@getTemplateProgress/parameters/types', async () => {
    await expect(ProgressService.getTemplateProgress([[], []])).rejects.toThrow('Invalid parameters')
    await expect(ProgressService.getTemplateProgress([{}, {}])).rejects.toThrow('Invalid parameters');
    await expect(ProgressService.getTemplateProgress([{ exercises: [] }, { exercises: [] }])).rejects.toThrow('Invalid parameters');
    await expect(ProgressService.getTemplateProgress([{ exercises: [] }, { exercises: [{ test: [] }] }])).rejects.toThrow('Invalid parameters');
    await expect(ProgressService.getTemplateProgress([
        {
            exercises: [
                {
                    sets: []
                }
            ]
        },
        {
            exercises: [
                {
                    sets: []
                }
            ]
        }
    ])).rejects.toThrow('Invalid parameters');
    await expect(ProgressService.getTemplateProgress([
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
    await expect(ProgressService.getTemplateProgress([
        {
            exercises: [
                {
                    exerciseId: "1",
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        },
        {
            exercises: [
                {
                    exerciseId: "2",
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        }
    ])).rejects.toThrow('Invalid parameters');
})

test('@getTemplateProgressVolume/result/value', async () => {
    await expect(ProgressService.getTemplateProgressVolume([
        {
            exercises: [
                {
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        },
        {
            exercises: [
                {
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        }
    ])).resolves.toBe(0)
    await expect(ProgressService.getTemplateProgressVolume([
        {
            exercises: [
                {
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        },
        {
            exercises: [
                {
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 12, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        }
    ])).resolves.toBeCloseTo(10, 5)
    await expect(ProgressService.getTemplateProgressVolume([
        {
            exercises: [
                {
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        },
        {
            exercises: [
                {
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 8, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        }
    ])).resolves.toBeCloseTo(-10, 5)
})

test('@getTemplateProgressStrength/result/value', async () => {
    await expect(ProgressService.getTemplateProgressStrength([
        {
            exercises: [
                {
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        },
        {
            exercises: [
                {
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        }
    ])).resolves.toBe(0)
    await expect(ProgressService.getTemplateProgressStrength([
        {
            exercises: [
                {
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        },
        {
            exercises: [
                {
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 12, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        }
    ])).resolves.toBeCloseTo(5, 5)
    await expect(ProgressService.getTemplateProgressStrength([
        {
            exercises: [
                {
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        },
        {
            exercises: [
                {
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 8, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        }
    ])).resolves.toBe(0)
})

test('@getTemplateProgress/result/value', async () => {
    const id = mongoose.Types.ObjectId();

    await expect(ProgressService.getTemplateProgress([
        {
            exercises: [
                {
                    exerciseId: id,
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        },
        {
            exercises: [
                {
                    exerciseId: id,
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        }
    ])).resolves.toBe(0)
    await expect(ProgressService.getTemplateProgress([
        {
            exercises: [
                {
                    exerciseId: id,
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        },
        {
            exercises: [
                {
                    exerciseId: id,
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 12, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        }
    ])).resolves.toBeCloseTo(7.5, 5)
    await expect(ProgressService.getTemplateProgress([
        {
            exercises: [
                {
                    exerciseId: id,
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        },
        {
            exercises: [
                {
                    exerciseId: id,
                    sets: [
                        { reps: 10, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                        { reps: 8, weight: { unit: WEIGHT_UNITS.KILOGRAMS, amount: 40 } },
                    ]
                }
            ]
        }
    ])).resolves.toBeCloseTo(-5, 5)
})