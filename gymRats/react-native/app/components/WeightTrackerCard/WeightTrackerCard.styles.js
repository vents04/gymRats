const { StyleSheet } = require('react-native');

module.exports = StyleSheet.create({
    statsContainer: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: 16,
        alignItems: 'center',
    },
    weight: {
        fontFamily: 'MainBold',
        fontSize: 20,
        marginTop: 24
    },
    weightTrend: {
        fontFamily: 'MainMedium',
        fontSize: 12,
        marginTop: 3,
        marginLeft: 10,
        color: "#333",
        flexGrow: 1
    }
});