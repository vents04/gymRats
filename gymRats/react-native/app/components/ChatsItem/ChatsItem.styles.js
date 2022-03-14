const { StyleSheet } = require('react-native');

module.exports = StyleSheet.create({
    chatItemContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 16
    },
    profilePictureContainer: {
        width: 40,
        height: 40,
        backgroundColor: "#ccc",
        borderRadius: 1000,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    noProfilePictureText: {
        fontFamily: "SpartanBold",
        fontSize: 10,
        color: "#777",
        marginTop: 2
    },
    chatsItemDetailsContainer: {
        marginLeft: 12,
        display: "flex",
        flexDirection: "column",
    },
    chatsItemNames: {
        fontFamily: "SpartanBold",
        fontSize: 14
    },
    chatsItemLastMessage: {
        fontFamily: "SpartanRegular",
        fontSize: 10,
        color: "#aaa",
        marginTop: 4
    }
});