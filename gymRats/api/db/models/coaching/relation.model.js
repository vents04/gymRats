const mongoose = require('mongoose');
const { DATABASE_MODELS, RELATION_STATUSES } = require('../../../global');

const relationSchema = mongoose.Schema({
    clientId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: DATABASE_MODELS.USER
    },
    personalTrainerId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: DATABASE_MODELS.PERSONAL_TRAINER
    },
    from: {
        type: Number,
        default: null,
    },
    to: {
        type: Number,
        default: null,
    },
    status: {
        type: String,
        enum: Object.values(RELATION_STATUSES),
        default: RELATION_STATUSES.PENDING_APPROVAL
    },
    createdDt: {
        type: Number,
        default: Date.now
    },
});

const Relation = mongoose.model(DATABASE_MODELS.RELATION, relationSchema);
module.exports = Relation;