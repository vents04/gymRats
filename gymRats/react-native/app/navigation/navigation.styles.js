import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    shadow: {
        shadowColor: "#ddd",
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 10
    },
    tabBarIconContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%"
    },
    tabBarIconText: {
        fontFamily: "MainRegular",
        fontSize: 10,
        marginTop: 10,
        width: "100%",
        textAlign: "center",
    }
});