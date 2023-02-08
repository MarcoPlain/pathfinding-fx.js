/*! pathfinding-fx.js v1.0.4 | A visualization library experiment for interactive website effects based on pathfinding algorithms | Copyright 2023 | ISC license */
'use strict';

function PathfindingFX(element, map = null, settings = {}) {
  if (!(element instanceof Node)) {
    throw (
      "Can't initialize pathfinding-fx because " + element + " is not a Node."
    );
  }

  if (typeof map == null) {
    throw "Can't initialize pathfinding-fx because map is null.";
  }

  const defaults = {
    heuristics: "manhattan",
    allowDiagonal: true,

    wallNodeColor: "#dbdbdb",
    wallEdgeColor: "#a8a8a8",
    emptyNodeColor: "#f8f8f8",
    pathNodeColor: "#a8a8a8",
    highlightEdges: true,

    weightNodeColors: {
      5: { color: "#6c584c" },
      4: { color: "#a98467" },
      3: { color: "#adc178" },
      2: { color: "#dde5b6" },
      1: { color: "#f0ead2" },
      0: { color: "#0088bb", edgeColor: "#c2b280" },
    },

    interactive: true,
  };

  this.map = map || [];
  this.highestWeight = Math.max(...this.map.flat());

  this.path = [];

  this.nodesList = [];

  this.targetNodeIndex = null;
  this.targetWalkerIndex = null;
  this.currentContext = null;

  this.element = element;
  this.element.style.margin = "0 auto";
  this.element.style.mozUserSelect = "none";
  this.element.style.webkitUserSelect = "none";
  this.element.style.msUserSelect = "none";
  this.element.style.userSelect = "none";

  this.canvas = document.createElement("canvas");

  element.appendChild(this.canvas);

  this.ctx = this.canvas.getContext("2d");

  this.ctx.mozImageSmoothingEnabled = false;
  this.ctx.webkitImageSmoothingEnabled = false;
  this.ctx.msImageSmoothingEnabled = false;
  this.ctx.imageSmoothingEnabled = false;

  this.mouseIsDown = false;

  this._onDownHandler = (evt) => this.onDown(evt);
  this._onUpHandler = (evt) => this.onUp(evt);
  this._onLeaveHandler = (evt) => this.onLeave(evt);
  this._onMoveHandler = (evt) => this.onMove(evt);

  this.canvas.addEventListener("mousedown", this._onDownHandler);
  this.canvas.addEventListener("mouseup", this._onUpHandler);
  this.canvas.addEventListener("mouseleave", this._onLeaveHandler);
  this.canvas.addEventListener("mousemove", this._onMoveHandler);

  this.canvas.addEventListener("touchstart", this._onDownHandler);
  this.canvas.addEventListener("touchmove", this._onMoveHandler);
  this.canvas.addEventListener("touchend", this._onLeaveHandler);
  this.canvas.addEventListener("touchcancel", this._onLeaveHandler);

  // SETTINGS
  this.settings = {};

  this.settings.heuristics = settings.heuristics || defaults.heuristics;
  this.settings.allowDiagonal =
    typeof settings.allowDiagonal != "undefined"
      ? settings.allowDiagonal
      : defaults.allowDiagonal;

  this.settings.wallNodeColor =
    settings.wallNodeColor || defaults.wallNodeColor;
  this.settings.emptyNodeColor =
    settings.emptyNodeColor || defaults.emptyNodeColor;
  this.settings.pathNodeColor =
    settings.pathNodeColor || defaults.pathNodeColor;
  this.settings.weightNodeColors =
    settings.weightNodeColors || defaults.weightNodeColors;

  this.settings.highlightEdges =
    typeof settings.highlightEdges != "undefined"
      ? settings.highlightEdges
      : defaults.highlightEdges;
  this.settings.wallEdgeColor =
    typeof settings.wallEdgeColor != "undefined"
      ? settings.wallEdgeColor
      : defaults.wallEdgeColor;

  this.settings.interactive =
    typeof settings.interactive != "undefined"
      ? settings.interactive
      : defaults.interactive;

  this.sqrt2 = Math.sqrt(2);

  this._initMatrix();

  this.clearCanvas();

  // Animation Stuff
  this.animationFrameId = null;
  (this.lastFrameTimeMs = null),
    (this.maxFPS = 60),
    (this.delta = 0),
    (this.timestep = 1000 / 24);

  // Walkers Stuff
  this.walkers = [];

  // Callbacks Stuff
  this.onUpdateMap = settings.onUpdateMap || null;

  this.onInteractionWithAFreeNode = settings.onInteractionWithAFreeNode || null;
  this.onInteractionWithAWallNode = settings.onInteractionWithAWallNode || null;
  this.onInteractionWithANode = settings.onInteractionWithANode || null;

  this._initSizingAndDimensions();
  this._resizeHandler = () => this._initSizingAndDimensions();
  window.addEventListener("resize", () => this._resizeHandler);

  this.render();
  return this;
}

