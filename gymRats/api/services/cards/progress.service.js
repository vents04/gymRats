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
        percentageProgress = progressService.returnPercentage(
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
                  ] =0;
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

        console.log(collection);
        for (let exercise of collection[0].exercises) {
          const id = exercise.exerciseId.toString();
          // combined values can be empty objects (fix required) //
          if (arrayWithVolumeAndOneRepMaxForEveryExerciseCombined1[id] && arrayWithVolumeAndOneRepMaxForEveryExerciseCombined2[id]) {
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
        }
        resolve(averagePercentage);
      } catch (err) {
        console.log(err);
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
  },
};

(async function kur() {
  let collection = await DbService.getManyWithSortAndLimit(
    COLLECTIONS.WORKOUT_SESSIONS,
    {
      userId: mongoose.Types.ObjectId("62c97a01d4ffec1dbd9e4d32"),
      workoutId: mongoose.Types.ObjectId("62de4f24fd5aebc39423ba8a"),
    },
    {
      year: -1,
      month: -1,
      date: -1,
    },
    2
  );
  console.log(collection)
  let result = await ProgressService.getTemplateProgress(collection);
  console.log(result)
})();

module.exports = ProgressService;
