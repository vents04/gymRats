import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    borderStyleBase: {
        width: 30,
        height: 45
    },

    borderStyleHighLighted: {
        borderColor: "#03DAC6",
    },

    underlineStyleBase: {
        width: 30,
        height: 45,
        borderWidth: 0,
        borderBottomWidth: 1,
    },

    underlineStyleHighLighted: {
        borderColor: "#03DAC6",
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