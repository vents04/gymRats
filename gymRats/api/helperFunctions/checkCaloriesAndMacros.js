module.exports = function (calories, protein, carbs, fats) {
    const macrosCalories = (protein + carbs) * 4 + fats * 9;
    return Math.abs(macrosCalories / calories - 1) < 0.15;
}