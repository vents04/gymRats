const mongoose = require('mongoose');
const { DATABASE_MODELS, WATER_INTAKE_UNITS, COLLECTIONS } = require('../../../global');

const dailyWaterIntakeSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: COLLECTIONS.USERS
    },
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true,
    },
    goalWaterIntakeId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: COLLECTIONS.DAILY_WATER_INTAKE_GOALS
    }
});

const DailyWaterIntake = mongoose.model(DATABASE_MODELS.DAILY_WATER_INTAKE, dailyWaterIntakeSchema);
module.exports = DailyWaterIntake;