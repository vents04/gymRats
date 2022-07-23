import { Dimensions, StyleSheet } from "react-native";

export default StyleSheet.create({
    progressCardContainer: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        padding: 16,
        marginBottom: 16
    },
    progressCardHeaderContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16
    },
    progressCardHeader: {
        fontFamily: "MainBold",
        fontSize: 12.8,
        marginLeft: 8,
        textTransform: "uppercase",
        color: "#aaa"
    },
    progressFlagContainer: {
        alignSelf: "flex-start",
        borderRadius: 4,
        padding: 8,
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    progressFlag: {
        fontFamily: "MainBold",
        fontSize: 10,
        textTransform: "uppercase",
        color: "white",
    },
    progressCardTips: {
        marginTop: 16,
    },
    progressCardTipsTitle: {
        fontFamily: "MainBlack",
        textTransform: "uppercase",
        fontSize: 16,
        color: "#262626",
        marginBottom: 8
    },
    progressCardTipContainer: {
        display: "flex",
        flexDirection: "row",
        marginVertical: 10,
        marginRight: 16
    },
    progressCardTip: {
        fontFamily: "MainRegular",
        fontSize: 14,
        marginLeft: 8
    },
    progressCardTipIcon: {
        marginTop: 4
    },
    exercisePicker: {
        borderColor: "#ccc",
        borderRadius: 4
    },
    unknownSourceCaloriesIncentiveContainer: {
        borderColor: "#e7e7e7",
        borderRadius: 4,
        borderWidth: 1,
        padding: 16,
        backgroundColor: "#fafafa",
        marginBottom: 32
    },
    unknownSourceCaloriesIncentiveText: {
        fontFamily: 'MainMedium',
        fontSize: 14,
        color: "#999",
        marginBottom: 14
    },
    tabsContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        borderColor: "#e7e7e7",
        borderRadius: 4,
        borderBottomWidth: 2,
        marginBottom: 32,
    },
    tabTitleContainer: {
        width: '50%',
        padding: 20,
    },
    tabTitle: {
        fontFamily: 'MainBold',
        fontSize: 14,
        textTransform: "uppercase",
        textAlign: "center"
    },
    noFriendsContainer: {
        width: '100%',
        height: '100%',
    },
    noFriendsImage: {
        width: null,
		resizeMode: 'contain',
		height: 300
    },
    noFriendsText: {
        fontFamily: 'MainMedium',
        fontSize: 16,
        textAlign: "center"
    }
})