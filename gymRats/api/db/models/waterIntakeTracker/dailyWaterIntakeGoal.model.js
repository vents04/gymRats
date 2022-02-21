const mongoose = require('mongoose');

const { WATER_INTAKE_UNITS, DATABASE_MODELS, COLLECTIONS } = require('../../../global');

const dailyWaterIntakeGoalSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: COLLECTIONS.USERS
    },
    amount: {
        type: Number,
        required: true,
    },
    unit: {
        type: String,
        required: true,
        enum: Object.values(WATER_INTAKE_UNITS),
    },
    dt: {
        type: Number,
        default: Date.now
    }
});

const DailyWaterIntakeGoal = mongoose.model(DATABASE_MODELS.DAILY_WATER_INTAKE_GOAL, dailyWaterIntakeGoalSchema);
module.exports = DailyWaterIntakeGoal;