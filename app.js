const express = require('express');
const socket = require('socket.io');
const http = require('http');
const { Chess } = require('chess.js');
const path = require('path');
const { title } = require('process');

const app = express();
const server = http.createServer(app);

const io = socket(server)

const chess = new Chess();
let players = {};
let currentPlayer = 'W';

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index' , { title: "Chess Game" });
})

io.on("connection", (uniquesocket) => {
  console.log("connected");
  
  if(!players.white){
    players.white = uniquesocket.id;
    uniquesocket.emit("playerColor", "w");
  }
  
  else if(!players.black){
    players.black = uniquesocket.id;
    uniquesocket.emit("playerColor", "b");
  }

  else
    uniquesocket.emit("spectatorRole");
  
  uniquesocket.on("disconnect", () => {
    if(uniquesocket.id === players.white) {
      delete players.white;
    }
    else if(uniquesocket.id === players.black) {
      delete players.black;
    }
  })

  uniquesocket.on("move", (move) => {
  try {
    if (chess.turn() === 'w' && uniquesocket.id !== players.white) return;
    if (chess.turn() === 'b' && uniquesocket.id !== players.black) return;

    const result = chess.move(move);
    if (!result) return;

    const gameState = {
      fen: chess.fen(),
      check: chess.isCheck(),
      checkmate: chess.isCheckmate(),
      draw: chess.isDraw(),
      stalemate: chess.isStalemate(),
      turn: chess.turn()
};

    io.emit("gameState", gameState);

  } catch (err) {
    console.log(err);
  }
});
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
})