/**
 * Internal initialization of sizes and
 * dimensions.
 * */
PathfindingFX.prototype._initSizingAndDimensions = function () {
  this.element.style.removeProperty("width");
  this.element.style.removeProperty("height");
  this.canvas.style.removeProperty("width");
  this.canvas.style.removeProperty("height");

  const tileOffset = this.element.offsetWidth % this.map.length;

  this.element.style.width = this.element.offsetWidth - tileOffset + "px";
  this.element.style.height = this.element.style.width;

  this.width = this.element.offsetWidth;
  this.height = this.element.offsetWidth;

  this.canvas.width = this.width;
  this.canvas.height = this.height;

  this.tileSize = {
    h: Math.floor(this.height / this.map.length),
    w: Math.floor(this.width / this.map[0].length),
  };

  this.ctx.scale(1, 1);
  const rect = this.canvas.getBoundingClientRect();

  this.canvas.width = rect.width * devicePixelRatio;
  this.canvas.height = rect.height * devicePixelRatio;

  this.ctx.scale(devicePixelRatio, devicePixelRatio);

  this.canvas.style.width = rect.width + "px";
  this.canvas.style.height = rect.height + "px";

  this.nodesList.forEach((node) => {
    node.x = node.pos.x * this.tileSize.w;
    node.y = node.pos.y * this.tileSize.h;
  });

  // Prevent touch move from scrolling
  this.canvas.style.touchAction = "none";

  this.render();
};

/**
 * Initializes the matrix based on
 * the current state of the map in order to
 * find a path.
 */
PathfindingFX.prototype._initMatrix = function () {
  let nodeMatrix = [];
  for (let y = 0; y < this.map.length; y++) {
    nodeMatrix[y] = [];
    for (let x = 0; x < this.map[y].length; x++) {
      const weight = this.map[y][x];

      var weightSettings = null;
      var color = null;
      var edgeColor = null;
      if (this.highestWeight > 1) {
        weightSettings = this.settings.weightNodeColors[weight];
        color = weightSettings.color;
        edgeColor = weightSettings.edgeColor || null;
      } else {
        switch (weight) {
          case 1:
            color = this.settings.emptyNodeColor;
            break;
          case 0:
            color = this.settings.wallNodeColor;
            break;
        }
      }

      nodeMatrix[y][x] = {
        pos: {
          x: x,
          y: y,
        },
        w: this.map[y][x],
        f: 0,
        g: 0,
        style: {
          color: color,
          edgeColor: edgeColor,
        },
      };
    }
  }
  this.matrix = nodeMatrix;
};

/**
 * Calculates the path between two nodes or
 * returns all accessible positions.
 * @param Object from
 * @param Object to
 * @returns Array of nodes
 */
PathfindingFX.prototype._find = function (from, to = null, _params = {}) {
  this._initMatrix();

  let open = [this.matrix[from.y][from.x]];
  let closed = [];
  let positions = [];

  if (to) to = this.matrix[to.y][to.x];

  while (open.length) {
    var index = 0;
    for (var i = 0; i < open.length; i++) {
      if (open[i].f < open[index].f) {
        index = i;
      }
    }

    let currentNode = open[index];

    if (to && currentNode.pos.x == to.pos.x && currentNode.pos.y == to.pos.y) {
      var curr = currentNode;
      var ret = [];
      while (curr.p) {
        ret.push(curr);
        curr = curr.p;
      }
      ret.push(curr); // Add fromNode to the path
      return ret.reverse();
    }
    open.splice(index, 1);

    closed.push(currentNode);
    if (to === null) positions.push({ ...currentNode });

    let _neighbors = this._neighbors(currentNode, _params);
    for (let n = 0; n < _neighbors.length; n++) {
      let neighbor = _neighbors[n];
      let invalid = false;
      for (let c = 0; c < closed.length; c++) {
        if (
          closed[c].pos.x == neighbor.pos.x &&
          closed[c].pos.y == neighbor.pos.y
        )
          invalid = true;
      }
      if (invalid) continue;
      let g = currentNode.g;
      // Diagonal g
      if (
        neighbor.pos.x != currentNode.pos.x &&
        neighbor.pos.y != currentNode.pos.y
      ) {
        g += neighbor.w * this.sqrt2;
      } else {
        g += neighbor.w;
      }
      let gBest = false;
      let found = false;
      for (let o = 0; o < open.length; o++)
        if (open[o].pos.x == neighbor.pos.x && open[o].pos.y == neighbor.pos.y)
          found = true;

      if (!found) {
        gBest = true;
        neighbor.h =
          to !== null ? Math.round(this._distance(neighbor.pos, to.pos)) : 0;
        open.push(neighbor);
      } else if (g < neighbor.g) {
        gBest = true;
      }

      if (gBest) {
        neighbor.g = g;
        neighbor.p = currentNode;
        neighbor.f = neighbor.g + neighbor.h;
      }
    }
  }
  if (to) {
    return [];
  } else {
    positions.shift(); // Removing current from position from the array
    return positions;
  }
};

