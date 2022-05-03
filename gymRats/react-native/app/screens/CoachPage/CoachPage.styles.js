const { StyleSheet } = require('react-native');

export default StyleSheet.create({
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
        fontFamily: "MainBold",
        fontSize: 25,
        color: "#777",
        marginTop: 5
    },
    names: {
        fontFamily: "MainBold",
        fontSize: 20,
        color: "#222",
        marginTop: 32,
        width: "100%",
        textAlign: "center",
    },
    statValue: {
        fontFamily: "MainMedium",
        fontSize: 18
    },
    statTitle: {
        fontFamily: "MainMedium",
        color: "#777",
        textTransform: "uppercase",
        fontSize: 10,
        marginTop: 4
    },
    location: {
        fontFamily: "MainMedium",
        fontSize: 16,
        marginTop: 32,
        color: "#1f6cb0"
    },
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
    reviewProfilePictureContainer: {
        width: 40,
        height: 40,
        backgroundColor: "#ccc",
        borderRadius: 1000,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    reviewNoProfilePictureText: {
        fontFamily: "MainBold",
        fontSize: 10,
        color: "#777",
        marginTop: 2
    },
    reviewNames: {
        fontFamily: "MainBold",
        fontSize: 16,
        color: "#222",
        marginLeft: 16,
        marginTop: 4
    },
    coachResultReviews: {
        fontFamily: "MainRegular",
        fontSize: 12,
        marginLeft: 8,
        marginTop: 4
    },
    rating: {
        borderWidth: 0
    },
});