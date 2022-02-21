const { StyleSheet } = require('react-native');

module.exports = StyleSheet.create({
    tabsContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    tabTitle: {
        width: '50%',
        fontFamily: 'SpartanBold',
        fontSize: 16,
        textTransform: "uppercase",
        paddingVertical: 20,
    },
    tabContent: {
        marginTop: 30,
        flex: 1
    },
    noCoachContainer: {
        padding: 20,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4
    },
    noCoachTopbar: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    noCoachTitle: {
        fontFamily: 'SpartanBold',
        fontSize: 16,
        marginLeft: 12
    },
    noCoachDescription: {
        fontFamily: 'SpartanMedium',
        fontSize: 14,
        color: "#aaa"
    },
    noCoachProContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
        flex: 100
    },
    noCoachPro: {
        fontFamily: 'SpartanRegular',
        fontSize: 16,
        marginLeft: 8,
        flex: 95
    },
    noCoachProIcon: {
        color: "#1f6cb0",
        flex: 5
    }
});