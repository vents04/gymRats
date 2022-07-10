const { default: mongoose } = require("mongoose");
const Session = require("../../api/db/models/logbook/session.model");
const { ONE_MONTH_TO_MILLISECONDS } = require("../../api/global");
const { generateRandomWeightsOrDatesInRange, generateRandomDatesWithProximityToPrevious } = require("./workoutGeneratorSchema");
let dt = new Date();
const userId = mongoose.Types.ObjectId("62c97a01d4ffec1dbd9e4d32");
for (let index = 0; index < 2; index++) {

    let workoutSession = {
        _id: mongoose.Types.ObjectId(),
        date: dt.getDay(),
        month: dt.getMonth(),
        year: dt.getFullYear(),
        userId: userId,
        exercises: [
            { }
        ]
    }

    let currentSchema = new Session({
        date: dt.getDay(),
        month: dt.getMonth(),
        year: dt.getFullYear(),
        userId: userId,
        exercises: [
            { }
        ]
    })

    dt += 84000;
}