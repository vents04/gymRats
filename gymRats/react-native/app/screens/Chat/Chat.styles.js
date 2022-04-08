const { StyleSheet } = require('react-native');

module.exports = StyleSheet.create({
    chatTopbarContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: "#e7e7e7",
        borderBottomWidth: 1,
        height: 75,
        padding: 25
    },
    chatProfilePicture: {
        width: 40,
        height: 40,
        backgroundColor: "#ccc",
        borderRadius: 1000,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 16
    },
    chatProfileNames: {
        fontFamily: "SpartanBold",
        fontSize: 20,
        color: "#222",
        marginLeft: 12
    },
    noProfilePictureText: {
        fontFamily: "SpartanBold",
        fontSize: 10,
        color: "#777",
    },
    chatInputContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        height: 60,
        marginBottom: 10,
        borderTopColor: "#e7e7e7",
        borderTopWidth: 1,
    },
    chatInput: {
        width: "90%",
        padding: "16px",
        fontFamily: "SpartanRegular",
        fontSize: 16
    },
    chatActionButtonContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "10%"
    },
    chatInputButton: {
        color: "#1f6cb0",
    }
});