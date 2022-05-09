import io from 'socket.io-client/dist/socket.io'
import { ROOT_URL_API } from '../../global';

const ENDPOINT = ROOT_URL_API;
export default io(ENDPOINT);