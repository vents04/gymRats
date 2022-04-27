import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    descriptionText: {
        fontFamily: "MainMedium",
        fontSize: 16,
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
        width: "90%",
        padding: 16,
        fontFamily: "MainRegular",
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
    },
    suggestionContainer: {
        borderColor: "#e7e7e7",
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: "#fafafa",
        marginVertical: 16,
        padding: 16
    },
    suggestionStatus: {
        fontFamily: "MainMedium",
        textTransform: "uppercase",
        fontSize: 10,
    },
    suggestion: {
        fontFamily: "MainRegular",
        fontSize: 16,
        marginTop: 12
    }
})