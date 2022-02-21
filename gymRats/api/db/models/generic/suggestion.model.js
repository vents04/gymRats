const mongoose = require('mongoose');
const { DATABASE_MODELS } = require('../../../global');

const suggestionSchema = mongoose.Schema({
    suggestion: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    dt: {
        type: Number,
        default: Date.now
    }
});

const Suggestion = mongoose.model(DATABASE_MODELS.SUGGESTION, suggestionSchema);
module.exports = Suggestion;