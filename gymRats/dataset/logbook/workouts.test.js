const { default: mongoose } = require("mongoose");
const mongo = require("../../api/db/mongo");
const Session = require("../../api/db/models/logbook/session.model");
const { ONE_MONTH_TO_MILLISECONDS, WEIGHT_UNITS, ONE_DAY_TO_MILLISECONDS, COLLECTIONS } = require("../../api/global");
const DbService = require("../../api/services/db.service");
const {
  generateRandomWeightsOrDatesInRange,
  generateRandomDatesWithProximityToPrevious,
} = require("./workoutGeneratorSchema");
mongo.connect();
let dt = new Date().getTime();
const userId = mongoose.Types.ObjectId("62c97a01d4ffec1dbd9e4d32");
let test = [];
function generateRandomSessionExercises(lastSession) {
  let exercisesForNextSession = [];
  for (let index = 0; index < lastSession.exercises.length; index++) {
    let setsForCurrentExercise = lastSession.exercises[index].sets;
    let currentExerciseId = lastSession.exercises[index].exerciseId;
    let currentExerciseSets = [];
    for (let y = 0; y < setsForCurrentExercise.length; y++) {
      let currentSetReps = setsForCurrentExercise[y].reps;
      let currentSetAmount = setsForCurrentExercise[y].amount;
      let currentSetUnit = setsForCurrentExercise[y].unit;
      currentExerciseSets.push({
        reps: generateRandomWeightsOrDatesInRange(
          currentSetReps - 2,
          currentSetReps + 2,
          "weights"
        ),
        weight: {
          amount: generateRandomWeightsOrDatesInRange(
            currentSetAmount - 2,
            currentSetAmount + 2,
            "weights"
          ),
          unit: currentSetUnit,
        },
      });
    }
    let currentExercise = {
      exerciseId: mongoose.Types.ObjectId(currentExerciseId),
      sets: currentExerciseSets,
    };
    exercisesForNextSession.push(currentExercise);
  }
  return exercisesForNextSession;
}

let lastSchema = {
  
  date: new Date(dt).getDate(),
  month: new Date(dt).getMonth(),
  year: new Date(dt).getFullYear(),
  userId: userId,
  exercises: [
    {
      exerciseId: mongoose.Types.ObjectId("6268595cea7e09f348354524"),
      sets: [
        { reps: 8, weight: { amount: 80, unit: WEIGHT_UNITS.KILOGRAMS } },
        { reps: 10, weight: { amount: 74, unit: WEIGHT_UNITS.KILOGRAMS } },
        { reps: 11, weight: { amount: 70, unit: WEIGHT_UNITS.KILOGRAMS } },
      ],
    },
    {
      exerciseId: mongoose.Types.ObjectId("6268595dea7e09f3483549be"),
      sets: [
        {
          reps: 12,
          weight: {
            amount: 25,
            unit: WEIGHT_UNITS.KILOGRAMS,
          },
        },
        {
          reps: 12,
          weight: {
            amount: 22.5,
            unit: WEIGHT_UNITS.KILOGRAMS,
          },
        },
        {
          reps: 12,
          weight: {
            amount: 22.5,
            unit: WEIGHT_UNITS.KILOGRAMS,
          },
        },
      ],
    },
  ],
};
(async function(){
    for (let index = 0; index < 2000; index++) {
        let exercisesForNextSession = generateRandomSessionExercises(lastSchema);
        //console.log(dt)
        let currentSchema = {
          date: new Date(dt).getDate(),
          month: new Date(dt).getMonth(),
          year: new Date(dt).getFullYear(),
          userId: userId,
          exercises: exercisesForNextSession,
        };
      
        lastSchema = currentSchema;
        await DbService.create(COLLECTIONS.WORKOUT_SESSIONS, lastSchema)
        test.push(lastSchema);
        dt+= ONE_DAY_TO_MILLISECONDS;
        
      }
})();


