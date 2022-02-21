const mongoose = require('mongoose');
const { COLLECTIONS, DATABASE_MODELS, CALORIES_COUNTER_MEALS } = require('../../../global');

const caloriesCounterDaySchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: COLLECTIONS.USERS
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
    items: [{
        _id: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        itemId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: COLLECTIONS.ITEMS
        },
        amount: {
            type: Number,
            required: true
        },
        dt: {
            type: Number,
            required: true
        },
        meal: {
            type: String,
            enum: Object.values(CALORIES_COUNTER_MEALS),
            required: true
        }
    }],
    caloriesCounterDailyGoalId: {
        type: mongoose.Types.ObjectId,
        required: true
    }
});

const CaloriesCounterDay = mongoose.model(DATABASE_MODELS.CALORIES_COUNTER_DAY, caloriesCounterDaySchema);
module.exports = CaloriesCounterDay;