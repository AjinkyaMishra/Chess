const socket = io();  
const chess = new Chess()
const boardElement = document.querySelector('.chessboard')

let dragPiece = null
let sourceSquare = null
let playerRole = null

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";

  let kingInCheckSquare = null;

  if (chess.in_check()) {
    board.forEach((row, r) => {
      row.forEach((sq, c) => {
        if (sq && sq.type === "k" && sq.color === chess.turn()) {
          kingInCheckSquare = { row: r, col: c };
        }
      });
    });
  }

  board.forEach((row, rowindex ) => {
    row.forEach((square, squareindex) => {
      const squareElement = document.createElement("div")
      squareElement.classList.add("square", 
        (rowindex + squareindex)%2 === 0 ? "light" : "dark"
      )

      squareElement.dataset.row = rowindex
      squareElement.dataset.col = squareindex

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add("piece", square.color === 'w' ? "white" : "black")
        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;

      if ( kingInCheckSquare && kingInCheckSquare.row === rowindex && kingInCheckSquare.col === squareindex ) {
        squareElement.classList.add("check");
      }
        
        pieceElement.addEventListener("dragstart", (e) => {
          if(pieceElement.draggable){
            dragPiece = pieceElement
            sourceSquare = { row: rowindex, col: squareindex}
            e.dataTransfer.setData("text/plain", "")
          }
        })
        pieceElement.addEventListener("dragend", (e) => { 
          dragPiece = null 
          sourceSquare = null 
        })
        squareElement.appendChild(pieceElement)
      }
      
      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      })

      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if(dragPiece) {
          const targetSource = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col)
          }

          handelMove(sourceSquare, targetSource)
        }
      })
      boardElement.appendChild(squareElement)
    })
  })
  if(playerRole === 'b'){
    boardElement.classList.add("flipped")
  }
  else {
    boardElement.classList.remove("flipped")
  }
}

const handelMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97+source.col)}${8-source.row}`,
    to: `${String.fromCharCode(97+target.col)}${8-target.row}`,
    promotion: 'q',
  }

  socket.emit("move", move)
}

const getPieceUnicode = (piece) => {
  const white = {
    p: "♙", r: "♖", n: "♘", b: "♗", q: "♕", k: "♔"
  };
  const black = {
    p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚"
  };

  return piece.color === "w"
    ? white[piece.type]
    : black[piece.type];
};

socket.on("playerColor", (role) => {
  playerRole = role;
  renderBoard()
})

socket.on("spectatorRole", () => {
  playerRole = null;
  renderBoard()
})

socket.on("boardState", (fen) => {
  chess.load(fen)
  renderBoard();
})

socket.on("move", (move) => {
  chess.move(move)
  renderBoard();
})

socket.on("gameState", (state) => {
  chess.load(state.fen);
  renderBoard();

  if (state.checkmate) {
    const winner = state.turn === 'w' ? "Black" : "White";
    alert(`♟️ CHECKMATE! ${winner} wins`);
  }
  else if (state.draw) {
    alert("🤝 Game Draw");
  }
  else if (state.stalemate) {
    alert("😐 Stalemate");
  }
  else if (state.check) {
    console.log("Check!");
  }
});

renderBoard();


