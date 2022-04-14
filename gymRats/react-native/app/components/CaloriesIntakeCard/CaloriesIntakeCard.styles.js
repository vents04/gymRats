const { StyleSheet } = require('react-native');

module.exports = StyleSheet.create({
    statsContainer: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: 16,
        alignItems: 'center',
    },
    weight: {
        fontFamily: 'SpartanBold',
        fontSize: 20,
        marginTop: 24
    },
    weightTrend: {
        fontFamily: 'SpartanMedium',
        fontSize: 12,
        marginTop: 3,
        marginLeft: 10,
        color: "#333"
    }
})