/**
 * Retrieves the neighbors of given node to
 * proceed with the pathfinding algorithm
 */
PathfindingFX.prototype._neighbors = function (node, params) {
  let _neighbors = [];
  if (
    this.matrix[node.pos.y - 1] &&
    this.matrix[node.pos.y - 1][node.pos.x] &&
    this.matrix[node.pos.y - 1][node.pos.x].w
  )
    _neighbors.push(this.matrix[node.pos.y - 1][node.pos.x]);
  if (
    this.matrix[node.pos.y + 1] &&
    this.matrix[node.pos.y + 1][node.pos.x] &&
    this.matrix[node.pos.y + 1][node.pos.x].w
  )
    _neighbors.push(this.matrix[node.pos.y + 1][node.pos.x]);
  if (
    this.matrix[node.pos.y] &&
    this.matrix[node.pos.y][node.pos.x - 1] &&
    this.matrix[node.pos.y][node.pos.x - 1].w
  )
    _neighbors.push(this.matrix[node.pos.y][node.pos.x - 1]);
  if (
    this.matrix[node.pos.y] &&
    this.matrix[node.pos.y][node.pos.x + 1] &&
    this.matrix[node.pos.y][node.pos.x + 1].w
  )
    _neighbors.push(this.matrix[node.pos.y][node.pos.x + 1]);
  if (
    typeof params.allowDiagonal == "undefined" ||
    params.allowDiagonal === true
  ) {
    // Diagonal _neighbors
    if (
      this.matrix[node.pos.y - 1] &&
      this.matrix[node.pos.y - 1][node.pos.x - 1] &&
      this.matrix[node.pos.y - 1][node.pos.x - 1].w &&
      this.matrix[node.pos.y - 1][node.pos.x] &&
      this.matrix[node.pos.y - 1][node.pos.x].w &&
      this.matrix[node.pos.y][node.pos.x - 1] &&
      this.matrix[node.pos.y][node.pos.x - 1].w
    )
      _neighbors.push(this.matrix[node.pos.y - 1][node.pos.x - 1]);
    if (
      this.matrix[node.pos.y + 1] &&
      this.matrix[node.pos.y + 1][node.pos.x - 1] &&
      this.matrix[node.pos.y + 1][node.pos.x - 1].w &&
      this.matrix[node.pos.y + 1][node.pos.x] &&
      this.matrix[node.pos.y + 1][node.pos.x].w &&
      this.matrix[node.pos.y][node.pos.x - 1] &&
      this.matrix[node.pos.y][node.pos.x - 1].w
    )
      _neighbors.push(this.matrix[node.pos.y + 1][node.pos.x - 1]);
    if (
      this.matrix[node.pos.y - 1] &&
      this.matrix[node.pos.y - 1][node.pos.x + 1] &&
      this.matrix[node.pos.y - 1][node.pos.x + 1].w &&
      this.matrix[node.pos.y - 1][node.pos.x] &&
      this.matrix[node.pos.y - 1][node.pos.x].w &&
      this.matrix[node.pos.y][node.pos.x + 1] &&
      this.matrix[node.pos.y][node.pos.x + 1].w
    )
      _neighbors.push(this.matrix[node.pos.y - 1][node.pos.x + 1]);
    if (
      this.matrix[node.pos.y + 1] &&
      this.matrix[node.pos.y + 1][node.pos.x + 1] &&
      this.matrix[node.pos.y + 1][node.pos.x + 1].w &&
      this.matrix[node.pos.y + 1][node.pos.x] &&
      this.matrix[node.pos.y + 1][node.pos.x].w &&
      this.matrix[node.pos.y][node.pos.x + 1] &&
      this.matrix[node.pos.y][node.pos.x + 1].w
    )
      _neighbors.push(this.matrix[node.pos.y + 1][node.pos.x + 1]);
  }
  return _neighbors;
};

/**
 * Calculates the distance between two noes
 * based on the heuristic in the settings
 */
PathfindingFX.prototype._distance = function (from, to) {
  var dx = Math.abs(from.x - to.x);
  var dy = Math.abs(from.y - to.y);
  switch (this.settings.heuristics) {
    case "euclidean":
      return Math.sqrt(dx * dx + dy * dy);
    case "manhattan":
    default:
      return dx + dy;
  }
};

/**
 * Calculates the path between two nodes.
 * @param Object from
 * @param Object to
 * @returns Array of nodes
 */
PathfindingFX.prototype.findPath = function (from, to, params = {}) {
  return this._find(from, to, params);
};

/**
 * Returns all accessible positions.
 * @param Object from
 * @returns Array of nodes
 */
PathfindingFX.prototype.positions = function (from, params = {}) {
  return this._find(from, null, params);
};

/**
 * Checks if a given position is not occupied by a node.
 * @param {*} pos
 * @returns
 */
