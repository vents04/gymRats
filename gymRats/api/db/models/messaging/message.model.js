const mongoose = require('mongoose');
const { DATABASE_MODELS, COLLECTIONS } = require('../../../global');

const messageSchema = mongoose.Schema({
    senderId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: COLLECTIONS.USERS
    },
    chatId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: COLLECTIONS.CHATS
    },
    message: {
        type: String,
        min: 1,
        max: 1000,
        required: function() {return this.file.length == 0}
    },
    file: {
        type: String,
        required: function() {return this.message.length == 0}
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const Message = mongoose.model(DATABASE_MODELS.MESSAGE, messageSchema);
module.exports = Message;