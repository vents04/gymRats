const oneRepMax = require("../../api/helperFunctions/oneRepMax");
const { testWholeWorkout } = require("./workoutsTemplates");

const COMMAND_VOLUME = "volume";
const COMMAND_STRENGTH = "strength";
const COMMAND_COMBINED_PROGRESS = "combined progress";
const COMMAND_FOR_THREE_SESSIONS = 3;
const COMMAND_FOR_FIVE_SESSIONS = 5;
const COMMAND_FOR_TEN_SESSIONS = 10;

let test1Volume = combinedVolumeAndStrengthOfTheExercises(
    testWholeWorkout,
    COMMAND_STRENGTH,
    COMMAND_FOR_THREE_SESSIONS
);

function combinedVolumeAndStrengthOfTheExercises(
    workouts,
    command,
    numberOfSessions
) {
    let averageVolumeForFirstSessions = 0;
    let averageVolumeForSecondSessions = 0;
    let averageStrengthForFirstSessions = 0;
    let averageStrengthForSecondSessions = 0;

    for (let index = 0; index < workouts.length; index++) {
        let singleWorkout = workouts[index];
        for (let y = 0; y < singleWorkout.length; y++) {
            let singleExercise = singleWorkout[y];
            for (let z = 0; z < singleExercise.length; z++) {
                if (z !== 0) {
                    const { repetitions, weight } = singleExercise[z];
                    if (numberOfSessions > workouts.length) {
                        throw new Error("Not enough sessions");
                    }
                    let startLocationOfFirstSessions =
                        workouts.length - 2 * numberOfSessions;
                    let startLocationOfSecondSessions =
                        workouts.length - numberOfSessions;
                    if (index < startLocationOfFirstSessions) {
                        continue;
                    } else if (
                        index >= startLocationOfFirstSessions &&
                        index < startLocationOfSecondSessions
                    ) {
                        averageVolumeForFirstSessions += repetitions * weight;
                        averageStrengthForFirstSessions += oneRepMax(weight, repetitions);
                    } else if (index >= startLocationOfSecondSessions) {
                        averageVolumeForSecondSessions += repetitions * weight;
                        averageStrengthForSecondSessions += oneRepMax(
                            weight,
                            repetitions
                        );
                    }
                }
            }
        }
    }

    averageVolumeForFirstSessions =
        averageVolumeForFirstSessions / numberOfSessions;
    averageVolumeForSecondSessions =
        averageVolumeForSecondSessions / numberOfSessions;
    averageStrengthForFirstSessions =
        averageStrengthForFirstSessions / numberOfSessions;
    averageStrengthForSecondSessions =
        averageStrengthForSecondSessions / numberOfSessions;

    switch(command) {
        case COMMAND_VOLUME:
            let coefficientForVolume = (
                averageVolumeForSecondSessions / averageVolumeForFirstSessions
            ).toFixed(2);
            return coefficientForVolume;
        case COMMAND_STRENGTH:
            let coefficientForStrength = (
                averageStrengthForSecondSessions / averageStrengthForFirstSessions
            ).toFixed(2);
            return coefficientForStrength;
        default:
            return null;
    }
}
console.log(test1Volume);
