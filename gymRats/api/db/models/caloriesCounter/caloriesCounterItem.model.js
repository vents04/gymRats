const mongoose = require('mongoose');
const { DATABASE_MODELS, CALORIES_COUNTER_UNITS } = require('../../../global');

// Calories and macros are per one unit //

const caloriesCounterItem = mongoose.Schema({
    title: {
        type: String,
        minLength: 1,
        maxLength: 300,
        required: true,
    },
    barcode: {
        type: String,
        optional: true,
        unique: true,
    },
    img: {
        type: String,
        optional: true,
    },
    userId: {
        type: mongoose.Types.ObjectId,
        optional: true,
        default: null
    },
    unit: {
        type: String,
        enum: Object.values(CALORIES_COUNTER_UNITS),
        required: true
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
    }
});

const CaloriesCounterItem = mongoose.model(DATABASE_MODELS.CALORIES_COUNTER_ITEM, caloriesCounterItem);
module.exports = CaloriesCounterItem;