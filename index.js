const express = require('express');
const socketio = require('socket.io');
const path = require('path');
const fs = require('fs');


const app = express();

app.use(express.static(path.resolve(__dirname, 'public', '')));

// Serve static files from the 'app' subfolder
app.use('/apps', express.static(path.resolve(__dirname, 'public', 'apps')));
app.use('/files', express.static(path.resolve(__dirname, 'public', 'filesys')));
app.use('/imgs', express.static(path.resolve(__dirname, 'public', 'imgs')));
app.use('/temp', express.static(path.resolve(__dirname, 'public', 'temp')));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public'));
});

const server = app.listen(3000, () => {
    console.log('Server running!')
});

const io = socketio(server);

io.on('connection', (socket) => {
    socket.emit('handshake', socket.id, (callback) =>{
        console.log(callback.status + ' ' + callback.id)
        socket.on('message', (data) => {
            console.log(`${data.id}: ${data.content}`)
        })
    })
})