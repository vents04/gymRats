async function checkForDistanceAndReviews(trainer, location, reviews, reqLat, reqLng, maxDistance, minRating, distanceForCheck, trainerId){
    
    let reviewsForPush = [];
    let minRatingCopy = 0;
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
            return false
        }
        trainer.criteriasMet++;
    }
    Object.assign(trainer, { distance: distance });


    let sumOfAllRatings = 0, counter = 0, overallRating = 0;
    for (let review of reviews) {
        const relation = await DbService.getOne(COLLECTIONS.RELATIONS, { "$or": [{ _id: review.relationId }, { _id: mongoose.Types.ObjectId(review.relationId) }] });
        if (relation.personalTrainerId.toString() == trainerId.toString()) {
            sumOfAllRatings += review.rating;
            counter++;
            reviewsForPush.push(review);
        }
    }
    if (counter != 0) {
        overallRating = Number.parseFloat(sumOfAllRatings / counter).toFixed(1);
    }
    if (minRating) {
        minRatingCopy = minRating;
        if (overallRating < minRating) {
            return false
        }
        trainer.criteriasMet++;
    }
    Object.assign(trainer, { rating: overallRating}, { reviews: reviewsForPush }, {dasd: "das"});


    if (trainer.distance <= distanceForCheck
        && trainer.rating >= (5 - minRatingCopy) / 2 + minRatingCopy) {
        trainer.criteriasMet += 4
    }
    if (trainer.distance > distanceForCheck
        && trainer.rating >= (5 - minRatingCopy) / 2 + minRatingCopy) {
        trainer.criteriasMet += 3
    }
    if (trainer.distance <= distanceForCheck
        && trainer.rating < (5 - minRatingCopy) / 2 + minRatingCopy) {
        trainer.criteriasMet += 2;
    }
    if (trainer.distance > distanceForCheck
        && trainer.rating < (5 - minRatingCopy) / 2 + minRatingCopy) {
        trainer.criteriasMet += 1;
    }
    return true;

}

module.exports = { checkForDistanceAndReviews }