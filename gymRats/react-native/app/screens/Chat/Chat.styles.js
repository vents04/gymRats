const { StyleSheet } = require('react-native');

module.exports = StyleSheet.create({
    chatTopbarContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: "#ccc",
        borderBottomWidth: 1,
        padding: 24
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
});