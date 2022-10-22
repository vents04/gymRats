module.exports = function (calories, protein, carbs, fats) {
    const macrosCalories = (parseFloat(protein) + parseFloat(carbs)) * 4 + parseFloat(fats).toFixed(2) * 9;
    return Math.abs(macrosCalories > 0 ? (macrosCalories / parseFloat(calories) - 1) : 0) < 0.15;
}