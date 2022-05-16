const { default: AsyncStorage } = require('@react-native-async-storage/async-storage');
import io from 'socket.io-client/dist/socket.io'
import { AUTHENTICATION_TOKEN_KEY, ROOT_URL_API } from '../../global';
import User from './User';

const Socket = {
    initConnection: () => {
        const socket = io(ROOT_URL_API, {
            transports: ['websocket'],
        });
        return socket;
    },

    joinChatsRoom: (socket) => {
        return new Promise(async (resolve, reject) => {
            try{
                const token = await AsyncStorage.getItem(AUTHENTICATION_TOKEN_KEY);
                if(!token) throw new Error("No token found");
                const validation = await User.validateToken()
                if(!validation.valid) throw new Error("Invalid token")
                socket.emit("join-chats-room", {userId: validation.user._id});
            }catch(error){
                reject(error);
            }
        })
    }
}
export default Socket;