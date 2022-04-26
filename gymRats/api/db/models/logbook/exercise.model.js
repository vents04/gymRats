const mongoose = require('mongoose');
const { DATABASE_MODELS } = require('../../../global');

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
        ref: DATABASE_MODELS.USER,
        required: true,
    },
    targetMuscles: [{
        type: String,
        required: true,
    }],
    translations: {
        en: {
            type: String,
            default: null
        },
        bg: {
            type: String,
            default: null
        }
    },
    video: {
        type: String,
        optional: true,
    },
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