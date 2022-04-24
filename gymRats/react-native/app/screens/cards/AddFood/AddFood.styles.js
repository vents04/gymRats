import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    inputSection: {
        marginVertical: 16,
    },
    inputSectionTitle: {
        fontFamily: "MainBold",
        color: "#aaa",
        fontSize: 12,
        textTransform: "uppercase",
        marginBottom: 6
    },
    inputSectionInput: {
        fontFamily: "MainRegular",
        fontSize: 14,
        borderRadius: 3,
        borderColor: "#ccc",
        borderWidth: 1,
        paddingTop: 13,
        paddingBottom: 12,
        paddingHorizontal: 8,
        marginVertical: 4,
        width: "100%"
    },
    optional: {
        fontFamily: "MainRegular",
        fontSize: 10,
        fontStyle: "italic"
    }
})