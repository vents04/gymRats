const mongoose = require('mongoose');

const { WEIGHT_UNITS, COLLECTIONS, DATABASE_MODELS } = require('../../../global');

const dailyWeightSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: COLLECTIONS.USERS
    },
    weight: {
        type: Number,
        required: true,
        min: 2.1,
        max: 635
    },
    unit: {
        type: String,
        required: true,
        enum: Object.values(WEIGHT_UNITS)
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