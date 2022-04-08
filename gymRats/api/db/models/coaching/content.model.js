const mongoose = require('mongoose');
const { DATABASE_MODELS, CONTENT_VISIBILITY_SCOPES } = require('../../../global');

const contentSchema = mongoose.Schema({
    file: {
        type: String,
        required: true
    },
    personalTrainerId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.PERSONAL_TRAINER,
        required: true
    },
    visibilityScope: {
        type: String,
        enum: Object.values(CONTENT_VISIBILITY_SCOPES),
        required: true
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    section: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 40
    },
    title: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 40
    },
    createdDt: {
        type: Number,
        default: Date.now
    }
});

const Content = mongoose.model(DATABASE_MODELS.CONTENT, contentSchema);
module.exports = Content;