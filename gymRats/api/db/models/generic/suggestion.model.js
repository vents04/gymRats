const mongoose = require('mongoose');
const { DATABASE_MODELS, SUGGESTIONS_STATUSES } = require('../../../global');

const suggestionSchema = mongoose.Schema({
    suggestion: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(SUGGESTIONS_STATUSES),
        default: SUGGESTIONS_STATUSES.PENDING_REVIEW
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.USER,
        required: true
    },
    createdDt: {
        type: Number,
        default: Date.now
    }
});

const Suggestion = mongoose.model(DATABASE_MODELS.SUGGESTION, suggestionSchema);
module.exports = Suggestion;