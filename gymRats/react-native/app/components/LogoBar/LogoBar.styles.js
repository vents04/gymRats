import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    pageLogoContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 32
    },
    pageLogo: {
        width: 32,
        height: 32
    },
    pageLogoText: {
        fontFamily: "Logo",
        fontSize: 25,
        marginTop: 2,
        marginLeft: 5,
        textTransform: "uppercase",
        color: "#1f6cb0"
    }
});