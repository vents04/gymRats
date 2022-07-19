const mongoose = require('mongoose');
const { DATABASE_MODELS, ACCOUNT_DELETION_REQUEST_STATUSES } = require('../../../global');

const accountDeletionRequestSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: DATABASE_MODELS.USER
    },
    createdDt: {
        type: Number,
        default: Date.now
    }
});

const AccountDeletionRequest = mongoose.model(DATABASE_MODELS.ACCOUNT_DELETION_REQUEST, accountDeletionRequestSchema);
module.exports = AccountDeletionRequest;