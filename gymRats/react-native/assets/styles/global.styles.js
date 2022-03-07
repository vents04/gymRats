const { StyleSheet, StatusBar } = require('react-native');

module.exports = StyleSheet.create({
    safeAreaView: {
        marginTop: StatusBar.currentHeight,
        backgroundColor: "#fff",
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        paddingBottom: 125
    },
    tabsBg: {
        backgroundColor: "#1f6cb0"
    },
    pageContainer: {
        padding: 32,
        flex: 1,
        maxHeight: "100%",
    },
    pageLogoContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: "2rem"
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
    },
    authPageTitle: {
        fontFamily: "SpartanBlack",
        fontSize: 48
    },
    authPageInputs: {
        marginVertical: 24
    },
    authPageInput: {
        fontFamily: "SpartanRegular",
        fontSize: 14,
        borderRadius: 4,
        borderColor: "#ccc",
        borderWidth: 1,
        paddingTop: 13,
        paddingBottom: 12,
        paddingHorizontal: 8,
        marginVertical: 4,
        width: "100%"
    },
    authPageActionButton: {
        backgroundColor: "#1f6cb0",
        padding: 12,
        borderRadius: 4,
        borderWidth: 0,
        width: "100%",
        textAlign: "center"
    },
    authPageActionButtonText: {
        fontFamily: "SpartanBlack",
        fontSize: 14,
        color: "#fff",
    },
    authPageRedirectTextContainer: {
        display: "flex",
        flexDirection: "column",
        marginTop: 16
    },
    authPageRedirectText: {
        fontFamily: "SpartanMedium",
        fontSize: 14,
    },
    authPageRedirectHighlightText: {
        fontFamily: "SpartanBold",
        fontSize: 14,
        color: "#1f6cb0"
    },
    authPageError: {
        fontFamily: "SpartanBold",
        color: "red",
        fontSize: 14,
        marginBottom: 24
    },
    errorBox: {
        borderColor: "#eb0202",
        fontFamily: "SpartanMedium",
        color: "#eb0202",
        fontSize: 14,
        padding: 16,
        borderWidth: 1,
        borderRadius: 4,
        width: "100%",
        backgroundColor: "#ffbfc6"
    },
    notation: {
        color: "#aaa",
        fontFamily: "SpartanRegular",
        fontSize: 14,
    },
    followUpScreenTopbar: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        height: 40
    },
    followUpScreenTitle: {
        marginLeft: 10,
        fontFamily: "SpartanBold",
        fontSize: 18
    },
    topbarIconContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        margin: 24,
        padding: 8,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    topbarIconTitle: {
        fontFamily: "SpartanBold",
        fontSize: 14,
        marginRight: 4,
        marginTop: 2
    },
    card: {
        marginTop: 32,
        borderColor: "#ccc",
        borderWidth: 1,
        padding: 16,
        borderRadius: 4
    },
    cardTopbar: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        position: "relative"
    },
    cardTitle: {
        fontFamily: "SpartanBold",
        fontSize: 12.8,
        marginTop: 2,
        color: "#aaa",
        marginLeft: 12,
        textTransform: "uppercase",
    },
    hint: {
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 4,
        padding: 16,
        fontFamily: "SpartanLight",
        fontSize: 14,
        color: "#262626"
    },
    cardTopbarIcon: {
        position: "absolute",
        top: 4,
        right: 4
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 4,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxWidth: "80%"
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontFamily: "SpartanBold",
        fontSize: 16
    },
    modalActionsContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 16
    },
    modalActionTitle: {
        width: "50%",
        textAlign: "center",
        fontFamily: "SpartanMedium",
        fontSize: 14
    },
    important: {
        padding: 16,
        fontFamily: "SpartanMedium",
        fontSize: 14,
        borderRadius: 4,
        borderColor: "#1f6cb0",
        borderWidth: 1,
        backgroundColor: "#a2d2fc"
    }
});