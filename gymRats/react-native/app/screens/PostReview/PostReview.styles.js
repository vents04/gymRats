import { StyleSheet } from 'react-native';

export default StyleSheet.create({
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
    section: {
        marginVertical: 32,
    },
    sectionTitle: {
        fontFamily: "MainBold",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 16
    },
    centeredContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    ratingTitle: {
        fontFamily: "MainBold",
        fontSize: 20,
        color: "#1f6cb0",
        marginTop: 8
    }
})