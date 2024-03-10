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

var rooms = {}

const io = socketio(server);

io.on('connection', (socket) => {
    socket.emit('handshake', socket.id, (callback) =>{
        console.log(callback.status + ' ' + callback.id)

        socket.on('createroom', (data, callback) => {
            if (data in rooms) {
                callback({status: 'exists'})
            } else {
            rooms[data] = []
            console.log(rooms)
            callback({status: 'created'})
        }})

        socket.on('joinroom', (data, callback) => {
            let id = data[0]
            let room = data[1]
            if (room in rooms) {
                if (rooms[room].includes(id)) {
                    callback({status: 'in room'})
                } else {
                rooms[room].push(id)
                console.log(rooms[room])
                console.log(rooms)
                callback({status: 'added'})
                }
            } else {
                callback({status: 'not found'})
            }
        })
        
        socket.on('leaveroom', (data, callback) => {
            let room = data[0]
            let id = data[1]
            removefromroom(room, id)
            callback({status: 'removed'})
        })

        socket.on('message', (data, callback) => {
            let messageroom = data[0]
            let messagesender = data[1]
            let messagecontent = data[2]
            let messagebundle = [messagesender, messagecontent]
            console.log(`sending to room ${data[0]} from ${data[1]}: ${data[2]}`)
            callback()
            sendMessage(messageroom, messagebundle)
        })

        socket.on('disconnect', () => {
            console.log(`client ${socket.id} has disconnected`)
        })

    })
})

function sendMessage(room, bundle) {
    try {
    rooms[room].forEach(element => {
        io.to(element).emit('messageincoming', bundle)
    });
    } catch {
        console.log('room undefined')
    }

}

function removefromroom(room, id) {
    try {
    const index = rooms[room].indexOf(id);
    if (index > -1) { 
        rooms[room].splice(index, 1); 
        console.log(rooms[room])
        return rooms
    }} catch {
        console.log('error')
    }
}

// SELECT * FROM
// (
//     SELECT * FROM table ORDER BY id DESC LIMIT 50
//    ) AS sub
//    ORDER BY id ASC;

// !! for future sql shennanigans