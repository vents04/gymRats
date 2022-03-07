const { StyleSheet, Dimensions } = require('react-native');

module.exports = StyleSheet.create({
    profileTop: {
        marginVertical: 32,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: "center",
    },
    coachStats: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 3,
        width: "100%",
        marginTop: 32
    },
    statContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
    },
    profilePictureContainer: {
        width: 100,
        height: 100,
        backgroundColor: "#ccc",
        borderRadius: 1000,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    noProfilePictureText: {
        fontFamily: "SpartanBold",
        fontSize: 25,
        color: "#777",
        marginTop: 5
    },
    names: {
        fontFamily: "SpartanBold",
        fontSize: 20,
        color: "#222",
        marginTop: 32,
        width: "100%",
        textAlign: "center",
    },
    statValue: {
        fontFamily: "SpartanMedium",
        fontSize: 18
    },
    statTitle: {
        fontFamily: "SpartanMedium",
        color: "#777",
        textTransform: "uppercase",
        fontSize: 10,
        marginTop: 4
    },
    location: {
        fontFamily: "SpartanMedium",
        fontSize: 16,
        marginTop: 32,
        color: "#1f6cb0"
    }
});