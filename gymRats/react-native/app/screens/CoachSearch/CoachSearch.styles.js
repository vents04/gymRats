const { StyleSheet } = require('react-native');

module.exports = StyleSheet.create({
    coachResult: {
        display: "flex",
        borderWidth: 1,
        borderRadius: 4,
        borderColor: "#ccc",
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginVertical: 10
    },
    coachResultInline: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
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
    names: {
        fontFamily: "SpartanBold",
        fontSize: 16,
        color: "#222",
        marginLeft: 16,
        marginTop: 4
    },
    coachResultReviews: {
        fontFamily: "SpartanRegular",
        fontSize: 12,
        marginLeft: 8,
        marginTop: 4
    }
});