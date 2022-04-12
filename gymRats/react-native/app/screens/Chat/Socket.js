import io from "socket.io-client";
const ENDPOINT = 'http://localhost:4056';
export default io(ENDPOINT);