const mongoose = require("mongoose");
const ResponseError = require("../../errors/responseError");
const {
  COLLECTIONS,
  WEIGHT_UNITS,
  WEIGHT_UNIT_RELATIONS,
  HTTP_STATUS_CODES,
} = require("../../global");
const DbService = require("../db.service");
const oneRepMax = require("../../helperFunctions/oneRepMax");

const ProgressService = {
  getTemplateProgressVolume: (collection) => {
    return new Promise(async (resolve, reject) => {
      try {
        let averageVolumeForFirstHalfSessions = 0;
        let averageVolumeForSecondHalfSessions = 0;
        let percentageProgress = 0;
        for (
          let workoutSessionIndex = 0;
          workoutSessionIndex < collection.length;
          workoutSessionIndex++
        ) {
          for (let exercise of collection[workoutSessionIndex].exercises) {
            for (let set of exercise.sets) {
              const reps = set.reps;
              if (set.weight.unit == WEIGHT_UNITS.POUNDS)
                set.weight.amount *= WEIGHT_UNIT_RELATIONS.POUNDS.KILOGRAMS;
              const amount = set.weight.amount;
              workoutSessionIndex < collection.length / 2
                ? (averageVolumeForSecondHalfSessions += reps * amount)
                : (averageVolumeForFirstHalfSessions += reps * amount);
            }
          }
        }
        averageVolumeForTheFirstSessions = averageVolumeForTheFirstSessions/(collection.length/2);
        averageVolumeForTheSecondSessions = averageVolumeForTheSecondSessions/(collection.length/2);
        percentageProgress = progressService.returnPercentage(averageVolumeForTheFirstSessions,averageVolumeForTheSecondSessions);
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

  getTemplateProgress: (collection) => {
    return new Promise(async (resolve, reject) => {
      try{
        let averagePercentage = 0;
        let arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1 = {};
        let arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2 = {};

        for (let index = 0; index < collection.length; index++) {
          for (const exercise of collection[index].exercises) {
            let exerciseOneRepMax = 0;
            let id  = (exercise.exerciseId).toString();
            for (const set of exercise.sets) {
              const reps = set.reps;
              const amount = set.weight.amount;
              const unit = set.weight.unit;
              let currentOneRepMax = oneRepMax(amount, reps);
              if (currentOneRepMax > exerciseOneRepMax) {
                exerciseOneRepMax = currentOneRepMax;
              }
               if (index < collection.length/2) {
                if (!arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2.hasOwnProperty(id)) {
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[id] = {};
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[id]["oneRepMax"] = 0;
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[id]["volume"] = reps*amount;
                }else{
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[id]["volume"]+= reps*amount;
                }
               }else{
                if (!arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1.hasOwnProperty(id)) {
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[id] = {};
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[id]["oneRepMax"] = 0;
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[id]["volume"] = reps*amount;
                }else{
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[id]["volume"]+= reps*amount;
                }
              }
            }
            if (index < collection.length/2) {
            arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[id]["oneRepMax"] += exerciseOneRepMax;
            }else{
              arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[id]["oneRepMax"] += exerciseOneRepMax;
            }
          }
        }

        for (const exercise of collection[0].exercises) {
          let id = exercise.exerciseId.toString();
          let volumeForTheFirstSessions = arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[id]["volume"];
          let oneRepMaxForTheFirstSessions = arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[id]["oneRepMax"];
          let volumeForTheSecondSessions = arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[id]["volume"];
          let oneRepMaxForTheSecondSessions = arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[id]["oneRepMax"];
          let percentageForVolume = progressService.returnPercentage(volumeForTheFirstSessions,volumeForTheSecondSessions)
          let percentageForOneRepMax = progressService.returnPercentage(oneRepMaxForTheFirstSessions,oneRepMaxForTheSecondSessions)
          averagePercentage += (percentageForVolume + percentageForOneRepMax)/2;
        }
        resolve(averagePercentage);
      }catch(err){
        reject(
          new ResponseError(
            "Internal server error",
            err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
          )
        );
      }
    });
  },

  returnPercentage: (firstCollection,secondCollection) => {
    let x;
          x = 100*(secondCollection/firstCollection);
          console.log(x)
          let y = 100 -x;
          if (y > 0) {
            y = -y;
            return y
          }else if(y < 0) {
            y = -y;
            return y
          }else if(y === 0){
            return y
          }
  }
   
  
};

