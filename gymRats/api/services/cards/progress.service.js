const { default: mongoose } = require("mongoose");
const ResponseError = require("../../errors/responseError");
const {
  WEIGHT_UNITS,
  WEIGHT_UNIT_RELATIONS,
  HTTP_STATUS_CODES,
  COLLECTIONS,
} = require("../../global");
const oneRepMax = require("../../helperFunctions/oneRepMax");
const DbService = require("../db.service");

const ProgressService = {
  getTemplateProgressVolume: (collection) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!collection || collection.length < 2) return resolve(0);

        let averageVolumeForFirstHalfSessions = 0;
        let averageVolumeForSecondHalfSessions = 0;

        for (
          let workoutSessionIndex = 0;
          workoutSessionIndex < collection.length;
          workoutSessionIndex++
        ) {
          for (let exercise of collection[workoutSessionIndex].exercises) {
            for (let set of exercise.sets) {
              if (set.weight.unit == WEIGHT_UNITS.POUNDS) set.weight.amount *= WEIGHT_UNIT_RELATIONS.POUNDS.KILOGRAMS;
              workoutSessionIndex < collection.length / 2
                ? (averageVolumeForFirstHalfSessions += set.reps * set.weight.amount)
                : (averageVolumeForSecondHalfSessions += set.reps * set.weight.amount);
            }
          }
        }

        averageVolumeForFirstHalfSessions =
          averageVolumeForFirstHalfSessions / (collection.length / 2);
        averageVolumeForSecondHalfSessions =
          averageVolumeForSecondHalfSessions / (collection.length / 2);

        const percentageProgress = ProgressService.returnPercentage(
          averageVolumeForFirstHalfSessions,
          averageVolumeForSecondHalfSessions
        );

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
        if (!collection || collection.length == 0) return resolve(0);

        let averagePercentage = 0;
        let arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1 = {};
        let arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2 = {};

        for (let index = 0; index < collection.length; index++) {
          for (let exercise of collection[index].exercises) {
            let exerciseOneRepMax = 0;
            let id = exercise.exerciseId.toString();
            for (let set of exercise.sets) {
              const reps = set.reps;
              if (set.weight.unit == WEIGHT_UNITS.POUNDS)
                set.weight.amount *= WEIGHT_UNIT_RELATIONS.POUNDS.KILOGRAMS;
              const amount = set.weight.amount;
              const currentOneRepMax = oneRepMax(amount, reps);
              if (currentOneRepMax > exerciseOneRepMax)
                exerciseOneRepMax = currentOneRepMax;
              if (index < collection.length / 2) {
                if (
                  !arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2.hasOwnProperty(
                    id
                  )
                ) {
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[id] = {};
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[id][
                    "oneRepMax"
                  ] = 0;
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[id][
                    "volume"
                  ] = reps * amount;
                } else {
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[id][
                    "volume"
                  ] += reps * amount;
                }
              } else {
                if (
                  !arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1.hasOwnProperty(
                    id
                  )
                ) {
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[id] = {};
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[id][
                    "oneRepMax"
                  ] = 0;
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[id][
                    "volume"
                  ] = reps * amount;
                } else {
                  arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[id][
                    "volume"
                  ] += reps * amount;
                }
              }
            }
            if (index < collection.length / 2) {
              arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[id][
                "oneRepMax"
              ] += exerciseOneRepMax;
            } else {
              arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[id][
                "oneRepMax"
              ] += exerciseOneRepMax;
            }
          }
        }

        for (let exercise of collection[0].exercises) {
          const id = exercise.exerciseId.toString();
          const volumeForTheFirstSessions =
            arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[id]["volume"];
          const oneRepMaxForTheFirstSessions =
            arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[id][
            "oneRepMax"
            ];
          const volumeForTheSecondSessions =
            arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[id]["volume"];
          const oneRepMaxForTheSecondSessions =
            arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[id][
            "oneRepMax"
            ];

          const percentageForVolume = ProgressService.returnPercentage(
            volumeForTheFirstSessions,
            volumeForTheSecondSessions
          );
          const percentageForOneRepMax = ProgressService.returnPercentage(
            oneRepMaxForTheFirstSessions,
            oneRepMaxForTheSecondSessions
          );
          averagePercentage +=
            (percentageForVolume + percentageForOneRepMax) / 2;
        }

        resolve(averagePercentage);
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

  returnPercentage: (firstCollection, secondCollection) => {
    let x;
    x = 100 * (secondCollection / firstCollection);
    let y = 100 - x;
    if (y > 0) {
      y = -y;
      return y;
    } else if (y < 0) {
      y = Math.abs(y);
      return y;
    } else if (y === 0) {
      return y;
    }
    return 0;
  },
};

module.exports = ProgressService;