import { StyleSheet, StatusBar } from 'react-native';

export default StyleSheet.create({
    safeAreaView: {
        marginTop: StatusBar.currentHeight,
        backgroundColor: "#fff",
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    },
    tabsBg: {
        backgroundColor: "#1f6cb0"
    },
    pageContainer: {
        paddingTop: 32,
        paddingHorizontal: 32,
        paddingBottom: 12,
        flex: 1,
        maxHeight: "100%",
    },
    authPageTitle: {
        fontFamily: "MainBlack",
        fontSize: 36
    },
    authPageInputs: {
        marginVertical: 24
    },
    authPageInput: {
        fontFamily: "MainRegular",
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
        fontFamily: "MainBlack",
        fontSize: 14,
        color: "#fff",
        textAlign: "center"
    },
    authPageRedirectTextContainer: {
        display: "flex",
        flexDirection: "column",
        marginTop: 16
    },
    authPageRedirectText: {
        fontFamily: "MainMedium",
        fontSize: 14,
    },
    authPageRedirectHighlightText: {
        fontFamily: "MainBold",
        fontSize: 14,
        color: "#1f6cb0"
    },
    authPageError: {
        fontFamily: "MainBold",
        color: "red",
        fontSize: 14,
        marginBottom: 24
    },
    errorBox: {
        borderColor: "#eb0202",
        fontFamily: "MainMedium",
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
        fontFamily: "MainRegular",
        fontSize: 14,
    },
    followUpScreenTopbar: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 16
    },
    followUpScreenTitle: {
        marginLeft: 10,
        fontFamily: "MainBold",
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
        fontFamily: "MainBold",
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
        fontFamily: "MainBold",
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
        fontFamily: "MainLight",
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
        width: "80%"
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
        fontFamily: "MainBold",
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
        fontFamily: "MainMedium",
        fontSize: 14
    },
    important: {
        padding: 16,
        fontFamily: "MainMedium",
        fontSize: 14,
        borderRadius: 4,
        borderColor: "#1f6cb0",
        borderWidth: 1,
        backgroundColor: "#a2d2fc"
    },
    fillEmptySpace: {
        flexGrow: 1,
    },
    actionText: {
        fontFamily: "MainMedium",
        fontSize: 14,
        color: "#1f6cb0"
    }
});