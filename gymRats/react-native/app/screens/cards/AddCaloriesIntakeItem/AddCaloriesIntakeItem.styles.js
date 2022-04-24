import { StyleSheet } from 'react-native';
import { cardColors } from '../../../../assets/styles/cardColors';

export default StyleSheet.create({
    foodTitleContainer: {
        backgroundColor: cardColors.caloriesIntake,
        height: '30%',
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        paddingHorizontal: "2rem",
        paddingVertical: "2rem",
        borderRadius: 4,
        marginTop: 12,
        marginBottom: 32
    },
    foodTitle: {
        fontFamily: "SpartanBold",
        fontSize: 24,
        color: "#fff",
    },
    foodBrand: {
        fontFamily: "SpartanRegular",
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
        fontFamily: "SpartanBold",
        fontSize: 10,
        color: "#fff",
    },
    names: {
        fontFamily: "SpartanMedium",
        fontSize: 12,
        color: "#fafafa",
        marginLeft: 6,
    },
    statsContainer: {
        marginVertical: 16
    },
    statsTitle: {
        fontFamily: "SpartanBold",
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
        fontFamily: "SpartanBold",
        fontSize: 16,
    },
    macroCircleTitle: {
        fontFamily: "SpartanBold",
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
        fontFamily: "SpartanRegular",
        fontSize: 12
    },
    nutritionalInfoValue: {
        fontFamily: "SpartanMedium",
        fontSize: 14,
    },
    inputContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
    },
    amountInputContainer: {
        width: "33%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    amountInput: {
        width: "50%",
        fontFamily: "SpartanRegular",
        fontSize: 14,
    },
    editSectionInput: {
        fontFamily: "SpartanRegular",
        fontSize: 14,
        borderRadius: 3,
        borderColor: "#ccc",
        borderWidth: 1,
        paddingTop: 13,
        paddingBottom: 12,
        paddingHorizontal: 8,
        marginVertical: 4,
        width: "65%",
        marginLeft: 16
    }
})