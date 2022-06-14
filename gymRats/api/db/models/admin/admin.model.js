const mongoose = require('mongoose');
const { DATABASE_MODELS, ADMIN_STATUSES } = require('../../../global');

const adminSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 320
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: ADMIN_STATUSES.ACTIVE
    }
})

const Admin = mongoose.model(DATABASE_MODELS.ADMIN, adminSchema);
module.exports = Admin;