const mongoose = require('mongoose');
const { DATABASE_MODELS } = require('../../../global');

const caloriesCounterDailyGoalSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: DATABASE_MODELS.USER
    },
    calories: {
        type: Number,
        required: true
    },
    protein: {
        type: Number,
        required: true
    },
    carbs: {
        type: Number,
        required: true
    },
    fats: {
        type: Number,
        required: true
    },
    createdDt: {
        type: Number,
        default: Date.now
    }
});

const CaloriesCounterDailyGoal = mongoose.model(DATABASE_MODELS.CALORIES_COUNTER_DAILY_GOAL, caloriesCounterDailyGoalSchema);
module.exports = CaloriesCounterDailyGoal;