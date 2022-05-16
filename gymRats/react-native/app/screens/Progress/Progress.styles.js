import { StyleSheet } from "react-native";

export default StyleSheet.create({
    progressCardContainer: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        padding: 16
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
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        borderRadius: 4,
        padding: 8,
    },
    progressFlag: {
        fontFamily: "MainBold",
        fontSize: 10,
        marginRight: 8,
        textTransform: "uppercase",
        color: "white"
    },
    progressCardTips: {
        marginTop: 16,
    },
    progressCardTipsTitle: {
        fontFamily: "MainBlack",
        textTransform: "uppercase",
        fontSize: 14,
        color: "#262626"
    },
    progressCardTipContainer: {
        display: "flex",
        flexDirection: "row",
        marginVertical: 8,
        marginRight: 16
    },
    progressCardTip: {
        fontFamily: "MainRegular",
        fontSize: 12,
        marginLeft: 8
    }
})