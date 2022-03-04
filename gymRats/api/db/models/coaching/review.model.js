const mongoose = require('mongoose');
const { COLLECTIONS, DATABASE_MODELS } = require('../../../global');

const reviewSchema = mongoose.Schema({
    requestId: {
        type: mongoose.Types.ObjectId,
        ref: COLLECTIONS.REQUESTS,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    review: {
        type: String,
        min: 1,
        max: 1000,
        optional: true
    }
});

const Review = mongoose.model(DATABASE_MODELS.REVIEW, reviewSchema);
module.export = Review;