const mongoose = require('mongoose');
const { DATABASE_MODELS } = require('../../../global');

const passwordRecoveryCodeSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: DATABASE_MODELS.USER
    },
    identifier: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    hasBeenUsed: {
        type: Boolean,
        default: false
    },
    createdDt: {
        type: Number,
        default: Date.now
    }
});

const PasswordRecoveryCode = mongoose.model(DATABASE_MODELS.PASSWORD_RECOVERY_CODE, passwordRecoveryCodeSchema);
module.exports = PasswordRecoveryCode;