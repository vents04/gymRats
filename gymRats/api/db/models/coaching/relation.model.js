const mongoose = require('mongoose');
const { DATABASE_MODELS, COLLECTIONS, RELATION_STATUSES } = require('../../../global');

const relationSchema = mongoose.Schema({
    clientId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: COLLECTIONS.USERS
    },
    personalTrainerId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: COLLECTIONS.PERSONAL_TRAINERS
    },
    from: {
        type: Number,
        default: null,
    },
    to: {
        type: Number,
        default: null,
    },
    createdDt: {
        type: Number,
        default: Date.now
    },
    status: {
        type: String,
        enum: Object.values(RELATION_STATUSES),
        default: RELATION_STATUSES.PENDING_APPROVAL
    },
    hasSubmittedReview: {
        type: Boolean,
        default: false
    }
});

const Relation = mongoose.model(DATABASE_MODELS.RELATION, relationSchema);
module.exports = Relation;