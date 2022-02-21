const { StyleSheet } = require('react-native');
const { cardColors } = require('../../../../assets/styles/cardColors');

module.exports = StyleSheet.create({
    exercisesListContainer: {
        marginTop: 30,
        display: 'flex',
        flexDirection: 'column',
        flex: 1
    },
    exercisesListContainerTopbar: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        height: 30
    },
    sectionTitle: {
        fontFamily: "SpartanBold",
        fontSize: 16
    },
    exerciseTitle: {
        fontFamily: "SpartanMedium",
        fontSize: 14
    },
    exerciseContainerTopbar: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        height: 30
    },
    exerciseContainerLeft: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: "65%"
    },
    exerciseContainerAddContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20
    },
    exerciseContainerAddContainerTitle: {
        fontFamily: "SpartanRegular",
        marginRight: 5,
        marginTop: 3,
        fontSize: 12,
        color: cardColors.logbook
    },
    setsContainer: {
        marginTop: 10
    },
    setContainer: {
        display: 'flex',
        flexDirection: 'row',
        overflow: "",
    },
    setContainerTitle: {
        fontFamily: "SpartanRegular",
        fontSize: 12,
        color: "#777",
        marginTop: 5
    },
    setContainerItem: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        width: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 5,
        padding: 6,
        marginRight: 12
    },
    setContainerItemInput: {
        width: "100%",
        textAlign: "center",
        outline: "none",
        fontFamily: "SpartanMedium",
        fontSize: 14
    },
    setContainerItemDescriptor: {
        fontFamily: "SpartanRegular",
        fontSize: 10,
        color: "#777",
    },
    notes: {
        fontFamily: "SpartanRegular",
        fontSize: 12,
        color: "#777",
    },
    notesInput: {
        borderWidth: 1,
        borderRadius: 4,
        borderColor: "#ccc",
        padding: 6,
        fontFamily: "SpartanRegular",
    }
})