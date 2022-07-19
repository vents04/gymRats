const mongoose = require("mongoose");
const ResponseError = require("../../errors/responseError");
const {
  COLLECTIONS,
  WEIGHT_UNITS,
  WEIGHT_UNIT_RELATIONS,
  HTTP_STATUS_CODES,
  LOGBOOK_PROGRESS_NOTATIONS,
} = require("../../global");
const DbService = require("../db.service");
const mongo = require("../../db/mongo");
const oneRepMax = require("../../helperFunctions/oneRepMax");
mongo.connect();

const progressService = {
  getTemplateProgressVolume: (collection) => {
    return new Promise(async (resolve, reject) => {
      try {
        let averageVolumeForTheFirstSessions = 0;
        let averageVolumeForTheSecondSessions = 0;
        let percentageProgress = 0;
        for (let index = 0; index < collection.length; index++ ) {
          for (const exercise of collection[index].exercises) {
            for (const set of exercise.sets) {
              const reps = set.reps;
              const amount = set.weight.amount;
              const unit = set.weight.unit; 
              if (index < collection.length /2) {
                averageVolumeForTheSecondSessions+= reps*amount;
              }else{
                averageVolumeForTheFirstSessions+= reps*amount;
              }
            }
          }

        }
        averageVolumeForTheFirstSessions = averageVolumeForTheFirstSessions/(collection.length/2);
        averageVolumeForTheSecondSessions = averageVolumeForTheSecondSessions/(collection.length/2);
        percentageProgress = progressService.returnPercentage(averageVolumeForTheFirstSessions,averageVolumeForTheSecondSessions);
        console.log(percentageProgress)
        resolve(percentageProgress);
        
      } catch (err) {
        reject(
          new ResponseError(
            "Internal server error",
            err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
          )
        );
      }
    });
  },

  getTemplateProgress: (collection) =>{
    return new Promise(async (resolve, reject) => {
      try{
        let workoutTemplate = DbService.getById(COLLECTIONS.WORKOUTS, { _id: mongoose.Types.ObjectId(collection[0].workoutId)})
        let arrayWithVolumeAndOneRepMaxForEveryExerciseAverage1 = {};
        let arrayWithVolumeAndOneRepMaxForEveryExerciseAverage2 = {};
        let arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1 = {};
        let arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2 = {};
        for (let index = 0; index < collection.length; index++) {
          for (const exercise of collection[index]) {
            let exerciseVolume = 0;
            let exerciseOneRepMax = 0;
            let name  = (exercise.exerciseId).toString();
            for (const set of exercise.sets) {
              const reps = set.reps;
              const amount = set.weight.amount;
              const unit = set.weight.unit;
              let currentOneRepMax = oneRepMax(amount,reps);
              if (currentOneRepMax>exerciseOneRepMax) {
                exerciseOneRepMax = currentOneRepMax;
              }
               if (index < collection.length/2) {
                if (!arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2.hasOwnProperty(name)) {
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[name] = {};
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[name]["volume"] = reps*amount;
                }else{
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[name]["volume"]+= reps*amount;
                }
               }else{
                if (!arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1.hasOwnProperty(name)) {
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[name] = {};
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[name]["volume"] = reps*amount;
                }else{
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[name]["volume"]+= reps*amount;
                }
               }
            }
            if (index < collection.length/2) {
            arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[name]["oneRepMax"] += exerciseOneRepMax;
            }else{
              arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[name]["oneRepMax"] += exerciseOneRepMax;
            }
          }
        }

        for (const exercisesId of workoutTemplate.exercises) {
          let id = exercisesId._id;
          let 
        }
      }catch(err){
        reject(
          new ResponseError(
            "Internal server error",
            err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
          )
        );
      }
    })
  },

  checkIfEqual: (a, b) => {
    const Equal = (a, b) =>
      JSON.stringify(a.sort()) === JSON.stringify(b.sort());
    return Equal;
  },

  returnPercentage: (firstCollection,secondCollection) => {
    let x;
          x = 100*(secondCollection/firstCollection);
          console.log(x)
          let y = 100 -x;
          if (y > 0) {
            return ({
              percentage: Math.abs(y),
              message: `negative`
            })
          }else if(y < 0) {
            return ({
              percentage: Math.abs(y),
              message: `positive`
            })
          }else if(y === 0){
            return ({
              percentage: 0,
              message: `none`
            })
          }
  }
   
  
};

 async function kur () { 
  const collectionTest = await  DbService.getManyWithSortAndLimit(COLLECTIONS.WORKOUT_SESSIONS, {
  userId: mongoose.Types.ObjectId("62d6fd17fdba80ae28af4971"),
workoutId: mongoose.Types.ObjectId("62cbde235d524de3e804f953")},
[['year', -1],['month', -1],['date', -1]],
10
);
progressService.getTemplateProgressVolume(collectionTest);
console.log(collectionTest);
}

kur();