const mongoose = require('mongoose');
const MAX_WEIGHT = 150;
const MIN_WEIGHT = 40;
const DEVIATION = 0.30;
const SEVEN_DAYS_TO_MILLISECONDS = 604800000;
const ONE_DAY_TO_MILLISECONDS = 84000;
const COMMAND_FOR_WEIGHTS = "weights";
const COMMAND_FOR_DATES = "dates";

function generateRandomWeightsOrDatesInRange(min,max,command){
    if (command === "dates") {
        return  Math.floor(Math.random()*(max - min) + min);
    }else if (command === "weights") {
        return  parseFloat(parseFloat(Math.random()*(max - min) + min).toFixed(2));
    }else{
        throw new Error("Undefined command");
    }
}

function generateRandomWeightsWithProximityToPrevious  (weightsCount){
    let generatedWeights = [generateRandomWeightsOrDatesInRange(MIN_WEIGHT,MAX_WEIGHT, COMMAND_FOR_WEIGHTS)];
    while(weightsCount  - 1> 0){
        const lastWeight = generatedWeights[generatedWeights.length -1];
        generatedWeights.push(generateRandomWeightsOrDatesInRange(lastWeight - DEVIATION,lastWeight + DEVIATION, COMMAND_FOR_WEIGHTS))
        weightsCount = weightsCount -1;
    }
    return generatedWeights;
}

function generateRandomDatesWithProximityToPrevious(datesCount){
    const dt = new Date().getTime()
    let generatedDates = [generateRandomWeightsOrDatesInRange(dt,dt + SEVEN_DAYS_TO_MILLISECONDS, COMMAND_FOR_DATES)];
    while(datesCount  - 1> 0){
        const lastDate = generatedDates[generatedDates.length -1];
        generatedDates.push(generateRandomWeightsOrDatesInRange(lastDate + ONE_DAY_TO_MILLISECONDS,lastDate + SEVEN_DAYS_TO_MILLISECONDS, COMMAND_FOR_DATES))
        datesCount --;
    }
    return generatedDates;
}

function generateRandomTestsForWeight (UserIdCount, weightsForUserID){
for (let index = 0; index < UserIdCount; index++) {
    let weights = [];
    const UserId = mongoose.Types.ObjectId().toString();
    const userWeights = generateRandomWeightsWithProximityToPrevious(20);
    const userDates = generateRandomDatesWithProximityToPrevious(20);
    for (let y = 0; y < weightsForUserID; y++) {
       const weight = {
        userId: UserId,
        weight: userWeights[y],
        dt: new Date(userDates[y])
       }
       weights.push(weight);
    }
    return weights;
}
}

let tests = generateRandomTestsForWeight(200,20)

console.log(tests);


    
