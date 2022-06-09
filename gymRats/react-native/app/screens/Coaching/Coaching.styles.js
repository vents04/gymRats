import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    tabsContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    tabTitleContainer: {
        width: '50%',
    },
    tabTitle: {
        fontFamily: 'MainBold',
        fontSize: 16,
        textTransform: "uppercase",
        paddingVertical: 20,
    },
    tabContent: {
        paddingVertical: 30,
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
        fontFamily: 'MainBold',
        fontSize: 16,
        marginLeft: 12,
        maxWidth: "80%"
    },
    noCoachDescription: {
        fontFamily: 'MainMedium',
        fontSize: 14,
        color: "#aaa"
    },
    noCoachProContainer: {
        marginTop: 18,
    },
    noCoachNumberContainer: {
        width: 30,
        height: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#262626',
        borderRadius: 1000,
    },
    noCoachNumber: {
        fontFamily: 'MainBold',
        fontSize: 16,
    },
    noCoachPro: {
        fontFamily: 'MainRegular',
        fontSize: 16,
        marginTop: 8
    },
    noCoachProIcon: {
        color: "#1f6cb0",
        width: 32
    },
    coachingSectionTitle: {
        fontFamily: "MainBold",
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
        fontFamily: "MainBold",
        fontSize: 10,
        color: "#777",
    },
    names: {
        fontFamily: "MainBold",
        fontSize: 16,
        color: "#222",
        marginLeft: 16,
    },
});