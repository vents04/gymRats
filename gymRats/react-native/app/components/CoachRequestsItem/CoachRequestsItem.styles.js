import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    chatItemContainer: {
        display: 'flex',
        flexDirection: 'column',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 16,
        marginVertical: 8
    },
    coachRequestInfoContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
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
    chatsItemDetailsContainer: {
        marginLeft: 12,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    chatsItemNames: {
        fontFamily: "MainBold",
        fontSize: 14
    },
    chatsItemLastMessage: {
        fontFamily: "MainRegular",
        fontSize: 10,
        color: "#aaa",
        marginTop: 4
    }
});