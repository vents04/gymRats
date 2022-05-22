const mongoose = require('mongoose');
const { DATABASE_MODELS } = require('../../../global');

const deviceSchema = mongoose.Schema({
    deviceType: {
        type: String,
        required: true
    },
    osName: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        default: null,
    },
    manufacturer: {
        type: String,
        default: null,
    },
    modelName: {
        type: String,
        default: null,
    },
    modelId: {
        type: String,
        default: null,
    },
    designName: {
        type: String,
        default: null
    },
    productName: {
        type: String,
        default: null,
    },
    deviceYearClass: {
        type: Number,
        default: null,
    },
    totalMemory: {
        type: Number,
        default: null,
    },
    osBuildId: {
        type: String,
        default: null,
    },
    osInternalBuildId: {
        type: String,
        default: null,
    },
    osBuildFingerprint: {
        type: String,
        default: null,
    },
    platformApiLevel: {
        type: Number,
        default: null,
    },
    deviceName: {
        type: String,
        default: null,
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: DATABASE_MODELS.USER
    },
    expoPushNotificationsToken: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const Device = mongoose.model(DATABASE_MODELS.DEVICE, deviceSchema);
module.exports = Device;