const mongoose = require('mongoose');
const { COLLECTIONS } = require("../global");
const DbService = require("../services/db.service");

async function checkForDistanceAndReviews(trainer, location, reviews, reqLat, reqLng, maxDistance, minRating, distanceForCheck) {

    let reviewsForPush = [];
    let minRatingCopy = 0;
    if(reqLat && reqLng) {
        let lat1 = location.lat;
        let lat2 = reqLat;
        let lng1 = location.lng;
        let lng2 = reqLng;

        lng1 = lng1 * Math.PI / 180;
        lng2 = lng2 * Math.PI / 180;

        lat1 = lat1 * Math.PI / 180;
        lat2 = lat2 * Math.PI / 180;

        let dlon = lng2 - lng1;
        let dlat = lat2 - lat1;
        let a = Math.pow(Math.sin(dlat / 2), 2)
            + Math.cos(lat1) * Math.cos(lat2)
            * Math.pow(Math.sin(dlon / 2), 2);

        let c = 2 * Math.asin(Math.sqrt(a));

        let radius = 6371;

        let distance = c * radius;

        if (maxDistance) {
            if (distance > maxDistance) {
                return -1;
            }
            trainer.criteriasMet++;
        }
        Object.assign(trainer, { distance: distance });
    }


    let sumOfAllRatings = 0, counter = 0, overallRating = 0;
    for (let review of reviews) {
        const relation = await DbService.getOne(COLLECTIONS.RELATIONS, { "$or": [{ _id: review.relationId }, { _id: mongoose.Types.ObjectId(review.relationId) }] });
        if (relation && relation.personalTrainerId.toString() == trainer._id.toString()) {
            sumOfAllRatings += review.rating;
            counter++;
            const clientInstance = await DbService.getById(COLLECTIONS.USERS, relation.clientId);
            review.clientInstance = clientInstance;
            reviewsForPush.push(review);
        }
    }
    if (counter != 0) {
        overallRating = Number.parseFloat(sumOfAllRatings / counter).toFixed(1);
    } else {
        overallRating = 3.0;
    }
    if (minRating) {
        minRatingCopy = minRating;
        if (overallRating < minRating) {
            return -1;
        }
        trainer.criteriasMet++;
    }
    Object.assign(trainer, { rating: overallRating }, { reviews: reviewsForPush });

    if(trainer.distance){
        if (trainer.distance <= distanceForCheck
            && trainer.rating >= ((5 - minRatingCopy) * 0.7 + minRatingCopy)) {
            trainer.criteriasMet += 4
        }
        if (trainer.distance > distanceForCheck
            && trainer.rating >= ((5 - minRatingCopy) * 0.7 + minRatingCopy)) {
            trainer.criteriasMet += 3
        }
        if (trainer.distance <= distanceForCheck
            && trainer.rating < ((5 - minRatingCopy) * 0.7 + minRatingCopy)) {
            trainer.criteriasMet += 2;
        }
        if (trainer.distance > distanceForCheck
            && trainer.rating < ((5 - minRatingCopy) * 0.7 + minRatingCopy)) {
            trainer.criteriasMet += 1;
        }
    }else{
        if (trainer.rating >= ((5 - minRatingCopy) * 0.7 + minRatingCopy)) {
            trainer.criteriasMet += 4
        }
        if (trainer.rating < ((5 - minRatingCopy) * 0.7 + minRatingCopy)) {
            trainer.criteriasMet += 2;
        }
    }
    return 1;

}

module.exports = { checkForDistanceAndReviews }