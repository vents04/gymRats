const { StyleSheet } = require('react-native');

module.exports = StyleSheet.create({
    statsContainer: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: 16,
        alignItems: 'center',
    },
    calories: {
        fontFamily: 'SpartanBold',
        fontSize: 20,
        marginTop: 24
    },
    inline: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    macronutrientsCirclesContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    macronutrientsCircles: {
        marginTop: 32
    },
    macronutrientsRatioCircleTitle: {
        fontFamily: "SpartanBold",
        fontSize: 16,
    },
    macroCircleTitle: {
        fontFamily: "SpartanBold",
        fontSize: 12,
        textTransform: "uppercase",
        color: "#ccc",
        marginTop: 8
    }
})