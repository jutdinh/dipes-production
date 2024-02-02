import { io } from 'socket.io-client';
import socketServer from '../../proxy';

// export const socket = io( socketServer() ? socketServer(): "http://127.0.0.1:5001" );

export const socket = io( socketServer() ? socketServer(): "" );