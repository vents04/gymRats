import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    searchResultsContainer: {
        flexGrow: 1,
        flexShrink: 1,
        marginTop: 16
    },
    searchResultsTitle: {
        fontFamily: "SpartanBold",
        fontSize: 12,
        paddingBottom: 16,
        color: "#ccc",
        textTransform: "uppercase",
        borderBottomWidth: 1,
        borderBottomColor: "#e7e7e7"
    },
    searchResultBrand: {
        fontFamily: "SpartanRegular",
        fontSize: 12,
        marginTop: 4,
        color: "#aaa"
    },
    searchResult: {
        paddingVertical: 12
    },
    searchResultTitle: {
        fontFamily: "SpartanBold",
        fontSize: 18,
    },
    searchResultStats: {
        fontFamily: "SpartanLight",
        fontSize: 12,
        color: "#262626",
        marginTop: 8
    },
    user: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4
    },
    profilePictureContainer: {
        width: 24,
        height: 24,
        backgroundColor: "#ccc",
        borderRadius: 1000,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    noProfilePictureText: {
        fontFamily: "SpartanBold",
        fontSize: 6,
        color: "#777",
        marginTop: 1.2
    },
    names: {
        fontFamily: "SpartanMedium",
        fontSize: 12,
        color: "#777",
        marginLeft: 6,
    },
})