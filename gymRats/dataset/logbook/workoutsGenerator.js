const oneRepMax = require("../../api/helperFunctions/oneRepMax");
const { testWholeWorkout } = require("./workoutsTemplates");

const COMMAND_VOLUME = "volume";
const COMMAND_STRENGTH = "strength";
const COMMAND_COMBINED_PROGRESS = "combined progress";


let test1Volume = combinedVolumeAndStrengthOfTheExercises(
  testWholeWorkout,
  COMMAND_VOLUME
);

function combinedVolumeAndStrengthOfTheExercises(workouts, command) {
  let averageVolumeForFirstSessions = 0;
  let averageVolumeForSecondSessions = 0;
  let averageStrengthForFirstSessions = 0;
  let averageStrengthForSecondSessions = 0;
  let NumberOfWorkoutsToProcess = workouts.length/2;

  for (let index = 0; index < workouts.length; index++) {
    let singleWorkout = workouts[index];
    for (let y = 0; y < singleWorkout.length; y++) {
      let singleExercise = singleWorkout[y];
      for (let z = 0; z < singleExercise.length; z++) {
        if (z !== 0) {
          const { repetitions, weight } = singleExercise[z];
          
          let startLocationOfFirstSessions = 0;
          let startLocationOfSecondSessions =
            startLocationOfFirstSessions + NumberOfWorkoutsToProcess;
          if (index < startLocationOfSecondSessions) {
            averageVolumeForFirstSessions += repetitions * weight;
            averageStrengthForFirstSessions += oneRepMax(weight, repetitions);
          } else if (index >= startLocationOfSecondSessions) {
            averageVolumeForSecondSessions += repetitions * weight;
            averageStrengthForSecondSessions += oneRepMax(weight, repetitions);
          } 
        }
      }
    }
  }

  averageVolumeForFirstSessions =
    averageVolumeForFirstSessions / NumberOfWorkoutsToProcess;
  averageVolumeForSecondSessions =
    averageVolumeForSecondSessions / NumberOfWorkoutsToProcess;
  averageStrengthForFirstSessions =
    averageStrengthForFirstSessions / NumberOfWorkoutsToProcess;
  averageStrengthForSecondSessions =
    averageStrengthForSecondSessions / NumberOfWorkoutsToProcess;

  switch (command) {
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
