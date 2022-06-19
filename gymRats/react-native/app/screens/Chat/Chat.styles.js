import { StyleSheet } from 'react-native';

export default StyleSheet.create({
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
        fontFamily: "MainBold",
        fontSize: 20,
        color: "#222",
        marginLeft: 12
    },
    noProfilePictureText: {
        fontFamily: "MainBold",
        fontSize: 10,
        color: "#777",
    },
    chatInputContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        height: 60,
        borderTopColor: "#e7e7e7",
        borderTopWidth: 1,
    },
    chatInput: {
        width: "85%",
        padding: 16,
        fontFamily: "MainRegular",
        fontSize: 16
    },
    chatActionButtonContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "15%"
    },
    chatInputButton: {
        color: "#1f6cb0",
    },
    uploadingContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    uploadingText: {
        fontFamily: "MainMedium",
        fontSize: 14,
        marginRight: 8
    },
    loadingMessagesContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        paddingVertical: 12
    },
    loadingMessagesText: {
        fontFamily: "MainMedium",
        fontSize: 14,
        marginLeft: 8
    }
});