const mongoose = require('mongoose');
const { DATABASE_MODELS, COLLECTIONS } = require('../../../global');

const caloriesCounterDailyGoalSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: COLLECTIONS.USERS
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
    dt: {
        type: Number,
        default: Date.now
    }
});

const CaloriesCounterDailyGoal = mongoose.model(DATABASE_MODELS.CALORIES_COUNTER_DAILY_GOAL, caloriesCounterDailyGoalSchema);
module.exports = CaloriesCounterDailyGoal;