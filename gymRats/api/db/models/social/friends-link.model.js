const mongoose = require('mongoose');
const { DATABASE_MODELS } = require('../../../global');

const friendsLinkSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.USER,
        required: true
    },
    linkId: {
        type: String,
        required: true,
    },
    createdDt: {
        type: Number,
        default: Date.now
    }
});

const FriendsLink = mongoose.model(DATABASE_MODELS.FRIENDS_LINK, friendsLinkSchema);
module.exports = FriendsLink;