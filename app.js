const boardContainer = document.getElementById("board");
const buttonContainer = document.getElementById("buttons");

const board = new Board(50, 50);

board.initializeRendering(boardContainer);

const undoButton = new Button("Undo", () => board.undo());
const redoButton = new Button("Redo", () => board.redo());
const clearButton = new Button("Clear", () => board.clear());

undoButton.attachTo(buttonContainer);
redoButton.attachTo(buttonContainer);
clearButton.attachTo(buttonContainer);

undoButton.setDisabled(true);
redoButton.setDisabled(true);

board.subscribeToUndoRedoManager((event) => {
  const { undoSize, redoSize } = event.detail;
  undoButton.setDisabled(undoSize === 0);
  redoButton.setDisabled(redoSize === 0);
});

boardContainer.addEventListener("mousedown", () => {
  board.startDrawing();
});

boardContainer.addEventListener("mouseup", () => {
  board.stopDrawing();
});
