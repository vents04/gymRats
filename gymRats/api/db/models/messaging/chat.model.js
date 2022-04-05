const mongoose = require('mongoose');
const { DATABASE_MODELS, COLLECTIONS, CHAT_STATUSES } = require('../../../global');

const chatSchema = mongoose.Schema({
    personalTrainerId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: COLLECTIONS.PERSONAL_TRAINERS
    },
    clientId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: COLLECTIONS.CLIENTS
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: Object.values(CHAT_STATUSES),
        default: CHAT_STATUSES.ACTIVE
    }
});

const Chat = mongoose.model(DATABASE_MODELS.CHAT, chatSchema);
module.exports = Chat;