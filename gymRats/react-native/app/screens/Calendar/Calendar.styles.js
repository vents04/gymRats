import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    calendarControllersContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexGrow: 0,
        flexShrink: 0,
        marginBottom: 32
    },
    calendarController: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    calendarControllerText: {
        fontFamily: "SpartanBold",
        fontSize: 11,
        color: "#999",
        textTransform: "uppercase",
        marginTop: 3
    },
    calendarCurrentDate: {
        fontFamily: "SpartanBold",
        fontSize: 12,
        flex: 1,
        textAlign: "center",
        marginTop: 3
    },
    bottomSheetTopbar: {
        padding: 32,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    bottomSheetTitle: {
        fontFamily: "SpartanBold",
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
        fontFamily: "SpartanBold",
        fontSize: 16,
        color: "#fff",
        marginTop: 3,
        marginLeft: 10
    },
    cards: {
        display: "flex",
        flexDirection: "column",
    }
});