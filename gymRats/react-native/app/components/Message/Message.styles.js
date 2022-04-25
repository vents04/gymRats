import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    messageContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        maxWidth: "80%",
        marginVertical: 12,
        alignSelf: "flex-end",
        marginHorizontal: 6
    },
    messageContentContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 4,
        backgroundColor: '#e7e7e7',
        marginHorizontal: 10
    },
    profilePictureContainer: {
        width: 20,
        height: 20,
        backgroundColor: "#ccc",
        borderRadius: 1000,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    noProfilePictureText: {
        fontFamily: "MainBold",
        fontSize: 7,
        color: "#777",
    },
    textMessage: {
        fontFamily: "MainRegular",
        fontSize: 14
    }
});