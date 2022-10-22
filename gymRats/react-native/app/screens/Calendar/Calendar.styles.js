import { Dimensions, StyleSheet } from 'react-native';

export default StyleSheet.create({
    calendarControllersContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexGrow: 0,
        flexShrink: 0,
        marginBottom: 32,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e7e7e7',
        padding: 16
    },
    calendarController: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    calendarControllerText: {
        fontFamily: "MainBold",
        fontSize: 11,
        color: "#999",
        textTransform: "uppercase",
        marginTop: 3
    },
    calendarCurrentDate: {
        fontFamily: "MainBold",
        fontSize: 14,
        flex: 1,
        textAlign: "center",
        padding: 8,
    },
    calendarIosCurrentDateContainer: {
        position: "absolute",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    calendarIosDatePicker: {
        width: Dimensions.get("screen").width / 4,
        alignItems: "flex-start",
    },
    bottomSheetTopbar: {
        padding: 32,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    bottomSheetTitle: {
        fontFamily: "MainBold",
        fontSize: 16,
    },
    cardsContainer: {
        paddingHorizontal: 32,
        paddingBottom: 16,
        display: "flex",
        flexDirection: "column",
    },
    card: {
        padding: 16,
        borderRadius: 4,
        marginBottom: 16
    },
    cardTopbar: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    cardTitle: {
        fontFamily: "MainBold",
        fontSize: 16,
        color: "#fff",
        marginTop: 3,
        marginLeft: 10
    },
    cards: {
        display: "flex",
        flexDirection: "column",
    },
    addDataItemContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 2,
        borderRadius: 4,
        borderColor: "#e7e7e7",
        padding: 16,
        marginBottom: 16
    },
    addDataItemLeft: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    addDataItemLabels: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        marginLeft: 16
    },
    addDataItemTitle: {
        fontFamily: "MainBold",
        fontSize: 14,
        textTransform: "uppercase"
    },
    addDataDescription: {
        fontFamily: "MainRegular",
        fontSize: 12,
        marginTop: 4,
        color: "#777"
    }
});