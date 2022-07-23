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
    },
    option: {
        width: '50%',
        display: 'flex',
        alignItems: 'center'
    },
    profilePictureContainer: {
        width: 80,
        height: 80,
        backgroundColor: "#ccc",
        borderRadius: 1000,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 24
    },
    noProfilePictureText: {
        fontFamily: "MainBold",
        fontSize: 20,
        color: "#777",
    },
    names: {
        fontFamily: "MainMedium",
        fontSize: 16,
        color: "#222",
        marginVertical: 16
    },
    modalTopbar: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    chatItemContainer: {
        display: 'flex',
        flexDirection: 'column',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 16,
        marginVertical: 8
    },
    coachRequestInfoContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    requestContainer: {
        display: 'flex',
        flexDirection: 'column',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 16,
        marginVertical: 8
    },
    coachRequestInfoContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePictureContainerRequest: {
        width: 40,
        height: 40,
        backgroundColor: "#ccc",
        borderRadius: 1000,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    noProfilePictureTextRequest: {
        fontFamily: "MainBold",
        fontSize: 10,
        color: "#777",
    },
    chatsItemDetailsContainer: {
        marginLeft: 12,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    chatsItemNames: {
        fontFamily: "MainBold",
        fontSize: 14
    },
    chatsItemLastMessage: {
        fontFamily: "MainRegular",
        fontSize: 10,
        color: "#aaa",
        marginTop: 4
    },
    friendContainer: {
        borderRadius: 4,
        borderColor: "#e7e7e7",
        borderWidth: 2,
        padding: 16
    },
    friendProgressNotation: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontFamily: "MainBold",
        color: "#fff",
        backgroundColor: "#9ae17b",
        borderRadius: 4,
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16
    },
    comparisonContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    comparisonVs: {
        fontFamily: "MainBold",
        fontSize: 25,
        color: "#1f6cb0"
    },
    comparisonUserContainer: {
        width: "33%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    profilePictureContainerMini: {
        width: 60,
        height: 60,
        backgroundColor: "#ccc",
        borderRadius: 1000,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8
    },
    noProfilePictureTextMini: {
        fontFamily: "MainBold",
        fontSize: 12,
        color: "#777",
    },
    namesMini: {
        fontFamily: "MainBold",
        fontSize: 12,
        textTransform: "uppercase",
        color: "#222",
        marginVertical: 12
    },
    friendProgressRate: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    friendProgressRateText: {
        fontFamily: "MainRegular",
        marginLeft: 8
    },
    progressRateComparisonContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    }
})