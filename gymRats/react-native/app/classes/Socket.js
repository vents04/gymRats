const { default: AsyncStorage } = require('@react-native-async-storage/async-storage');
import io from 'socket.io-client/dist/socket.io'
import { AUTHENTICATION_TOKEN_KEY, ROOT_URL_API } from '../../global';
import User from './User';

let chatsRoomSocket = null
const Socket = {
    initConnection: () => {
        const socket = io(ROOT_URL_API, {
            transports: ['websocket'],
        });
        return socket;
    },

    setChatsRoomSocket: (socket) => {
        chatsRoomSocket = socket;
    },

    getChatsRoomSocket: () => {
        return chatsRoomSocket;
    },

    joinChatsRoom: () => {
        return new Promise(async (resolve, reject) => {
            try{
                if(!chatsRoomSocket) throw new Error("Socket is not initialized");
                const token = await AsyncStorage.getItem(AUTHENTICATION_TOKEN_KEY);
                if(!token) throw new Error("No token found");
                const validation = await User.validateToken()
                if(!validation.valid) throw new Error("Invalid token")
                chatsRoomSocket.emit("join-chats-room", {userId: validation.user._id});
            }catch(error){
                reject(error);
            }
        })
    }
}
export default Socket;