const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const fs = require("fs");
const mysql = require("mysql");
const { compileFunction } = require("vm");

var rooms = {}
var defaultrooms = {}

var con = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "toor",
    database: "chatapp"
});

con.connect(function(err) {
	if (err) throw err
    console.log("db connected")
});

con.query("SELECT * FROM rooms", function (err, result, fields){
    if (err) throw err;
    console.log(result[0])
    result.forEach(element => {
        rooms[element.roomname] = []
        if (element.default == 1) {
            defaultrooms[element.roomname] = []
        }
    });
    console.log(rooms)
    console.log(defaultrooms)
    // make default rooms show upon connection
})

const app = express();

app.use(express.static(path.resolve(__dirname, "public", "")));

// Serve static files from the "app" subfolder
app.use("/apps", express.static(path.resolve(__dirname, "public", "apps")));
app.use("/files", express.static(path.resolve(__dirname, "public", "filesys")));
app.use("/imgs", express.static(path.resolve(__dirname, "public", "imgs")));
app.use("/temp", express.static(path.resolve(__dirname, "public", "temp")));

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "public"));
});

const server = app.listen(3000, () => {
    console.log("Server running!")
});



const io = socketio(server);

io.on("connection", (socket) => {
    socket.emit("handshake", socket.id, (callback) =>{
        console.log(callback.status + " " + callback.id)

        socket.on("createroom", (data, callback) => {
            var data = data.replace(/ /g, "-");
            if (data in rooms) {
                callback({status: "exists"})
            } else {
            rooms[data] = []
            con.query(`INSERT INTO rooms VALUES (null, "${data}", "0")`, function (err, results, fields){
                if (err) throw err;
                con.query("SELECT * FROM rooms", function (err, result, fields){
                    if (err) throw err;
                    result.forEach(element => {
                        console.log(element)
                    });    
                })
            })
            con.query(`CREATE TABLE IF NOT EXISTS ${data} (
                id INT AUTO_INCREMENT,
                sender VARCHAR(20), 
                content VARCHAR(2048), 
                reply TINYINT(1), 
                replycontent VARCHAR(2048), 
                timecode TIME(6),
                PRIMARY KEY (id)
            );`, 
                function (err, results, fields){
                if (err) throw err;
            })
            console.log(rooms)
            callback({status: "created"})
        }})

        socket.on("joinroom", (data, callback) => {
            let id = data[0]
            let room = data[1]
            if (room in rooms) {
                if (rooms[room].includes(id)) {
                    callback({status: "in room"})
                } else {
                rooms[room].push(id)
                console.log(rooms[room])
                console.log(rooms)
                callback({status: "added"})
                }
            } else {
                callback({status: "not found"})
            }
        })
        
        socket.on("leaveroom", (data, callback) => {
            let room = data[0]
            let id = data[1]
            removefromroom(room, id)
            callback({status: "removed"})
        })

        socket.on("deleteroom", (data, callback) => {
            // removefromroom(data, socket.id)
            deleteroom(data)
            callback()
        })

        socket.on("message", (data, callback) => {
            let messageroom = data[0]
            let messagesender = data[1]
            let messagecontent = data[2]
            let messagebundle = [messagesender, messagecontent]
            console.log(`sending to room ${data[0]} from ${data[1]}: ${data[2]}`)
            callback()
            sendMessage(messageroom, messagebundle)
            con.query(`INSERT INTO ${messageroom} (sender, content) VALUES ("${messagesender}", "${messagecontent}")`, function (err, results, fields) {
                if (err) throw err;
                con.query(`SELECT * FROM
                (
                    SELECT * FROM ${messageroom} ORDER BY id DESC LIMIT 1
                   ) AS sub
                   ORDER BY id ASC;`, function (err, results, fields) {
                    if (err) throw err;
                    console.log(results[0])
                   })
            })
        })

        socket.on("disconnect", () => {
            console.log(`client ${socket.id} has disconnected`)
        })

    })
})

function sendMessage(room, bundle) {
    try {
    rooms[room].forEach(element => {
        io.to(element).emit("messageincoming", bundle)
    });
    } catch {
        console.log("room undefined")
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
        console.log("removed from room :thinking:")
    }
}

function deleteroom(roomtodelete) {
    delete rooms[roomtodelete]
    con.query(`DROP TABLE IF EXISTS ${roomtodelete}`, function (err, results, fields) {
        if (err) throw err;
    })
    con.query(`DELETE FROM rooms WHERE roomname="${roomtodelete}"`, function (err, results, fields) {
        if (err) throw err;
    })
    console.log(rooms)
    return rooms
}

// SELECT * FROM
// (
//     SELECT * FROM table ORDER BY id DESC LIMIT 50
//    ) AS sub
//    ORDER BY id ASC;

// !! for future sql shennanigans