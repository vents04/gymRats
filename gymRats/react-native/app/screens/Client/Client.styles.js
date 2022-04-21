const { StyleSheet } = require('react-native');

module.exports = StyleSheet.create({
    clientContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12
    },
    profilePictureContainer: {
        width: 32,
        height: 32,
        backgroundColor: "#ccc",
        borderRadius: 1000,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    noProfilePictureText: {
        fontFamily: "SpartanBold",
        fontSize: 8,
        color: "#777",
    },
    clientInfoContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        marginLeft: 16,
    },
    names: {
        fontFamily: "SpartanBold",
        fontSize: 16,
        color: "#222",
    },
    calendarControllersContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexGrow: 0,
        flexShrink: 0,
        marginVertical: 32
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
    }
})