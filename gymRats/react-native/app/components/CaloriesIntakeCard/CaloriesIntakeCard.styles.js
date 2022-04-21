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
    },
    mealContainer: {
        marginVertical: 8
    },
    mealTopBar: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8
    },
    mealTitle: {
        fontFamily: 'SpartanBold',
        fontSize: 16,
        marginBottom: 8
    },
    itemContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        borderRadius: 4,
        borderColor: "#e7e7e7",
        borderWidth: 1,
        marginVertical: 6
    },
    itemContainerLeft: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        width: "80%"
    },
    itemTitle: {
        fontFamily: 'SpartanBold',
        fontSize: 16,
        marginBottom: 8,
    },
    itemAmount: {
        fontFamily: 'SpartanRegular',
        fontSize: 12,
    }
})