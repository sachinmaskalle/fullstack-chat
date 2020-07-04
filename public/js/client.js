const chatForm = document.getElementById('chat-form');
const chatMessages =  document.querySelector('.chat-messages');
const roomName =  document.querySelector('#room-name');
const usersList =  document.querySelector('#users');

// Get username and room from URL

const { username, room } = Qs.parse(location.search,{
    ignoreQueryPrefix: true
});

const socket = io();

// Join chat room
socket.emit('joinRoom',{ username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    displayRoomName(room);
    displayUsers(users);
});

// Message from server
socket.on('message', message => {
    
    displayMessage(message);

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Chat submit event
chatForm.addEventListener('submit', e => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    // Emit a message to server
    socket.emit('chatMessage',msg);

    // Clear form input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

function displayMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
                    <p class="text">
                       ${message.textMsg}
                    </p>`;
    chatMessages.appendChild(div);
}

function displayRoomName(room) {
    roomName.innerHTML = room;
}

// Add users to DOM
function displayUsers(users) {
    usersList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}`;
}