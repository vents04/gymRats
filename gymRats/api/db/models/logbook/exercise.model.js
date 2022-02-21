const mongoose = require('mongoose');
const { DATABASE_MODELS, COLLECTIONS } = require('../../../global');

const exerciseSchema = mongoose.Schema({
    title: {
        type: String,
        minLength: 1,
        maxLength: 150,
        required: true,
    },
    description: {
        type: String,
        minLength: 1,
        maxLength: 300,
        optional: true,
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    targetMuscles: [{
        type: mongoose.Types.ObjectId,
        ref: COLLECTIONS.MUSCLES,
        optional: true,
    }],
    keywords: [{
        type: String,
        required: true,
    }],
    isPublic: {
        type: Boolean,
        default: false
    }
});

const Exercise = mongoose.model(DATABASE_MODELS.EXERCISE, exerciseSchema);
module.exports = Exercise;