const { StyleSheet } = require('react-native');

module.exports = StyleSheet.create({
    tabsContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    tabTitle: {
        width: '50%',
        fontFamily: 'SpartanBold',
        fontSize: 16,
        textTransform: "uppercase",
        paddingVertical: 20,
    },
    tabContent: {
        marginTop: 30,
        flex: 1
    },
    noCoachContainer: {
        padding: 20,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4
    },
    noCoachTopbar: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    noCoachTitle: {
        fontFamily: 'SpartanBold',
        fontSize: 16,
        marginLeft: 12
    },
    noCoachDescription: {
        fontFamily: 'SpartanMedium',
        fontSize: 14,
        color: "#aaa"
    },
    noCoachProContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
        flex: 100
    },
    noCoachPro: {
        fontFamily: 'SpartanRegular',
        fontSize: 16,
        marginLeft: 8,
        flex: 95
    },
    noCoachProIcon: {
        color: "#1f6cb0",
        flex: 5
    },
    coachingSectionTitle: {
        fontFamily: "SpartanBold",
        fontSize: 16,
        marginTop: 16
    },
    requestItem: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderRadius: 4,
        borderColor: "#ccc",
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginVertical: 10
    },
    requestItemProfile: {
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
    },
    names: {
        fontFamily: "SpartanBold",
        fontSize: 16,
        color: "#222",
        marginLeft: 16,
    },
});