PathfindingFX.prototype.free = function (pos) {
  return (
    this.nodesList.findIndex((n) => n.pos.x == pos.x && n.pos.y == pos.y) ==
      -1 &&
    this.nodesList
      .filter((n) => n.to)
      .map((n) => n.to)
      .findIndex((n) => n.pos.x == pos.x && n.pos.y == pos.y) == -1
  );
};

/**
 * Internal update function for auto play calculations.
 */
PathfindingFX.prototype._update = function (delta) {
  this.nodesList
    //.filter((n) => n.to)
    .forEach((node) => {
      if (typeof node.onUpdate === "function") node.onUpdate(node, delta);
      if (!node.to) return;
      if (node.isHovered) return;

      var speed = node.speed || 100;
      if (!speed) return;

      if (node.path.length > 1) {
        var dX = node.path[1].pos.x * this.tileSize.w - node.x;
        var dY = node.path[1].pos.y * this.tileSize.h - node.y;
        var sX = 0;
        var sY = 0;
        if (dX > 0) sX = speed / delta;
        if (dX < 0) sX = -speed / delta;
        if (dY > 0) sY = speed / delta;
        if (dY < 0) sY = -speed / delta;

        if (sY != 0 && sX != 0) {
          sX /= this.sqrt2;
          sY /= this.sqrt2;
        }

        node.x += sX;
        node.y += sY;

        var _distanceX = Math.abs(
          node.path[1].pos.x * this.tileSize.w - node.x
        );
        var _distanceY = Math.abs(
          node.path[1].pos.y * this.tileSize.h - node.y
        );

        if (_distanceX + _distanceY < speed / delta) {
          node.jump(1);
        }
      }
    });
};

/**
 * Internal animation function for auto play calculations and renderings.
 */
PathfindingFX.prototype._animation = function (pfx, timestamp) {
  if (pfx.lastFrameTimeMs === null) {
    pfx.lastFrameTimeMs = timestamp;
    pfx.delta = 0;
  }

  // Throttle the frame rate.
  if (timestamp < pfx.lastFrameTimeMs + 1000 / pfx.maxFPS) {
    pfx.animationFrameId = requestAnimationFrame(pfx._animation.bind(0, pfx));
    return;
  }

  pfx.delta += timestamp - pfx.lastFrameTimeMs;
  pfx.lastFrameTimeMs = timestamp;

  var numUpdateSteps = 0;
  while (pfx.delta >= pfx.timestep) {
    pfx._update(pfx.timestep);
    pfx.delta -= pfx.timestep;
    if (++numUpdateSteps >= 240) {
      pfx.delta = 0;
      break;
    }
  }
  pfx.render();
  pfx.animationFrameId = requestAnimationFrame(pfx._animation.bind(0, pfx));
};

/**
 * Starts auto play.
 */
PathfindingFX.prototype.play = function () {
  this.lastFrameTimeMs = null;
  this.animationFrameId = requestAnimationFrame(this._animation.bind(0, this));
  return this;
};

/**
 * Stops auto play.
 */
PathfindingFX.prototype.stop = function () {
  if (this.animationFrameId) {
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }
  this.lastFrameTimeMs = null;
  this.delta = 0;
  return this;
};

/**
 * Adds a node to the internal engine for rendering and pathfinding.
 */
