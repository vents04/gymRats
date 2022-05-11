const mongoose = require('mongoose');
const { DATABASE_MODELS } = require('../../../global');

const navigationSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    time: {
        type: Number,
        required: true
    },
    toDt: {
        type: Number,
        required: true
    },
    token: {
        type: String,
        default: null
    }
})

const Navigation = mongoose.model(DATABASE_MODELS.NAVIGATION, navigationSchema);
module.exports = Navigation;