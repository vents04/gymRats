const mongoose = require('mongoose')

const { DATABASE_MODELS, COLLECTIONS, CONTENT_VISIBILITY, CONTENT_STATUSES } = require('../../../global');

const contentSchema = mongoose.Schema({
    personalTrainerId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: DATABASE_MODELS.PERSONAL_TRAINER
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
        required: true,
    },
    visibility: {
        type: String,
        enum: Object.values(CONTENT_VISIBILITY),
        required: true
    },
    status: {
        type: String,
        enum: Object.keys(CONTENT_STATUSES),
        default: CONTENT_STATUSES.ACTIVE
    },
    createdDt: {
        type: Number,
        default: Date.now
    }
});

const Content = mongoose.model(DATABASE_MODELS.CONTENT, contentSchema);
module.exports = Content;