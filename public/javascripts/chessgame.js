const socket = io();  
const chess = new Chess()
const boardElement = document.querySelector('.chessboard')

let dragPiece = null
let sourceSquare = null
let playerRole = null

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
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
        pieceElement.innerText = "";
        pieceElement.draggable = playerRole === square.color;
        
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

}

const handelMove = () => {}

const getPieceUnicode = () => {
  const unicodePieces = {
    K: "♔",  // King
    Q: "♕",  // Queen
    R: "♖",  // Rook
    B: "♗",  // Bishop
    N: "♘",  // Knight
    P: "♙",  // Pawn
    k: "♚",  // King
    q: "♛",  // Queen
    r: "♜",  // Rook
    b: "♝",  // Bishop
    n: "♞",  // Knight
    p: "♟"   // Pawn
  }

  return unicodePieces[piece.type] || ""
}

renderBoard();


