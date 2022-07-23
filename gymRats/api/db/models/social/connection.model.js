const mongoose = require('mongoose');
const { DATABASE_MODELS, CONNECTION_STATUSES} = require('../../../global');

const connectionSchema = mongoose.Schema({
    initiatorId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.USER,
        required: true,
    },
    recieverId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: DATABASE_MODELS.USER
    },
    status: {
        type: String,
        enum: Object.values(CONNECTION_STATUSES),
        default: CONNECTION_STATUSES.REQUESTED
    },
    createdDt: {
        type: Date,
        default: Date.now
    },
});

const Connection = mongoose.model(DATABASE_MODELS.CONNECTION, connectionSchema);
module.exports = Connection;