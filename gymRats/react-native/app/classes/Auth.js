const { default: AsyncStorage } = require('@react-native-async-storage/async-storage');
const { AUTHENTICATION_TOKEN_KEY } = require('../../global');

const Auth = {
    setToken: async (token) => {
        console.log("TOKENA", token);
        await AsyncStorage.setItem(AUTHENTICATION_TOKEN_KEY, token);
    },

    getToken: async () => {
        return AsyncStorage.getItem(AUTHENTICATION_TOKEN_KEY);
    },
}

module.exports = Auth;