PathfindingFX.prototype.addNode = function (node) {
  node = {
    ...node,
    ...{
      x: node.pos.x * this.tileSize.w,
      y: node.pos.y * this.tileSize.h,
      pfx: this,
      interactive:
        typeof node.interactive != "undefined" ? node.interactive : true,
    },
  };

  node.pos = new Proxy(
    {
      ...node.pos,
      ...{
        onPosChange: (n, p) => {
          node.findPath();
        },
      },
    },
    {
      set(obj, prop, value) {
        obj[prop] = value;

        node.x = node.pos.x * node.pfx.tileSize.w;
        node.y = node.pos.y * node.pfx.tileSize.h;

        return true;
      },
    }
  );

  this.nodesList.push(node);

  node.positions = () => {
    if (!node._positions) {
      node._positions = this.positions(node.pos);
    }
    return node._positions;
  };

  node.jump = (steps) => {
    if (node.path) {
      // Updating internal values because node has reached next path position

      node.pos.x = node.path[steps].pos.x;
      node.pos.y = node.path[steps].pos.y;

      node.x = node.pos.x * this.tileSize.w;
      node.y = node.pos.y * this.tileSize.h;

      if (typeof node.onPosChange === "function")
        node.onPosChange(node, node.pos);

      // When mouse is inside canvas we need to check, if by this change the mouse is now hovering over the node
      if (this.pixelPosition)
        this.nodeIsHovered(node, this.getXYFromPoint(this.pixelPosition));

      node.findPath();
      if (node.path.length <= 1 && typeof node.onPathEnd === "function") {
        node.onPathEnd(node);
      }
    }
  };

  node.findPath = (to = null) => {
    if (typeof node.path == "undefined") node.path = [];
    if (typeof to === null) to = node.to;
    // Check if node is trapped

    const isTrapped =
      typeof this.map[node.pos.y - 1] != "undefined" &&
      typeof this.map[node.pos.y - 1][node.pos.x] != "undefined" &&
      this.map[node.pos.y - 1][node.pos.x] == 0 &&
      typeof this.map[node.pos.y] != "undefined" &&
      typeof this.map[node.pos.y][node.pos.x + 1] != "undefined" &&
      this.map[node.pos.y][node.pos.x + 1] == 0 &&
      typeof this.map[node.pos.y + 1] != "undefined" &&
      typeof this.map[node.pos.y + 1][node.pos.x] != "undefined" &&
      this.map[node.pos.y + 1][node.pos.x] == 0 &&
      typeof this.map[node.pos.y] != "undefined" &&
      typeof this.map[node.pos.y][node.pos.x - 1] != "undefined" &&
      this.map[node.pos.y][node.pos.x - 1] == 0;

    node.to.show = !isTrapped;

    if (!isTrapped) {
      node.path = this.findPath(node.pos, node.to.pos, {
        allowDiagonal:
          typeof node.allowDiagonal != "undefined"
            ? node.allowDiagonal
            : this.settings.allowDiagonal,
      });
    } else {
      node.path = [];
      node.x = node.pos.x * this.tileSize.w;
      node.y = node.pos.y * this.tileSize.h;
    }

    if (node.path.length <= 1) {
      node._positions = null;
      if (typeof node.onNoPath == "function") {
        node.onNoPath(node);
      }
    }
  };

  node.delete = () => {
    this.nodesList.splice(
      this.nodesList.findIndex((n) => n == node),
      1
    );
  };

  this.drawNode(node);

  if (node.to) {
    node.to = new Proxy(
      {
        ...{
          onPosChange: (n, p) => {
            node.findPath();
          },
          ...node.to,
        },
      },
      {
        set(obj, prop, value) {
          obj[prop] = value;
          if (prop === "pos") {
            node.findPath();
          }
          return true;
        },
      }
    );

    node.findPath();
    this.drawPath(node);
  }

  if (typeof node.onAdd === "function") {
    node.onAdd(node);
  }

  this.render();

  return this;
};

/**
 * Resets PFX und removes all listeners and stuff.
 */
PathfindingFX.prototype.reset = function () {
  this.nodesList.length = 0;
  this.map.length = 0;

  this.canvas.removeEventListener("mousedown", this._onDownHandler);
  this.canvas.removeEventListener("mouseup", this._onUpHandler);
  this.canvas.removeEventListener("mouseleave", this._onLeaveHandler);
  this.canvas.removeEventListener("mousemove", this._onMoveHandler);

  this.canvas.removeEventListener("touchstart", this._onDownHandler);
  this.canvas.removeEventListener("touchmove", this._onMoveHandler);
  this.canvas.removeEventListener("touchend", this._onLeaveHandler);
  this.canvas.removeEventListener("touchcancel", this._onLeaveHandler);

  this.onLeave();
  this.clearCanvas();

  window.removeEventListener("resize", () => this._resizeHandler);

  this.canvas.remove();
};

/**
 * Renders the canvas
 */
PathfindingFX.prototype.render = function () {
  //this.clearCanvas();
  this.drawMap();
  this.nodesList.forEach((node) => {
    if (typeof node.onRender === "function") node.onRender(node);

    if (node.path && node.path.length) {
      node.path.shift();
      node.path.unshift({ x: node.x, y: node.y });
      this.drawPath(node);

      if (node.to && node.to.style) this.drawNode(node.to);
    }

    this.drawNode(node);
  });

  /*if(this.settings.interactive){
        if (this.interactionFocus) {
          this.drawContext(this.interactionFocus);
        } else if (this.position) {
          this.drawContext({ pos: this.position });
        }
      }*/

  return this;
};

/**
 * Clears the canvas
 */
