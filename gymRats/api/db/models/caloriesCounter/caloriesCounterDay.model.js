const mongoose = require('mongoose');
const { DATABASE_MODELS, CALORIES_COUNTER_MEALS, CALORIES_COUNTER_ITEM_TYPES } = require('../../../global');

const caloriesCounterDaySchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: DATABASE_MODELS.USER
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
            ref: DATABASE_MODELS.CALORIES_COUNTER_ITEM
        },
        amount: {
            type: Number,
            required: true
        },
        meal: {
            type: String,
            enum: Object.values(CALORIES_COUNTER_MEALS),
            required: true
        },
        itemType: {
            type: String,
            default: CALORIES_COUNTER_ITEM_TYPES.FOOD
        },
        dt: {
            type: Number,
            required: true
        },
    }],
    createdDt: {
        type: Number,
        default: Date.now
    }
});

const CaloriesCounterDay = mongoose.model(DATABASE_MODELS.CALORIES_COUNTER_DAY, caloriesCounterDaySchema);
module.exports = CaloriesCounterDay;