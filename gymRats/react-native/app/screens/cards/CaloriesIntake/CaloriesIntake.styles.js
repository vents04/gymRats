import { StyleSheet } from 'react-native';

export default StyleSheet.create({
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
        fontFamily: 'MainBold',
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
        fontFamily: 'MainBold',
        fontSize: 16,
        marginBottom: 8,
    },
    itemAmount: {
        fontFamily: 'MainRegular',
        fontSize: 12,
        color: "#ccc"
    }
})