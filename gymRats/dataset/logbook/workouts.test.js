const { ONE_MONTH_TO_MILLISECONDS } = require("../../api/global");
const { generateRandomWeightsOrDatesInRange, generateRandomDatesWithProximityToPrevious } = require("./workoutGeneratorSchema");

const testArrayWithDates = generateRandomDatesWithProximityToPrevious(200)
console.log(testArrayWithDates);