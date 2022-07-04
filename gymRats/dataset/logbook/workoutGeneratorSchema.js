const mongoose = require('mongoose');

function generateRandomWeightInRange  (min,max){

    return  parseFloat(parseFloat(Math.random()*(max - min) + min).toFixed(2));
}

function generateRandomWeightsWithProximityToPrevious  (weightsCount){
    let generatedWeights = [generateRandomWeightInRange(MIN_WEIGHT,MAX_WEIGHT)];
    while(weightsCount  - 1> 0){
        const lastWeight = generatedWeights[generatedWeights.length -1];
        generatedWeights.push(generateRandomWeightInRange(lastWeight - DEVIATION,lastWeight + DEVIATION))
        weightsCount = weightsCount -1;
    }
    return generatedWeights;
}

function generateRandomDateInRange (min,max){
    return  Math.floor(Math.random()*(max - min) + min);
}


function generateRandomDatesWithProximityToPrevious(datesCount){
    const dt = new Date().getTime()
    let generatedDates = [generateRandomDateInRange(dt,dt + SEVEN_DAYS_TO_MILLISECONDS)];
    while(datesCount  - 1> 0){
        const lastDate = generatedDates[generatedDates.length -1];
        generatedDates.push(generateRandomDateInRange(lastDate + 84000,lastDate + SEVEN_DAYS_TO_MILLISECONDS))
        datesCount --;
    }
    return generatedDates;
}




const MAX_WEIGHT = 150;
const MIN_WEIGHT = 40;
let weights = [];
const DEVIATION = 0.30;
const SEVEN_DAYS_TO_MILLISECONDS = 604800000;
for (let index = 0; index < 200; index++) {
    const UserId = mongoose.Types.ObjectId().toString();
    const userWeights = generateRandomWeightsWithProximityToPrevious(20);
    const userDates = generateRandomDatesWithProximityToPrevious(20);
    for (let y = 0; y < 20; y++) {
       const weight = {
        userId: UserId,
        weight: userWeights[y],
        dt: new Date(userDates[y])
       }
       weights.push(weight);
    }
}

console.log(weights);


    
