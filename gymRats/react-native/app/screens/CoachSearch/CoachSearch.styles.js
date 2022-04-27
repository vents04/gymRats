import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    coachResult: {
        display: "flex",
        borderWidth: 1,
        borderRadius: 4,
        borderColor: "#ccc",
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginVertical: 10
    },
    coachResultInline: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    profilePictureContainer: {
        width: 40,
        height: 40,
        backgroundColor: "#ccc",
        borderRadius: 1000,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    noProfilePictureText: {
        fontFamily: "MainBold",
        fontSize: 10,
        color: "#777",
        marginTop: 2
    },
    names: {
        fontFamily: "MainBold",
        fontSize: 16,
        color: "#222",
        marginLeft: 16,
        marginTop: 4
    },
    coachResultReviews: {
        fontFamily: "MainRegular",
        fontSize: 12,
        marginLeft: 8,
        marginTop: 4
    },
    rating: {
        borderWidth: 0
    },
    bottomSheetTopbar: {
        padding: 32,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    bottomSheetTitle: {
        fontFamily: "MainBold",
        fontSize: 16,
    },
    cardsContainer: {
        paddingHorizontal: 32,
        paddingBottom: 16,
        display: "flex",
        flexDirection: "column",
    },
    card: {
        padding: 16,
        borderRadius: 4,
        marginBottom: 16
    },
    cardTopbar: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    cardTitle: {
        fontFamily: "MainBold",
        fontSize: 16,
        color: "#fff",
        marginTop: 3,
        marginLeft: 10
    },
    cards: {
        display: "flex",
        flexDirection: "column",
    },
    sheetSectionTitle: {
        fontFamily: "MainMedium",
        fontSize: 16
    }
});