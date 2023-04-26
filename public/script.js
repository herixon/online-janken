const socket = io();
const joinButton = document.getElementById('join');

joinButton.addEventListener('click', () => {
  const roomKey = document.getElementById('room-key').value;
  socket.emit('join', roomKey);
});

socket.on('joined', () => {
  const message = document.createElement('p');
  message.textContent = 'You have joined the room!';
  document.body.appendChild(message);

  const joinForm = document.getElementById('join-form');
  const game = document.getElementById('game');
  if (joinForm && game) {
    joinForm.style.display = 'none';
    game.style.display = 'block';
  }
});

socket.on('game-start', () => {
  const message = document.createElement('p');
  message.textContent = 'ゲームスタート！';
  document.body.appendChild(message);
});

socket.on('game-result', (result) => {
  const resultElement = document.getElementById('result');
  if (result === 'draw') {
    resultElement.textContent = '引き分け';
  } else {
    const winner = result === 'player1' ? 'プレイヤー1' : 'プレイヤー2';
    resultElement.textContent = `${winner} の勝利`;
  }
});

socket.on('game-history', (history) => {
  const historyContainer = document.getElementById('history');
  historyContainer.innerHTML = ''; // Clear previous history

  history.forEach((result, index) => {
    const item = document.createElement('p');
    const gameNumber = index + 1;

    if (result === 'draw') {
      item.textContent = `ゲーム${gameNumber}: 引き分け`;
    } else {
      const winner = result === 'player1' ? 'プレイヤー1' : 'プレイヤー2';
      item.textContent = `ゲーム${gameNumber}: ${winner} の勝利`;
    }

    historyContainer.appendChild(item);
  });
});

const choices = document.querySelectorAll('#game button');
choices.forEach((choice) => {
    choice.addEventListener('click', () => {
      socket.emit('play', choice.id);
    });
  });
  
  socket.on('error', (error) => {
    const errorMessage = document.createElement('p');
    errorMessage.textContent = `Error: ${error}`;
    errorMessage.style.color = 'red';
    document.body.appendChild(errorMessage);
  });