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

function handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.getElementById('messageForm').submit();
    }
  }

  function sendMessage(content, id, room) {
    messageinfo = [id, room, content]
    socket.emit('message', content)
    console.log("Message sent:", content);
  }

function handleSubmit(event) {
    event.preventDefault(); // Prevents the default form submission behavior

    // Get the content of the textbox
    const textbox = document.getElementById('messageTextbox');
    const messageContent = textbox.value;

    // Call the sendMessage function with the content as a parameter
    sendMessage(messageContent, clientid, 'testroom');

    // Clear the textbox
    textbox.value = '';
  }