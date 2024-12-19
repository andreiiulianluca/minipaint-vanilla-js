function Button(label, action) {
  UIComponent.call(this, "button");
  this.setText(label);
  this.addEventListener("click", action);
}

Button.prototype = Object.create(UIComponent.prototype);
Button.prototype.constructor = Button;

Object.assign(Button.prototype, {
  setText: function (text) {
    this.element.innerText = text;
  },
});


function renderButtons(buttonContainer, board, undoRedoManager) {
  const undoButton = new Button("Undo", () => board.undo());
  const redoButton = new Button("Redo", () => board.redo());
  const clearButton = new Button("Clear", () => board.clear());

  undoButton.attachTo(buttonContainer);
  redoButton.attachTo(buttonContainer);
  clearButton.attachTo(buttonContainer);

  undoRedoManager.onChange((event) => {
    const { undoSize, redoSize } = event.detail;
    undoButton.setDisabled(undoSize === 0);
    redoButton.setDisabled(redoSize === 0);
  });

  undoButton.setDisabled(true);
  redoButton.setDisabled(true);
}


