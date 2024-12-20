const WHITE = "#FFFFFF";
const BLACK = "#000000";

function Board(height, width) {
  this.height = height;
  this.width = width;
  this.pixels = [];
  this.renderQueue = new Set();
  this.isDrawing = false;
  this.undoRedoManager = new UndoRedoManager();
}

Object.assign(Board.prototype, {
  initializeRendering: function (container) {
    const savedState = this.loadState();
    this.container = container;
    this.container.style.gridTemplateColumns = `repeat(${this.width}, 10px)`;
    this.container.style.gridTemplateRows = `repeat(${this.height}, 10px)`;

    for (let i = 0; i < this.height; i++) {
      const row = [];
      for (let j = 0; j < this.width; j++) {
        const pixel = new Pixel(container, i, j);
        if (savedState && savedState[i] && savedState[i][j]) {
          pixel.setColor(savedState[i][j]);
        }
        row.push(pixel);
      }
      this.pixels.push(row);
    }

    this.container.addEventListener("mousemove", (event) => {
      if (this.isDrawing && event.target.classList.contains("pixel")) {
        const [x, y] = event.target.dataset.position.split(",").map(Number);
        const positionKey = `${x},${y}`;

        if (!this.renderQueue.has(positionKey)) {
          this.renderQueue.add(positionKey);
          this.startRendering();
        }
      }
    });
  },

  restoreState: function (state) {
    this.renderQueue.clear();

    const restoredState = Array.from({ length: this.height }, () =>
      Array(this.width).fill(WHITE)
    );

    Object.keys(state).forEach((key) => {
      const [i, j] = key.split(",").map(Number);
      restoredState[i][j] = BLACK;
    });

    this.pixels.forEach((row, i) =>
      row.forEach((pixel, j) => {
        if (pixel.color !== restoredState[i][j]) {
          pixel.setColor(restoredState[i][j]);
        }
      })
    );

    this.startRendering();
  },

  loadState: function () {
    const savedState = localStorage.getItem("boardState");
    if (!savedState) return null;

    const savedPixels = JSON.parse(savedState);
    const state = Array.from({ length: this.height }, () =>
      Array(this.width).fill(WHITE)
    );

    Object.keys(savedPixels).forEach((key) => {
      const [i, j] = key.split(",").map(Number);
      state[i][j] = BLACK;
    });

    return state;
  },

  saveState: function () {
    const currentState = this.getCurrentState();
    localStorage.setItem("boardState", JSON.stringify(currentState));
  },

  startDrawing: function () {
    this.isDrawing = true;
    this.initialState = this.getCurrentState();
    this.startRendering();
  },

  stopDrawing: function () {
    const currentState = this.saveState();

    if (JSON.stringify(currentState) !== JSON.stringify(this.initialState)) {
      this.undoRedoManager.pushState(this.initialState);
    }

    this.isDrawing = false;
  },

  undo: function () {
    if (this.undoRedoManager.getUndoStackSize() > 0) {
      const currentState = this.getCurrentState();

      const lastState = this.undoRedoManager.undo(currentState);

      this.renderQueue.clear();
      this.restoreState(lastState);
    }
  },

  redo: function () {
    if (this.undoRedoManager.getRedoStackSize() > 0) {
      const currentState = this.getCurrentState();

      const redoState = this.undoRedoManager.redo(currentState);

      this.renderQueue.clear();
      this.restoreState(redoState);
    }
  },

  clear: function () {
    this.pixels.forEach((row) =>
      row.forEach((pixel) => {
        pixel.setColor(WHITE);
      })
    );
    localStorage.removeItem("boardState");
    this.undoRedoManager.clear();
    this.startRendering();
  },

  startRendering: function () {
    if (this.renderQueue.size > 0) {
      requestAnimationFrame(this.render.bind(this));
    }
  },

  render: function () {
    if (this.renderQueue.size > 0) {
      const [positionKey] = this.renderQueue;
      const [x, y] = positionKey.split(",").map(Number);
      const pixel = this.pixels[x][y];

      const newColor = BLACK;
      pixel.setColor(newColor);

      this.renderQueue.delete(positionKey);

      requestAnimationFrame(this.render.bind(this));
    }
  },

  getCurrentState: function () {
    const currentPixels = {};
    this.pixels.forEach((row, i) => {
      row.forEach((pixel, j) => {
        if (pixel.color === BLACK) {
          currentPixels[`${i},${j}`] = BLACK;
        }
      });
    });
    return currentPixels;
  },
});
