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
        text: {
            type: String,
            min: 1,
            max: 1000,
            required: function() {return this.file.length == 0},
            default: null
        },
        file: {
            type: String,
            required: function() {return this.text.length == 0},
            default: null
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const Message = mongoose.model(DATABASE_MODELS.MESSAGE, messageSchema);
module.exports = Message;