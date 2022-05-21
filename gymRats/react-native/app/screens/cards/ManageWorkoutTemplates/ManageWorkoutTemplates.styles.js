import { StyleSheet } from "react-native";

export default StyleSheet.create({
    workoutTemplate: {
        borderRadius: 4,
        borderColor: "#e7e7e7",
        padding: 24,
        borderWidth: 1,
        marginBottom: 16
    },
    workoutTemplateHeader: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12
    },
    workoutTemplateTitle: {
        fontFamily: "MainBold",
        fontSize: 20,
        maxWidth: "80%"
    },
    workoutTemplateExercise: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 8
    },
    workoutTemplateExerciseTitle: {
        fontFamily: "MainMedium",
        fontSize: 14,
        maxWidth: "80%",
    }
})