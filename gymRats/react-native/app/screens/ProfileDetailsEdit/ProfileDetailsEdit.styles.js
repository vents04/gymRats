import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    editSectionContainer: {
        marginTop: 32
    },
    divider: {
        height: 1,
        backgroundColor: "#e7e7e7",
        width: "100%",
    },
    editSection: {
        marginVertical: 16,
    },
    editSectionTitle: {
        fontFamily: "MainBold",
        color: "#ccc",
        fontSize: 11,
        textTransform: "uppercase",
        marginBottom: 12
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
        width: "100%"
    },
    notation: {
        color: "#1f6cb0"
    },
    loadingContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginTop: 48,
    }
});