PathfindingFX.prototype.clearCanvas = function () {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

PathfindingFX.prototype.drawMap = function () {
  this.clearCanvas();

  for (let y = 0; y < this.map.length; y++) {
    for (let x = 0; x < this.map[y].length; x++) {
      const color =
        this.matrix &&
        this.matrix[y] &&
        this.matrix[y][x] &&
        this.matrix[y][x].style &&
        this.matrix[y][x].style.color
          ? this.matrix[y][x].style.color
          : this.map[y][x] === 1
          ? this.settings.emptyNodeColor
          : this.settings.wallNodeColor;

      const edgeColor =
        this.matrix &&
        this.matrix[y] &&
        this.matrix[y][x] &&
        this.matrix[y][x].style &&
        this.matrix[y][x].style.edgeColor
          ? this.matrix[y][x].style.edgeColor
          : this.settings.wallEdgeColor;

      this.drawNode(
        {
          pos: { x: x, y: y },
        },
        {
          color: color,
          highlightEdges: {
            top:
              (y == 0 && this.map[y][x] != 0) ||
              (this.map[y][x] == 0 &&
                this.map[y - 1] &&
                this.map[y - 1][x] != 0)
                ? { color: edgeColor }
                : null,
            right:
              (x == this.map[y].length - 1 && this.map[y][x] != 0) ||
              (this.map[y][x] == 0 &&
                typeof this.map[y][x + 1] != "undefined" &&
                this.map[y][x + 1] != 0)
                ? { color: edgeColor }
                : null,
            bottom:
              (y == this.map.length - 1 && this.map[y][x] != 0) ||
              (this.map[y][x] == 0 &&
                this.map[y + 1] &&
                this.map[y + 1][x] != 0)
                ? { color: edgeColor }
                : null,
            left:
              (x == 0 && this.map[y][x] != 0) ||
              (this.map[y][x] == 0 &&
                typeof this.map[y][x - 1] != "undefined" &&
                this.map[y][x - 1] != 0)
                ? { color: edgeColor }
                : null,
            // also corners
            topLeft:
              this.map[y][x] == 0 &&
              this.map[y - 1] &&
              this.map[y - 1][x] == 0 &&
              this.map[y][x - 1] == 0 &&
              this.map[y - 1][x - 1] != 0
                ? { color: edgeColor }
                : null,
            topRight:
              this.map[y][x] == 0 &&
              this.map[y - 1] &&
              this.map[y - 1][x] == 0 &&
              this.map[y][x + 1] == 0 &&
              this.map[y - 1][x + 1] != 0
                ? { color: edgeColor }
                : null,
            bottomRight:
              this.map[y][x] == 0 &&
              this.map[y + 1] &&
              this.map[y + 1][x] == 0 &&
              this.map[y][x + 1] == 0 &&
              this.map[y + 1][x + 1] != 0
                ? { color: edgeColor }
                : null,
            bottomLeft:
              this.map[y][x] == 0 &&
              this.map[y + 1] &&
              this.map[y + 1][x] == 0 &&
              this.map[y][x - 1] == 0 &&
              this.map[y + 1][x - 1] != 0
                ? { color: edgeColor }
                : null,
          },
        }
      );
    }
  }
  return this;
};

PathfindingFX.prototype.drawPath = function (node) {
  node.path.forEach((n, key) => {
    let next = node.path[key + 1];
    if (!next) return;

    var drawX = typeof n.x != "undefined" ? n.x : n.pos.x * this.tileSize.w;
    var drawY = typeof n.y != "undefined" ? n.y : n.pos.y * this.tileSize.h;

    this.ctx.strokeStyle =
      node.path.color ||
      (typeof node.to != "undefined" &&
        typeof node.to.style != "undefined" &&
        typeof node.to.style.color != "undefined")
        ? node.to.style.color
        : typeof node.style != "undefined" &&
          typeof node.style.color != "undefined"
        ? node.style.color
        : this.settings.pathNodeColor;
    this.ctx.beginPath();
    this.ctx.moveTo(drawX + this.tileSize.w / 2, drawY + this.tileSize.h / 2);
    this.ctx.lineTo(
      next.pos.x * this.tileSize.w + this.tileSize.w / 2,
      next.pos.y * this.tileSize.h + this.tileSize.h / 2
    );
    this.ctx.stroke();
  });
};

PathfindingFX.prototype.drawContext = function (node) {
  node.style = {
    color: this.settings.wallNodeColor,
    mode: "stroke",
    shape: "roundRect",
  };

  this.drawNode(node);
};

PathfindingFX.prototype.drawNode = function (node, config = {}) {
  if (!node) return;

  const shape = node.style && node.style.shape ? node.style.shape : "rect";
  const mode = node.style && node.style.mode ? node.style.mode : "fill";

  var drawX =
    (node.x || node.pos.x * this.tileSize.w) +
    (typeof node.style != "undefined" && typeof node.style.size != "undefined"
      ? (this.tileSize.w - this.tileSize.w * node.style.size.w) / 2
      : 0);
  var drawY =
    (node.y || node.pos.y * this.tileSize.h) +
    (typeof node.style != "undefined" && typeof node.style.size != "undefined"
      ? (this.tileSize.h - this.tileSize.h * node.style.size.h) / 2
      : 0);

  var sizeX =
    typeof node.style != "undefined" && typeof node.style.size != "undefined"
      ? node.style.size.w * this.tileSize.w
      : this.tileSize.w;
  var sizeY =
    typeof node.style != "undefined" && typeof node.style.size != "undefined"
      ? node.style.size.h * this.tileSize.h
      : this.tileSize.h;

  this.ctx.fillStyle =
    typeof node.style != "undefined"
      ? node.style.color
      : config.color || this.settings.pathNodeColor;

  this.ctx.strokeStyle =
    typeof node.style != "undefined"
      ? node.style.color
      : config.color || this.settings.pathNodeColor;

  switch (mode) {
    case "fill":
      switch (shape) {
        case "rect":
          this.ctx.fillRect(drawX, drawY, sizeX, sizeY);
          if (this.settings.highlightEdges && config.highlightEdges) {
            if (config.highlightEdges.top) {
              this.ctx.fillStyle = config.highlightEdges.top.color;
              this.ctx.fillRect(drawX, drawY, sizeX, 2);
            }
            if (config.highlightEdges.right) {
              this.ctx.fillStyle = config.highlightEdges.right.color;
              this.ctx.fillRect(drawX + sizeX - 2, drawY, 2, sizeY);
            }
            if (config.highlightEdges.bottom) {
              this.ctx.fillStyle = config.highlightEdges.bottom.color;
              this.ctx.fillRect(drawX, drawY + sizeY - 2, sizeX, 2);
            }
            if (config.highlightEdges.left) {
              this.ctx.fillStyle = config.highlightEdges.left.color;
              this.ctx.fillRect(drawX, drawY, 2, sizeY);
            }
            if (config.highlightEdges.topLeft) {
              this.ctx.fillStyle = config.highlightEdges.topLeft.color;
              this.ctx.fillRect(drawX, drawY, 2, 2);
            }
            if (config.highlightEdges.topRight) {
              this.ctx.fillStyle = config.highlightEdges.topRight.color;
              this.ctx.fillRect(drawX + sizeX - 2, drawY, 2, 2);
            }
            if (config.highlightEdges.bottomRight) {
              this.ctx.fillStyle = config.highlightEdges.bottomRight.color;
              this.ctx.fillRect(drawX + sizeX - 2, drawY + sizeY - 2, 2, 2);
            }
            if (config.highlightEdges.bottomLeft) {
              this.ctx.fillStyle = config.highlightEdges.bottomLeft.color;
              this.ctx.fillRect(drawX, drawY + sizeY - 2, 2, 2);
            }
            break;
          }
          break;
        case "circle":
          this.ctx.beginPath();
          this.ctx.arc(
            drawX + sizeX / 2,
            drawY + sizeY / 2,
            (sizeX + sizeY) / 2 / 2, // First normalize w and h and the divide by 2
            0,
            2 * Math.PI
          );
          this.ctx.fill();
          this.ctx.stroke();
          break;
      }
      break;
    case "stroke":
      switch (shape) {
        case "rect":
          this.ctx.strokeRect(drawX - 2, drawY - 2, sizeX + 4, sizeY + 4);
          break;
        case "roundRect":
          this.ctx.beginPath();
          this.ctx.roundRect(drawX - 2, drawY - 2, sizeX + 4, sizeY + 4, 5);
          this.ctx.stroke();
          break;
        case "circle":
          this.ctx.beginPath();
          this.ctx.arc(
            drawX + sizeX / 2,
            drawY + sizeY / 2,
            (sizeX + sizeY) / 2 / 2, // First normalize w and h and the divide by 2
            0,
            2 * Math.PI
          );
          this.ctx.fill();
          this.ctx.stroke();
          break;
      }
      break;
  }
};

// START : CANVAS INTERACTIONS

PathfindingFX.prototype.normalizePointFromEvent = function (event) {
  var rect = event.target.getBoundingClientRect();

  if (event.type == "mousedown" || event.type == "mousemove")
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  if (event.type == "touchstart" || event.type == "touchmove")
    return {
      x: event.touches[0].clientX - rect.left,
      y: event.touches[0].clientY - rect.top,
    };
};

PathfindingFX.prototype.getXYFromPoint = function (point) {
  const x = Math.round((point.x - this.tileSize.w / 2) / this.tileSize.w);
  const y = Math.round((point.y - this.tileSize.h / 2) / this.tileSize.h);
  return { x: x, y: y };
};

PathfindingFX.prototype.onDown = function (event) {
  this.mouseIsDown = true;
  this.pixelPosition = this.normalizePointFromEvent(event);
  this.position = this.getXYFromPoint(this.pixelPosition);

  const { type, node } = this.detectContext(this.position, event);

  var setPos = null;

  switch (type) {
    case "free":
      setPos = (pos) => {
        if (typeof this.onInteractionWithAFreeNode === "function") {
          this.onInteractionWithAFreeNode(node, pos, this);
        } else {
          if (
            this.settings.interactive &&
            this.free(pos) &&
            typeof this.map[pos.y] != "undefined" &&
            typeof this.map[pos.y][pos.x] != "undefined"
          ) {
            this.map[pos.y][pos.x] = 0;
            this.updateMap(this.map);
          }
        }
      };
      break;
    case "wall":
      setPos = (pos) => {
        if (typeof this.onInteractionWithAWallNode === "function") {
          this.onInteractionWithAWallNode(node, pos, this);
        } else {
          if (
            this.settings.interactive &&
            this.free(pos) &&
            typeof this.map[pos.y] != "undefined" &&
            typeof this.map[pos.y][pos.x] != "undefined"
          ) {
            this.map[pos.y][pos.x] = 1;
            this.updateMap(this.map);
          }
        }
      };
      break;
    case "node":
      setPos = (pos) => {
        if (typeof this.onInteractionWithANode === "function") {
          this.onInteractionWithANode(node, pos, this);
        } else {
          // Determine if node can have new position
          if (
            this.map[pos.y] &&
            this.map[pos.y][pos.x] &&
            (node.pos.x != pos.x || node.pos.y != pos.y)
          ) {
            node.pos = pos;

            node._positions = null;

            // Also setting the pixel position of the node, if it exists
            if (typeof node.x != "undefined") node.x = pos.x * this.tileSize.w;
            if (typeof node.y != "undefined") node.y = pos.y * this.tileSize.h;

            if (typeof node.onPosChange === "function")
              node.onPosChange(node, pos);
            if (node.to) node.findPath();
          }
        }
      };
      break;
  }
  if (setPos !== null) {
    this.interactionFocus = {
      pos: { x: -1, y: -1 },
      node: node,
      setPos: function (pos) {
        this.pos = pos;
        setPos(pos);
      },
    };

    this.interactionFocus.setPos(this.position);

    if (this.animationFrameId === null) {
      this.render();
    }
  }
};

PathfindingFX.prototype.onLeave = function (event) {
  this.currentContext = null;
  this.pixelPosition = null;
  this.onUp(event);
  if (typeof event != "undefined" && event.type == "touchend") {
    event.preventDefault();
  }
};

PathfindingFX.prototype.onUp = function (event) {
  this.mouseIsDown = false;
  this.interactionFocus = null;
  this.position = null;
  if (typeof event != "undefined" && event.type == "touchend") {
    this.nodesList.forEach(n=>{n.isHovered = false;});
  }
  this.render();
};

PathfindingFX.prototype.nodeIsHovered = function (node, c, pos) {
  node.isHovered =
    (!this.interactionFocus || this.interactionFocus.node == node) &&
    node.pos.x == c.x &&
    node.pos.y == c.y;
  return node.isHovered;

  /*
      TODO Is this pixel perfect hover collusion detection still needed?
      const minX =
          node.x +
          (typeof node.size != "undefined"
            ? (this.tileSize.w - node.size.w) / 2
            : 0),
        maxX = minX + node.size.w,
        minY =
          node.y +
          (typeof node.size != "undefined"
            ? (this.tileSize.h - node.size.h) / 2
            : 0),
        maxY = minY + node.size.h;
      node.isHovered =
        pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY;
      return node.isHovered;
      */
};

PathfindingFX.prototype.detectContext = function (pos, event) {
  if (!pos) return;

  /*const walkerIndex = this.walkers.findIndex((n) =>
        this.walkerIsHovered(n, pos, this.normalizePointFromEvent(event))
      );

      if (walkerIndex >= 0) {
        return {
          node: this.walkers[walkerIndex],
          type: "walker",
        };
      }*/

  let nodeIndex = this.nodesList
    .filter((n) => n.interactive)
    .findIndex((n) =>
      this.nodeIsHovered(n, pos, this.normalizePointFromEvent(event))
    );

  if (nodeIndex >= 0) {
    return {
      node: this.nodesList[nodeIndex],
      type: "node",
    };
  }

  nodeIndex = this.nodesList
    .filter((n) => n.to)
    .map((n) => n.to)
    .findIndex((n) =>
      this.nodeIsHovered(n, pos, this.normalizePointFromEvent(event))
    );

  if (nodeIndex >= 0) {
    return {
      node: this.nodesList.filter((n) => n.to).map((n) => n.to)[nodeIndex],
      type: "node",
    };
  }

  if (
    typeof this.map[pos.y] == "undefined" ||
    typeof this.map[pos.y][pos.x] == "undefined"
  ) {
    return false;
  }

  // Check if current node might be a wall
  if (this.map[pos.y][pos.x] === 0) {
    return {
      type: "wall",
      node: { pos: { x: pos.x, y: pos.y } },
    };
  }
  if (this.map[pos.y][pos.x] > 0) {
    return {
      type: "free",
      node: { pos: { x: pos.x, y: pos.y } },
    };
  }
};

PathfindingFX.prototype.onMove = function (event) {
  this.pixelPosition = this.normalizePointFromEvent(event);
  this.position = this.getXYFromPoint(this.pixelPosition);

  if (this.interactionFocus) {
    if (
      this.interactionFocus.pos.x !== this.position.x ||
      this.interactionFocus.pos.y !== this.position.y
    ) {
      console.log("setting pos");
      this.interactionFocus.setPos(this.position);
    }
  } else {
    this.detectContext(this.position, event);
  }

  if (this.animationFrameId === null) {
    this.render();
  }
};

PathfindingFX.prototype.updateMap = function (map) {
  if (typeof this.onUpdateMap === "function") this.onUpdateMap(map);
  this.map = map;
  this._initMatrix();
  this.highestWeight = Math.max(...this.map.flat());
  this.nodesList.forEach((node) => {
    node._positions = null;
    if (node.to) node.findPath();
  });
};

module.exports = PathfindingFX;
