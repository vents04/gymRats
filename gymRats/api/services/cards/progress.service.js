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
        averageVolumeForFirstHalfSessions =
          averageVolumeForFirstHalfSessions / (collection.length / 2);
        averageVolumeForSecondHalfSessions =
          averageVolumeForSecondHalfSessions / (collection.length / 2);
        percentageProgress = ProgressService.returnPercentage(
          averageVolumeForFirstHalfSessions,
          averageVolumeForSecondHalfSessions
        );
        console.log(percentageProgress);
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
      try {
        const workoutTemplateId = collection[0].workoutId;
        collection.forEach((item) => {
          if (
            workoutTemplateId !== undefined &&
            item.workoutId.toString() != workoutTemplateId
          ) {
            throw new Error(
              "Not all elements in the collection have the same workoutId"
            );
          }
        });

        const workoutTemplate = DbService.getById(
          COLLECTIONS.WORKOUTS,
          workoutTemplateId
        );

        let arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1 = {};
        let arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2 = {};

        for (let index = 0; index < collection.length; index++) {
          for (const exercise of collection[index]) {
            let exerciseVolume = 0;
            let exerciseOneRepMax = 0;
            let name = exercise.exerciseId.toString();
            for (const set of exercise.sets) {
              const reps = set.reps;
              const amount = set.weight.amount;
              const unit = set.weight.unit;
              let currentOneRepMax = oneRepMax(amount, reps);
              if (currentOneRepMax > exerciseOneRepMax) {
                exerciseOneRepMax = currentOneRepMax;
              }
              if (index < collection.length / 2) {
                if (
                  !arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2.hasOwnProperty(
                    name
                  )
                ) {
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[name] =
                    {};
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[name][
                    "volume"
                  ] = reps * amount;
                } else {
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[name][
                    "volume"
                  ] += reps * amount;
                }
              } else {
                if (
                  !arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1.hasOwnProperty(
                    name
                  )
                ) {
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[name] =
                    {};
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[name][
                    "volume"
                  ] = reps * amount;
                } else {
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[name][
                    "volume"
                  ] += reps * amount;
                }
              }
            }
            if (index < collection.length / 2) {
              arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[name][
                "oneRepMax"
              ] += exerciseOneRepMax;
            } else {
              arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[name][
                "oneRepMax"
              ] += exerciseOneRepMax;
            }
          }
        }

        for (const exercisesId of workoutTemplate.exercises) {
          let id = exercisesId._id;
          let;
        }
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

  checkIfEqual: (a, b) => {
    const Equal = (a, b) =>
      JSON.stringify(a.sort()) === JSON.stringify(b.sort());
    return Equal;
  },

  returnPercentage: (firstCollection, secondCollection) => {
    let x;
    x = 100 * (secondCollection / firstCollection);
    console.log(x);
    let y = 100 - x;
    if (y > 0) {
      return {
        percentage: Math.abs(y),
        message: `negative`,
      };
    } else if (y < 0) {
      return {
        percentage: Math.abs(y),
        message: `positive`,
      };
    } else if (y === 0) {
      return {
        percentage: 0,
        message: `none`,
      };
    }
  },
};

module.exports = ProgressService;
