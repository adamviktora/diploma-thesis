const ip = '192.168.105.3';
const port = '30300';

const socket = new WebSocket(`ws://${ip}:${port}/`);

function sendMessage(e) {
  e.preventDefault();
  const input = document.querySelector('input');
  if (input.value) {
    const message = JSON.stringify({
      type: 'USER_CONNECTION',
      userId: input.value,
    });
    socket.send(message);
  }
  input.focus();
}

document.querySelector('form').addEventListener('submit', sendMessage);

// Listen for all messages from WS server
socket.addEventListener('message', ({ data }) => {
  const li = document.createElement('li');
  li.textContent = data;
  document.querySelector('ul').appendChild(li);
});
