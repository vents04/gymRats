const mongoose = require('mongoose');

const { WEIGHT_UNITS, DATABASE_MODELS } = require('../../../global');

const dailyWeightSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.USER,
        required: true,
    },
    weight: {
        type: Number,
        required: true,
        min: 2.1,
        max: 635
    },
    unit: {
        type: String,
        enum: Object.values(WEIGHT_UNITS),
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
    }
});

const DailyWeight = mongoose.model(DATABASE_MODELS.DAILY_WEIGHT, dailyWeightSchema);
module.exports = DailyWeight;