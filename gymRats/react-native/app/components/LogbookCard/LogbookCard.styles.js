const { StyleSheet } = require('react-native');

module.exports = StyleSheet.create({
    workoutName: {
        fontFamily: 'SpartanBold',
        fontSize: "16px",
        marginTop: "16px",
    },
    exercisesContainer: {
        display: "flex",
        flexDirection: "column",
        marginTop: "16px"
    },
    exercise: {
        fontFamily: "SpartanRegular",
        fontSize: "12px",
        marginVertical: "3px"
    }
});