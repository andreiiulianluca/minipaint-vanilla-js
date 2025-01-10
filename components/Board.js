const WHITE = "#FFFFFF";
const BLACK = "#000000";

function Board(height, width) {
  this.height = height;
  this.width = width;
  this.pixels = [];
  this.renderQueue = new Set();
  this.undoRedoManager = new UndoRedoManager();
  this.renderFrameId = null;
}

Object.assign(Board.prototype, {
  initializeRendering: function (container) {
    const savedState = this.loadState();
    this.container = container;
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.container.style.gridTemplateColumns = `repeat(${this.width}, 10px)`;
    this.container.style.gridTemplateRows = `repeat(${this.height}, 10px)`;

    for (let i = 0; i < this.height; i++) {
      const row = [];
      for (let j = 0; j < this.width; j++) {
        const pixel = new Pixel(container, i, j);
        if (savedState && savedState[`${i},${j}`]) {
          pixel.setColor(savedState[`${i},${j}`]);
        } else {
          pixel.setColor(WHITE);
        }
        row.push(pixel);
      }
      this.pixels.push(row);
    }

    this.container.addEventListener(
      "mousedown",
      this.handleMouseDown.bind(this)
    );
    this.container.addEventListener("mouseup", this.handleMouseUp.bind(this));
  },

  handleMouseDown: function (event) {
    if (event.target.classList.contains("pixel")) {
      this.initialState = this.getCurrentState();
      this.container.style.cursor = "crosshair";

      if (this.renderFrameId) {
        cancelAnimationFrame(this.renderFrameId);
        this.renderFrameId = null;
      }
      this.container.addEventListener("mousemove", this.boundHandleMouseMove);
    }
  },

  handleMouseMove: function (event) {
    if (event.target.classList.contains("pixel")) {
      const [x, y] = event.target.dataset.position.split(",").map(Number);
      const positionKey = `${x},${y}`;

      this.renderQueue.add(positionKey);

      if (!this.renderFrameId) {
        this.startRendering();
      }
    }
  },

  handleMouseUp: function () {
    const currentState = this.getCurrentState();

    if (JSON.stringify(currentState) !== JSON.stringify(this.initialState)) {
      this.undoRedoManager.pushState(this.initialState);
      this.saveState();
    }

    this.container.style.cursor = "default";
    this.renderQueue.clear();

    if (this.renderFrameId) {
      cancelAnimationFrame(this.renderFrameId);
      this.renderFrameId = null;
    }
    this.notifyBoardStateChange();
    this.container.removeEventListener("mousemove", this.boundHandleMouseMove);
  },

  restoreState: function (state) {
    this.renderQueue.clear();

    this.pixels.forEach((row, i) =>
      row.forEach((pixel, j) => {
        if (state[`${i},${j}`]) {
          pixel.setColor(BLACK);
        } else {
          pixel.setColor(WHITE);
        }
      })
    );
    this.notifyBoardStateChange();
  },

  loadState: function () {
    const savedState = localStorage.getItem("boardState");

    return savedState ? JSON.parse(savedState) : null;
  },

  saveState: function () {
    const currentState = this.getCurrentState();
    localStorage.setItem("boardState", JSON.stringify(currentState));
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
    this.notifyBoardStateChange();
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

  isBoardClear: function () {
    return this.pixels.every((row) =>
      row.every((pixel) => pixel.color === WHITE)
    );
  },

  subscribeToUndoRedoManager: function (callback) {
    this.undoRedoManager.onChange(callback);
  },

  notifyBoardStateChange: function () {
    const event = new CustomEvent("boardStateChange", {
      detail: { isClear: this.isBoardClear() },
    });
    this.container.dispatchEvent(event);
  },
});
