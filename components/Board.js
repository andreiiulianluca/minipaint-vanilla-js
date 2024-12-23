const WHITE = "#FFFFFF";
const BLACK = "#000000";

function Board(height, width) {
  this.height = height;
  this.width = width;
  this.pixels = [];
  this.renderQueue = new Set();
  this.isDrawing = false;
  this.undoRedoManager = new UndoRedoManager();
  this.renderFrameId = null;
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

    this.container.addEventListener(
      "mousemove",
      this.handleMouseMove.bind(this)
    );
  },

  handleMouseMove: function (event) {
    if (!this.isDrawing || !event.target.classList.contains("pixel")) return;

    const [x, y] = event.target.dataset.position.split(",").map(Number);
    const positionKey = `${x},${y}`;

    this.renderQueue.add(positionKey);

    if (!this.renderFrameId) {
      this.startRendering();
    }
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
    this.container.style.cursor = "crosshair";

    if (this.renderFrameId) {
      cancelAnimationFrame(this.renderFrameId);
      this.renderFrameId = null;
    }
  },

  stopDrawing: function () {
    const currentState = this.getCurrentState();

    if (JSON.stringify(currentState) !== JSON.stringify(this.initialState)) {
      this.undoRedoManager.pushState(this.initialState);
      this.saveState();
    }

    this.isDrawing = false;
    this.container.style.cursor = "default";
    this.renderQueue.clear();

    if (this.renderFrameId) {
      cancelAnimationFrame(this.renderFrameId);
      this.renderFrameId = null;
    }
  },

  undo: function () {
    const currentState = this.getCurrentState();
    const lastState = this.undoRedoManager.undo(currentState);
    this.restoreState(lastState);
    this.renderQueue.clear();
  },

  redo: function () {
    const currentState = this.getCurrentState();
    const redoState = this.undoRedoManager.redo(currentState);
    this.renderQueue.clear();
    this.restoreState(redoState);
  },

  clear: function () {
    this.pixels.forEach((row) =>
      row.forEach((pixel) => {
        pixel.setColor(WHITE);
      })
    );
    localStorage.removeItem("boardState");
    this.undoRedoManager.clear();
  },

  startRendering: function () {
    if (this.renderQueue.size > 0 && !this.renderFrameId) {
      this.renderFrameId = requestAnimationFrame(() => this.render());
    }
  },

  render: function () {
    this.renderFrameId = null;

    if (this.renderQueue.size > 0) {
      const pixelsToRender = Array.from(this.renderQueue);
      this.renderQueue.clear();

      pixelsToRender.forEach((positionKey) => {
        const [x, y] = positionKey.split(",").map(Number);
        if (this.pixels[x] && this.pixels[x][y]) {
          this.pixels[x][y].setColor(BLACK);
        }
      });

      if (this.renderQueue.size > 0) {
        this.renderFrameId = requestAnimationFrame(this.render.bind(this));
      }
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
