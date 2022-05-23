const mongoose = require('mongoose');
const { DATABASE_MODELS } = require('../../../global');

const messageSchema = mongoose.Schema({
    senderId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.USER,
        required: true,
    },
    chatId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.CHAT,
        required: true,
    },
    message: {
        text: {
            type: String,
            min: 1,
            max: 1000,
            required: function () { return this.file.length == 0 },
            default: null
        },
        file: {
            type: {
                originalName: {
                    type: String,
                    default: null
                },
                name: {
                    type: String,
                    default: null
                },
                size: {
                    type: Number,
                    default: null
                },
                mimeType: {
                    type: String,
                    default: null
                },
                extension: {
                    type: String,
                    default: null
                }
            },
            required: function () { return this.text.length == 0 },
            default: null
        }
    },
    seen: {
        type: Boolean,
        default: false
    },
    createdDt: {
        type: Number,
        default: Date.now
    },
});

const Message = mongoose.model(DATABASE_MODELS.MESSAGE, messageSchema);
module.exports = Message;