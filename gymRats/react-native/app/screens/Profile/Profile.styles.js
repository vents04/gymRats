import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    profileContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginTop: 32
    },
    profileContainerTopbar: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profilePictureContainer: {
        width: 100,
        height: 100,
        backgroundColor: "#ccc",
        borderRadius: 1000,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
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
        marginTop: 16
    },
    email: {
        fontFamily: "MainRegular",
        fontSize: 14,
        color: "#aaa",
        marginTop: 8
    },
    highlightedText: {
        fontFamily: "MainRegular",
        fontSize: 14,
        color: "#1f6cb0",
        marginTop: 8
    },
    commonDataContainer: {
        marginTop: 64
    },
    commonDataSection: {
        borderWidth: 1,
        borderRadius: 4,
        borderColor: "#ccc",
        padding: 16,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    commonDataSectionTitle: {
        fontFamily: "MainBold",
        color: "#1f6cb0",
        fontSize: 11,
        textTransform: "uppercase",
    },
    commonDataSectionValue: {
        fontFamily: "MainRegular",
        marginTop: 10
    },
    loadingContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginTop: 16,
    }
});