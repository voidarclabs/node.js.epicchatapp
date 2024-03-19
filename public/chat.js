const socket = io()

var clientid
var currentroom


socket.on('handshake', (clientidrecieved, callback) => {
    clientid = clientidrecieved
    callback({
        status: "ok",
        id: clientid
      });
    return clientid
})

socket.on('messageincoming', (data) => {
  let user = data[0]
  let message = data[1]
  let timecode = new Date().toLocaleTimeString()

  if (user == clientid) {
    let isself = 'self'
    let messagehtml = `
    <div id='messageoverlapper'>
      <div id="messagecontainer" class='${isself}'>
        <div id="user" class="subtext">${user}</div>
        <div id="mainmessage" class="maintext">${message}</div>
        <div id="timecode" class="subtext">${timecode}</div>
      </div>
    </div>
    `

    addtomessages(messagehtml)
  } else {
    let isself = 'notself'
    let messagehtml = `
    <div id='messageoverlapper'>
      <div id="messagecontainer" class='${isself}'>
        <div id="user" class="subtext">${user}</div>
        <div id="mainmessage" class="maintext">${message}</div>
        <div id="timecode" class="subtext">${timecode}</div>
      </div>
    </div>
    `

    addtomessages(messagehtml)
  }

})

const textInput = document.getElementById('messageTextbox');
textInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleSubmit()
  }
});

function sendMessage(room, id, message) {
  let messageinfo = [room, id, message]
  socket.emit('message', messageinfo, (callback) => {
    console.log('message recieved')
  })
}

function handleSubmit() {

    // Get the content of the textbox
    const textbox = document.getElementById('messageTextbox');
    const messageContent = textbox.value;
    if (messageContent != '') {

    

    // Call the sendMessage function with the content as a parameter
    sendMessage(currentroom, clientid, messageContent);

    // Clear the textbox
    textbox.value = '';
  } else {
    console.log('message empty')
  }}

function createroom(room) {
  socket.emit('createroom', room, (callback) => {
    console.log(callback.status)
    switchroom(room)
  })
}

function joinroom(room) {
  let roominfo = [clientid, room]

  socket.emit('joinroom', roominfo ,(callback) => {
    let status = callback.status
    console.log(status)

    if (status = 'added') {
      currentroom = room
      console.log(currentroom)
      if (document.getElementById(`chat${room}`)) {

      } else {
        let newroomoption = `
        <div onclick="switchroom('${room}')" id="${room}-roomoption" class="chatidcontainer">
          <div id="chat${room}">${room}</div>
          <div id='leaveroom${room}' onclick='handleleaveroom('${room}')'>leave</div>
        </div>
        `
        document.getElementById('chats').innerHTML += newroomoption
    }
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

function switchroom(room) {
  if (room == currentroom) {
    console.log(currentroom)
  } else {
    leaveroom(currentroom)
    joinroom(room)
    document.getElementById('chatwindow').innerHTML = ''
  }
}

window.onbeforeunload = function(){
  leaveroom(currentroom)
}

function addtomessages(message) {
  document.getElementById('chatwindow').innerHTML += message
}

function makeroomoption(state) {
  let popup = document.getElementById('popupcontainer')
  let popupwindow = document.getElementById('createformcontainer')

  popup.classList.toggle('active')
  popupwindow.classList.toggle('active')
}

function joinroomoption() {
  let popup = document.getElementById('popupcontainer')
  let popupwindow = document.getElementById('joinformcontainer')

  popup.classList.toggle('active')
  popupwindow.classList.toggle('active')
}

function handlecreateroom() {
  let createroominput = document.getElementsByClassName('createroomtext')

  let roomname = createroominput[0].value

  createroom(roomname)
  document.getElementsByClassName('exitcreateformcontainer')[0].click()
}

function handlejoinroom() {
  let joinroominput = document.getElementsByClassName('joinroomtext')

  let roomname = joinroominput[0].value

  joinroom(roomname)
  document.getElementsByClassName('exitjoinformcontainer')[0].click()
}

function handleleaveroom(room) {
  let roomcontainer = document.getElementById()
}

function exitroomoption(room) {
  socket.emit('deleteroom', room, (callback) => {
    document.getElementById(`${room}-roomoption`).remove()
  })
}