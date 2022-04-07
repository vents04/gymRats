const mongoose = require('mongoose');
const { DATABASE_MODELS, COLLECTIONS} = require('../../../global');

const clientSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: COLLECTIONS.USERS
    },
    personalTrainerId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: COLLECTIONS.PERSONAL_TRAINERS
    },
    from: {
        type: Date,
        default: Date.now
    },
    to: {
        type: Number,
        default: undefined
    },
    hasDataSharingEnabled: {
        type: Boolean,
        default: false
    }
});

const Client = mongoose.model(DATABASE_MODELS.CLIENT, clientSchema);
module.exports = Client;