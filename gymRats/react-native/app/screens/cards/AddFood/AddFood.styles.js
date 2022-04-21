const { StyleSheet } = require('react-native');

module.exports = StyleSheet.create({
    inputSection: {
        marginVertical: 16,
    },
    inputSectionTitle: {
        fontFamily: "SpartanBold",
        color: "#aaa",
        fontSize: 12,
        textTransform: "uppercase",
        marginBottom: 6
    },
    inputSectionInput: {
        fontFamily: "SpartanRegular",
        fontSize: 14,
        borderRadius: 3,
        borderColor: "#ccc",
        borderWidth: 1,
        paddingTop: 13,
        paddingBottom: 12,
        paddingHorizontal: 8,
        marginVertical: 4,
        width: "100%"
    },
    optional: {
        fontFamily: "SpartanRegular",
        fontSize: 10,
        fontStyle: "italic"
    }
})