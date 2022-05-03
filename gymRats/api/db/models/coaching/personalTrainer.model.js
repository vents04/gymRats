const mongoose = require('mongoose');
const { DATABASE_MODELS, PERSONAL_TRAINER_STATUSES } = require('../../../global');

const personalTrainerSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: DATABASE_MODELS.USER,
        unique: true
    },
    firstName: {
        type: String,
        minLength: 1,
        maxLength: 200,
        required: true
    },
    lastName: {
        type: String,
        minLength: 1,
        maxLength: 200,
        required: true
    },
    location: {
        address: {
            type: String,
            minLength: 1,
            required: true,
        },
        lat: {
            type: Number,
            min: -90,
            max: 90,
            required: true
        },
        lng: {
            type: Number,
            min: -180,
            max: 180,
            required: true
        }
    },
    prefersOfflineCoaching: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: Object.values(PERSONAL_TRAINER_STATUSES),
        default: PERSONAL_TRAINER_STATUSES.PENDING
    },
    createdDt: {
        type: Number,
        default: Date.now
    },
});

const PersonalTrainer = mongoose.model(DATABASE_MODELS.PERSONAL_TRAINER, personalTrainerSchema);
module.exports = PersonalTrainer;