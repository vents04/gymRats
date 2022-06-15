import { Dimensions, StyleSheet } from 'react-native';
import { cardColors } from '../../../../assets/styles/cardColors';

export default StyleSheet.create({
    exercisesListContainer: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        flexShrink: 1
    },
    exercisesListContainerTopbar: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
    },
    sectionTitle: {
        fontFamily: "MainBold",
        fontSize: 16
    },
    exerciseTitle: {
        fontFamily: "MainMedium",
        fontSize: 14
    },
    exerciseContainerTopbar: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
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
        fontFamily: "MainRegular",
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
        overflow: "hidden",
        flex: 1
    },
    setContainerTitle: {
        fontFamily: "MainRegular",
        fontSize: 12,
        color: "#777",
        marginTop: 5
    },
    setContainerItem: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        width: (Dimensions.get('window').width - 32) / 4,
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
        fontFamily: "MainMedium",
        fontSize: 14
    },
    setContainerItemDescriptor: {
        fontFamily: "MainRegular",
        fontSize: 10,
        color: "#777",
    },
    notes: {
        fontFamily: "MainRegular",
        fontSize: 12,
        color: "#777",
    },
    notesInput: {
        borderWidth: 1,
        borderRadius: 4,
        borderColor: "#ccc",
        padding: 6,
        fontFamily: "MainRegular",
    },
    option: {
        width: '50%',
        display: 'flex',
        alignItems: 'center'
    },
    unknownSourceCaloriesIncentiveContainer: {
        borderColor: "#e7e7e7",
        borderRadius: 4,
        borderWidth: 1,
        padding: 16,
        backgroundColor: "#fafafa",
        marginBottom: 32
    },
    unknownSourceCaloriesIncentiveText: {
        fontFamily: 'MainMedium',
        fontSize: 14,
        color: "#999",
        marginBottom: 14
    }
})