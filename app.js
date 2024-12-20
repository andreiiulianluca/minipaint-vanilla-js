const boardContainer = document.getElementById("board");
const buttonContainer = document.getElementById("buttons");

const board = new Board(50, 50);
const undoRedoManager = board.undoRedoManager;

board.initializeRendering(boardContainer);

renderButtons(buttonContainer, board, undoRedoManager);

boardContainer.addEventListener("mousedown", () => {
  board.startDrawing();
});

boardContainer.addEventListener("mouseup", () => {
  board.stopDrawing();
});
