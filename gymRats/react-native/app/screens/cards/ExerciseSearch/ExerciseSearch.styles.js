const { StyleSheet } = require('react-native');

module.exports = StyleSheet.create({
    searchResultsContainer: {
        paddingVertical: 30,
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
    searchResult: {
        paddingVertical: 12
    },
    searchResultTitle: {
        fontFamily: "SpartanBold",
        fontSize: 16,
    },
    searchResultStats: {
        fontFamily: "SpartanLight",
        fontSize: 12,
        color: "#262626",
        marginTop: 8
    }
})