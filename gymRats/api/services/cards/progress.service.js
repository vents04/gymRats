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
              let currentOneRepMax = oneRepMax(amount,reps);
              if (currentOneRepMax>exerciseOneRepMax) {
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
    })
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

