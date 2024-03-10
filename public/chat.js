const socket = io()

var clientid



socket.on('handshake', (clientidrecieved, callback) => {
    clientid = clientidrecieved
    callback({
        status: "ok",
        id: clientid
      });
    return clientid
})

socket.on('messageincoming', (data) => {
  console.log(data)
})

function handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.getElementById('messageForm').submit();
    }
  }

function sendMessage(room, id, message) {
  let messageinfo = [room, id, message]
  socket.emit('message', messageinfo, (callback) => {
    console.log('message recieved')
  })
}

function handleSubmit(event) {
    event.preventDefault(); // Prevents the default form submission behavior

    // Get the content of the textbox
    const textbox = document.getElementById('messageTextbox');
    const messageContent = textbox.value;

    // Call the sendMessage function with the content as a parameter
    sendMessage(currentroom, clientid, messageContent);

    // Clear the textbox
    textbox.value = '';
  }

function createroom(room) {
  socket.emit('createroom', room, (callback) => {
    console.log(callback.status)
    joinroom(room)
  })
}
var currentroom;
function joinroom(room) {
  let roominfo = [clientid, room]

  socket.emit('joinroom', roominfo ,(callback) => {
    let status = callback.status
    console.log(status)

    if (status = 'added') {
      currentroom = room
      console.log(currentroom)
      return currentroom
    }
    if (status = 'in room') {
      }
    if (status = 'not found') {
    }
  })
}

function leaveroom(room) {
  let roominfo = [room, clientid]
  socket.emit('leaveroom', roominfo ,(callback) => {
    currentroom = undefined;
    return currentroom
  })
}

window.onbeforeunload = function(){
  leaveroom(currentroom)
}