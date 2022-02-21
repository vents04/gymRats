const { StyleSheet } = require('react-native');

module.exports = StyleSheet.create({
    centeredContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    logoContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 32,
        height: 32,
    },
    logoText: {
        fontFamily: "Logo",
        fontSize: 28,
        color: "#1f6cb0",
        marginLeft: 7,
        marginTop: 3,
        textTransform: "uppercase"
    },
    activityIndicator: {
        marginTop: 10
    }
});