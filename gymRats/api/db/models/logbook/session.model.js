const mongoose = require('mongoose');
const { DATABASE_MODELS, WEIGHT_UNITS } = require('../../../global');

const sessionSchema = mongoose.Schema({
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
    userId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.USER,
        required: true,
    },
    exercises: [{
        exerciseId: {
            type: mongoose.Types.ObjectId,
            ref: DATABASE_MODELS.EXERCISE,
            required: true,
        },
        sets: [{
            reps: {
                type: Number,
                optional: true,
            },
            weight: {
                amount: {
                    type: Number,
                    required: true,
                },
                unit: {
                    type: String,
                    enum: Object.values(WEIGHT_UNITS),
                    required: true
                },
            },
            duration: {
                type: Number,
                optional: true,
            }
        }],
        note: {
            type: String,
            optional: true,
            default: null
        }
    }],
    workoutId: {
        type: mongoose.Types.ObjectId,
        default: null
    }
});

const Session = mongoose.model(DATABASE_MODELS.WORKOUT_SESSION, sessionSchema);
module.exports = Session;
