const mongoose = require('mongoose');
const { DATABASE_MODELS, WEIGHT_UNITS } = require('../../../global');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        minLength: 3,
        maxLength: 320,
        required: true
    },
    password: {
        type: String,
        minLength: 1,
        maxLength: 255,
        required: true,
    },
    firstName: {
        type: String,
        minLength: 1,
        maxLength: 200,
        required: true
    },
    lastName: {
        type: String,
        minLength: 1,
        maxLength: 200,
        required: true
    },
    profilePicture: {
        type: String,
        optional: true,
        default: null
    },
    verifiedEmail: {
        type: Boolean,
        default: false
    },
    weightUnit: {
        type: String,
        enum: Object.values(WEIGHT_UNITS),
        optional: true,
        default: WEIGHT_UNITS.KILOGRAMS
    },
    lastPasswordReset: {
        type: Number,
        default: Date.now
    },
    createdDt: {
        type: Number,
        default: Date.now
    },
});

const User = mongoose.model(DATABASE_MODELS.USER, userSchema);
module.exports = User;