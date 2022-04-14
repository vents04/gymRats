const mongoose = require('mongoose');
const { DATABASE_MODELS, CHAT_STATUSES } = require('../../../global');

const chatSchema = mongoose.Schema({
    personalTrainerId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.PERSONAL_TRAINER,
        required: true,
    },
    clientId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: DATABASE_MODELS.USER
    },
    status: {
        type: String,
        enum: Object.values(CHAT_STATUSES),
        default: CHAT_STATUSES.ACTIVE
    },
    createdDt: {
        type: Date,
        default: Date.now
    },
});

const Chat = mongoose.model(DATABASE_MODELS.CHAT, chatSchema);
module.exports = Chat;