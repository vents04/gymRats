const mongoose = require('mongoose');
const { DATABASE_MODELS } = require('../../../global');

const unknownSourceCaloriesSchema = mongoose.Schema({
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

        required: true
    },
    calories: {
        type: Number,
        required: true
    },
})

const UnknownSourceCalories = mongoose.model(DATABASE_MODELS.UNKNOWN_SOURCE_CALORIES, unknownSourceCaloriesSchema);
module.exports = UnknownSourceCalories;