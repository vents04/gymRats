const mongoose = require('mongoose');
const { COLLECTIONS, DATABASE_MODELS } = require('../../../global');

const workoutSchema = mongoose.Schema({
    name: {
        type: String,
        minLength: 1,
        maxLength: 150,
        required: true,
    },
    exercises: [{
        type: mongoose.Types.ObjectId,
        required: true,
        ref: DATABASE_MODELS.EXERCISE
    }],
    userId: {
        type: mongoose.Types.ObjectId,
        optional: true,
        ref: DATABASE_MODELS.USER
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
    createdDt: {
        type: Number,
        default: Date.now,
    }
});

const Workout = mongoose.model(DATABASE_MODELS.WORKOUT, workoutSchema);
module.exports = Workout;