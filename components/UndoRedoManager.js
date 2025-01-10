function UndoRedoManager() {
  this.undoStack = [];
  this.redoStack = [];
  this.eventTarget = new EventTarget();
}

Object.assign(UndoRedoManager.prototype, {
  pushState: function (state) {
    this.undoStack.push(state);
    this.redoStack = [];
    this.notifyStackChange();
  },

  undo: function (currentState) {
    this.redoStack.push(currentState);
    const lastState = this.undoStack.pop();
    this.notifyStackChange();
    return lastState;
  },

  redo: function (currentState) {
    this.undoStack.push(currentState);
    const redoState = this.redoStack.pop();
    this.notifyStackChange();
    return redoState;
  },

  clear: function () {
    this.undoStack = [];
    this.redoStack = [];
    this.notifyStackChange();
  },

  getUndoStackSize: function () {
    return this.undoStack.length;
  },

  getRedoStackSize: function () {
    return this.redoStack.length;
  },

  notifyStackChange: function () {
    this.eventTarget.dispatchEvent(
      new CustomEvent("stackChange", {
        detail: {
          undoSize: this.getUndoStackSize(),
          redoSize: this.getRedoStackSize(),
        },
      })
    );
  },

  onChange: function (callback) {
    this.eventTarget.addEventListener("stackChange", callback);
  },
});
