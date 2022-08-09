const ResponseError = require("../../errors/responseError");
const {
  WEIGHT_UNITS,
  WEIGHT_UNIT_RELATIONS,
  HTTP_STATUS_CODES,
} = require("../../global");

const oneRepMax = require("../../helperFunctions/oneRepMax");

const validateCollectionParameter = (collection, requiresExerciseId) => {
  try {
    if (!collection) throw new ResponseError("Parameter/s with null/undefined value provided", HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    if (!Array.isArray(collection)) throw new ResponseError(`Invalid parameters: ${collection}`, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    for (let element of collection) {
      if (!element || !element.exercises || !Array.isArray(element.exercises) || element.exercises.length == 0)
        throw new ResponseError(`Invalid parameters: ${collection}`, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      for (let exercise of element.exercises) {
        if (!exercise || (requiresExerciseId && !exercise.exerciseId) || !exercise.sets || !Array.isArray(exercise.sets) || exercise.sets.length == 0) 
          throw new ResponseError(`Invalid parameters: ${collection}`, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        for (let set of exercise.sets) {
          if ((set.reps != 0 && !set.reps) || !set.weight || (set.weight.amount != 0 && !set.weight.amount)
            || isNaN(set.weight.amount) || !set.weight.unit || !Object.values(WEIGHT_UNITS).includes(set.weight.unit))
            throw new ResponseError(`Invalid parameters: ${collection}`, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
      }
    }
  } catch (err) {
    throw new ResponseError(err.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
}

const ProgressService = {
  getTemplateProgressVolume: (collection) => {
    return new Promise(async (resolve, reject) => {
      try {
        validateCollectionParameter(collection, false);
        if (collection.length < 2) throw new ResponseError(`Invalid parameters: ${collection}`, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);

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
            err.message || "Internal server error",
            err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
          )
        );
      }
    });
  },

  getTemplateProgress: (collection) => {
    return new Promise(async (resolve, reject) => {
      try {
        validateCollectionParameter(collection, true);
        if (collection.length === 0) throw new ResponseError(`Invalid parameters: ${collection}`, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);

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
            err.message || "Internal server error",
            err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
          )
        );
      }
    });
  },

  returnPercentage: (firstCollection, secondCollection) => {
    if ((firstCollection != 0 && secondCollection != 0) && (!firstCollection || !secondCollection)) 
      throw new ResponseError("Parameter/s with null/undefined value provided", HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    return firstCollection > 0
      ? ((secondCollection - firstCollection) / firstCollection) * 100
      : 0;
  },
};

module.exports = ProgressService;