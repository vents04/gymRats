const { StyleSheet } = require('react-native');

module.exports = StyleSheet.create({
    workoutName: {
        fontFamily: 'SpartanBold',
        fontSize: 20,
        marginTop: 16,
    },
    exercisesContainer: {
        display: "flex",
        flexDirection: "column",
        marginTop: 16
    },
    exercise: {
        fontFamily: "SpartanRegular",
        fontSize: 12,
        marginVertical: 3
    }
});