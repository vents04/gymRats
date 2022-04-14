const mongoose = require('mongoose');
const { DATABASE_MODELS } = require('../../../global');

const reviewSchema = mongoose.Schema({
    relationId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.RELATION,
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        required: true,
    },
    review: {
        type: String,
        minLength: 1,
        maxLength: 1000,
        optional: true
    }
});

const Review = mongoose.model(DATABASE_MODELS.REVIEW, reviewSchema);
module.export = Review;