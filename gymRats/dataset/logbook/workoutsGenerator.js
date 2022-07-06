const mongoose = require("mongoose");
const COMMAND_VOLUME = "volume";
const COMMAND_STRENGTH = "strength";
const COMMAND_COMBINED_PROGRESS = "combined progress";
const arr = ["bench press", {repetitions:10, weight:55}, 
{repetitions: 10, weight:60},
{repetitions:4, weight:70},
{repetitions:3, weight:70}]
const generatedWorkout = [arr];
let d = combinedVolumeOfTheExercises(generatedWorkout, COMMAND_VOLUME);
console.log(generatedWorkout)
let m = combinedVolumeOfTheExercises(generatedWorkout,COMMAND_STRENGTH)

function combinedVolumeOfTheExercises (workout, command){
    if(command ===COMMAND_VOLUME){
    let workoutClone = workout;
    let combinedVolume = 0;
    while(workoutClone.length> 0){
    const exercise = workoutClone.shift();
    const name = exercise.shift();
    while(exercise.length > 0){
        const {repetitions,weight} = exercise.shift();
        combinedVolume+= repetitions*weight;
    }
}
console.log(generatedWorkout)
    return combinedVolume;
}
else if(command === COMMAND_STRENGTH){
    let workoutClone = workout;
    let combinedStrength = 0;
    while(workoutClone.length> 0){
        const exercise = workoutClone.shift();
        const name = exercise.shift();
        let lastOneRepMax = 0;
        while(exercise.length > 0){
            const {repetitions,weight} = exercise.shift();
            let oneRepMax = weight * (1 + (repetitions/ 30));
            if (oneRepMax > lastOneRepMax) {
                lastOneRepMax = oneRepMax;
                combinedStrength+= oneRepMax;
            }else{
                continue;
            }
        }
}
return combinedStrength;
}else{
    throw new Error("invalid Data")
}
}

console.log(d)
console.log(m)


