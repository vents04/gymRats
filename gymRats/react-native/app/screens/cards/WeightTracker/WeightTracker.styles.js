const { StyleSheet } = require('react-native');

module.exports = StyleSheet.create({
    weightInputContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32
    },
    editSectionInput: {
        fontFamily: "SpartanMedium",
        fontSize: 16,
        borderWidth: 0
    },
    loadingContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginTop: 16,
    }
});