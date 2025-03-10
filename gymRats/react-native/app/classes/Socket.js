const { default: AsyncStorage } = require('@react-native-async-storage/async-storage');
import io from 'socket.io-client/dist/socket.io'
import { AUTHENTICATION_TOKEN_KEY, ROOT_URL_API } from '../../global';
import User from './User';

let chatsRoomSocket = null
const Socket = {
    initConnection: () => {
        console.log(ROOT_URL_API);
        /* , {
            transports: ["websocket"]
        }
        */
        const socket = io(ROOT_URL_API);
        socket.on('connect', () => {
            console.log('connected_');
        })
        socket.on('disconnect', () => {
            chatsRoomSocket = null;
            console.log('disconnected_');
        })
        console.log("connected 2")
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
            try {
                console.log("join chats room");
                const token = await AsyncStorage.getItem(AUTHENTICATION_TOKEN_KEY);
                const validation = await User.validateToken()
                if (token && chatsRoomSocket && validation.valid){
                    chatsRoomSocket.emit("join-chats-room", { userId: validation.user._id });
                }
            } catch (error) {
                reject(error);
            }
        })
    }
}
export default Socket;