import io from 'socket.io-client/dist/socket.io'
const ENDPOINT = 'http://localhost:4056';
export default io(ENDPOINT);