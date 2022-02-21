const mongoose = require('mongoose');
const { DATABASE_MODELS, COLLECTIONS, REQUEST_STATUSES } = require('../../../global');

const requestSchema = mongoose.Schema({
    initiatorId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: COLLECTIONS.USERS
    },
    recieverId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: COLLECTIONS.USERS
    },
    createdDt: {
        type: Number,
        default: Date.now
    },
    status: {
        type: String,
        enum: Object.values(REQUEST_STATUSES),
        default: REQUEST_STATUSES.NOT_ANSWERED
    }
});

const Request = mongoose.model(DATABASE_MODELS.REQUEST, requestSchema);
module.exports = Request;