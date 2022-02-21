const mongoose = require('mongoose');
const { DATABASE_MODELS, COLLECTIONS, PERSONAL_TRAINER_STATUSES } = require('../../../global');

const personalTrainerSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: COLLECTIONS.USERS
    },
    timeOfCreation: {
        type: Number,
        default: Date.now
    },
    status: {
        type: String,
        enum: Object.values(PERSONAL_TRAINER_STATUSES),
        default: PERSONAL_TRAINER_STATUSES.INACTIVE
    }
});

const PersonalTrainer = mongoose.model(DATABASE_MODELS.PERSONAL_TRAINER, personalTrainerSchema);
module.exports = PersonalTrainer;