import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    searchResultsContainer: {
        flexGrow: 1,
        flexShrink: 1,
        marginTop: 16
    },
    searchResultsTitle: {
        fontFamily: "MainBold",
        fontSize: 12,
        paddingBottom: 16,
        color: "#ccc",
        textTransform: "uppercase",
        borderBottomWidth: 1,
        borderBottomColor: "#e7e7e7"
    },
    searchResult: {
        paddingVertical: 12
    },
    searchResultTitle: {
        fontFamily: "MainBold",
        fontSize: 16,
    },
    searchResultStats: {
        fontFamily: "MainLight",
        fontSize: 12,
        color: "#262626",
        marginTop: 8
    }
})