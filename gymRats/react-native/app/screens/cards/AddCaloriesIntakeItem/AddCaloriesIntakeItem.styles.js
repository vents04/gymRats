import { StyleSheet } from 'react-native';
import { cardColors } from '../../../../assets/styles/cardColors';

export default StyleSheet.create({
    foodTitleContainer: {
        backgroundColor: cardColors.caloriesIntake,
        height: '30%',
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        paddingHorizontal: 32,
        paddingVertical: 32,
        borderRadius: 4,
        marginTop: 12,
        marginBottom: 32
    },
    foodTitle: {
        fontFamily: "MainBold",
        fontSize: 24,
        color: "#fff",
    },
    foodBrand: {
        fontFamily: "MainRegular",
        fontSize: 16,
        marginTop: 6,
        color: "#fafafa",
    },
    user: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8
    },
    profilePictureContainer: {
        width: 32,
        height: 32,
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
        color: "#fff",
    },
    names: {
        fontFamily: "MainMedium",
        fontSize: 12,
        color: "#fafafa",
        marginLeft: 6,
    },
    statsContainer: {
        marginVertical: 16,
    },
    statsTitle: {
        fontFamily: "MainBold",
        fontSize: 14,
        marginBottom: 16
    },
    inline: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    macronutrientsCirclesContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    macronutrientsCircles: {
        marginTop: 32
    },
    macronutrientsRatioCircleTitle: {
        fontFamily: "MainBold",
        fontSize: 16,
    },
    macroCircleTitle: {
        fontFamily: "MainBold",
        fontSize: 12,
        textTransform: "uppercase",
        color: "#ccc",
        marginTop: 8
    },
    nutritionalInfoContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 4
    },
    nutritionalInfoTitle: {
        fontFamily: "MainRegular",
        fontSize: 12,
    },
    nutritionalInfoValue: {
        fontFamily: "MainMedium",
        fontSize: 14,
    },
    inputContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
    },
    amountInputContainer: {
        width: "40%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    amountInput: {
        width: "50%",
        fontFamily: "MainRegular",
        fontSize: 14,
    },
    editSectionInput: {
        fontFamily: "MainRegular",
        fontSize: 14,
        borderRadius: 3,
        borderColor: "#ccc",
        borderWidth: 1,
        paddingTop: 13,
        paddingBottom: 12,
        paddingHorizontal: 8,
        marginVertical: 4,
        width: "55%",
        marginLeft: 16
    }
})