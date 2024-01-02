const io = require('socket.io-client');
const socket = io.connect('http://tiene.us-3.evennode.com:443');

socket.on('connect', () => {
  console.log('Successfully connected!');
});
