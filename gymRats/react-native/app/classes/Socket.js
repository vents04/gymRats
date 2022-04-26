import io from 'socket.io-client/dist/socket.io'
const ENDPOINT = 'http://192.168.0.184:4056';
export default io(ENDPOINT);