var PathfindingFX = (function () {
  "use strict";

  /**
   * Created by Marco Schlichting (marcoplain) on 22/12/2022.
   * MIT License.
   * Version 1.0.0
   */

  const defaults = {
    wallNodeColor: "#dbdbdb",
    wallEdgeColor: "#a8a8a8",
    emptyNodeColor: "#f8f8f8",
    pathNodeColor: "#a8a8a8",
    floodNodeColor: "#585858",
    startNodeColor: "#0088bb",
    endNodeColor: "#00bb88",

    highlightEdges: true,

    weightColors: [
      { w: 1, color: "#6c584c" },
      { w: 0.75, color: "#a98467" },
      { w: 0.5, color: "#adc178" },
      { w: 0.25, color: "#dde5b6" },
      { w: 0, color: "#f0ead2" },
    ],
  };

  class PathfindingFX {
    constructor(element, settings = {}) {
      this.map = settings.map || [];

      this.highestWeight = Math.max(...this.map.flat());

      // START PATHFINDING

      this.heuristics = "manhattan";

      this.path = [];

      // SETTINGS
      this.settings = {
        greedy: settings.greedy || defaults.greedy,
      };
      // END PATHFINDING

      if (!(element instanceof Node)) {
        throw (
          "Can't initialize pathfinding-fx because " +
          element +
          " is not a Node."
        );
      }


      this.nodesList = [];
      
      this.interactionMode = null;
      this.targetNodeIndex = null;
      this.targetWalkerIndex = null;
      this.currentContext = null;

      this.element = element;

      this.canvas = document.createElement("canvas");

      element.appendChild(this.canvas);

      this.ctx = this.canvas.getContext("2d");

      this.ctx.mozImageSmoothingEnabled = false;
      this.ctx.webkitImageSmoothingEnabled = false;
      this.ctx.msImageSmoothingEnabled = false;
      this.ctx.imageSmoothingEnabled = false;

      this.mouseIsDown = false;

      this._mouseDownHandler = (evt) => this.mouseDown(evt);
      this._mouseUpHandler = (evt) => this.mouseUp(evt);
      this._mouseLeaveHandler = (evt) => this.mouseLeave(evt);
      this._mouseMoveHandler = (evt) => this.mouseMove(evt);

      this.canvas.addEventListener("mousedown", this._mouseDownHandler);
      this.canvas.addEventListener("mouseup", this._mouseUpHandler);
      this.canvas.addEventListener("mouseleave", this._mouseLeaveHandler);
      this.canvas.addEventListener("mousemove", this._mouseMoveHandler);


      // Settings
      this.settings = {};
      this.settings.wallNodeColor =
        settings.wallNodeColor || defaults.wallNodeColor;
      this.settings.emptyNodeColor =
        settings.emptyNodeColor || defaults.emptyNodeColor;
      this.settings.pathNodeColor =
        settings.pathNodeColor || defaults.pathNodeColor;
      this.settings.floodNodeColor =
        settings.floodNodeColor || defaults.floodNodeColor;
      this.settings.startNodeColor =
        settings.startNodeColor || defaults.startNodeColor;
      this.settings.endNodeColor =
        settings.endNodeColor || defaults.endNodeColor;

      this.settings.highlightEdges =
        typeof settings.highlightEdges != "undefined"
          ? settings.highlightEdges
          : defaults.highlightEdges;
      this.settings.wallEdgeColor =
        typeof settings.wallEdgeColor != "undefined"
          ? settings.wallEdgeColor
          : defaults.wallEdgeColor;

      this.sqrt2 = Math.sqrt(2);

      this.initMatrix();

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

      this.onInteractionWithAFreeNode =
        settings.onInteractionWithAFreeNode || null;
      this.onInteractionWithAWallNode =
        settings.onInteractionWithAWallNode || null;
      this.onInteractionWithANode = settings.onInteractionWithANode || null;

      this._initSizingAndDimensions();
      this._resizeHandler = () => this._initSizingAndDimensions();
      window.addEventListener("resize", () => this._resizeHandler);

      this.render();

      return this;
    }

    _initSizingAndDimensions() {
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

      this.render();
    }

    /**
     * Initializes the matrix based on
     * the current state of the map in order to
     * find a path.
     */
    initMatrix() {
      let nodeMatrix = [];
      for (let y = 0; y < this.map.length; y++) {
        nodeMatrix[y] = [];
        for (let x = 0; x < this.map[y].length; x++) {
          const weight = this.map[y][x];

          var color = null;
          if (this.highestWeight > 1) {
            if (weight == 0) {
              color = defaults.weightColors[0];
              color = color.color;
            } else {
              const weightPercentage = weight / this.highestWeight;
              var color = defaults.weightColors.filter(
                (color) => weightPercentage >= color.w
              );
              color = color.shift();
              color = color.color;
            }
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
            },
          };
        }
      }
      this.matrix = nodeMatrix;
    }

    /**
     * Calculates the path between two nodes
     * @param Object from
     * @param Object to
     * @returns Array of nodes
     */
    findPath = (from, to) => {
      this.initMatrix();
      to = this.matrix[to.y][to.x];

      let open = [this.matrix[from.y][from.x]];
      let closed = [];

      while (open.length) {
        var lowInd = 0;
        for (var i = 0; i < open.length; i++) {
          if (open[i].f < open[lowInd].f) {
            lowInd = i;
          }
        }

        let currentNode = open[lowInd];

        // End case -- result has been found, return the traced path
        if (currentNode.pos.x == to.pos.x && currentNode.pos.y == to.pos.y) {
          //console.log("OHA OHA");
          var curr = currentNode;
          var ret = [];
          while (curr.p) {
            ret.push(curr);
            curr = curr.p;
          }
          ret.push(curr); // Add fromNode to the path
          return ret.reverse();
        }
        open.splice(lowInd, 1);

        closed.push(currentNode);

        let neighbors = this.neighbors(currentNode);
        for (let n = 0; n < neighbors.length; n++) {
          let neighbor = neighbors[n];
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
            if (
              open[o].pos.x == neighbor.pos.x &&
              open[o].pos.y == neighbor.pos.y
            )
              found = true;

          if (!found) {
            gBest = true;
            neighbor.h = Math.round(this.distance(neighbor.pos, to.pos));
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

      return [];
    };

    positions = (from) => {
      this.initMatrix();

      let open = [this.matrix[from.y][from.x]];
      let closed = [];
      let positions = [];

      while (open.length) {
        var lowInd = 0;
        for (var i = 0; i < open.length; i++) {
          if (open[i].f < open[lowInd].f) {
            lowInd = i;
          }
        }

        let currentNode = open[lowInd];

        open.splice(lowInd, 1);

        closed.push(currentNode);
        positions.push({ ...currentNode });

        let neighbors = this.neighbors(currentNode);
        for (let n = 0; n < neighbors.length; n++) {
          let neighbor = neighbors[n];

          if (
            neighbor.pos.x == currentNode.pos.x - 1 &&
            neighbor.pos.y == currentNode.pos.y
          ) {
            neighbor.dir = "left";
          }
          if (
            neighbor.pos.x == currentNode.pos.x + 1 &&
            neighbor.pos.y == currentNode.pos.y
          ) {
            neighbor.dir = "right";
          }
          if (
            neighbor.pos.x == currentNode.pos.x &&
            neighbor.pos.y == currentNode.pos.y - 1
          ) {
            neighbor.dir = "top";
          }
          if (
            neighbor.pos.x == currentNode.pos.x &&
            neighbor.pos.y == currentNode.pos.y + 1
          ) {
            neighbor.dir = "bottom";
          }

          neighbor.linear =
            typeof currentNode.dir == "undefined" ||
            (currentNode.linear && currentNode.dir == neighbor.dir);

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
            if (
              open[o].pos.x == neighbor.pos.x &&
              open[o].pos.y == neighbor.pos.y
            )
              found = true;

          if (!found) {
            gBest = true;
            neighbor.h = 0; //Math.round(this.distance(neighbor.pos, to.pos));
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

      positions.shift(); // Removing current from position from the array
      return positions;
    };

    neighbors = (node) => {
      let neighbors = [];
      if (
        this.matrix[node.pos.y - 1] &&
        this.matrix[node.pos.y - 1][node.pos.x] &&
        this.matrix[node.pos.y - 1][node.pos.x].w
      )
        neighbors.push(this.matrix[node.pos.y - 1][node.pos.x]);
      if (
        this.matrix[node.pos.y + 1] &&
        this.matrix[node.pos.y + 1][node.pos.x] &&
        this.matrix[node.pos.y + 1][node.pos.x].w
      )
        neighbors.push(this.matrix[node.pos.y + 1][node.pos.x]);
      if (
        this.matrix[node.pos.y] &&
        this.matrix[node.pos.y][node.pos.x - 1] &&
        this.matrix[node.pos.y][node.pos.x - 1].w
      )
        neighbors.push(this.matrix[node.pos.y][node.pos.x - 1]);
      if (
        this.matrix[node.pos.y] &&
        this.matrix[node.pos.y][node.pos.x + 1] &&
        this.matrix[node.pos.y][node.pos.x + 1].w
      )
        neighbors.push(this.matrix[node.pos.y][node.pos.x + 1]);

      // Diagonal neighbors
      if (
        this.matrix[node.pos.y - 1] &&
        this.matrix[node.pos.y - 1][node.pos.x - 1] &&
        this.matrix[node.pos.y - 1][node.pos.x - 1].w &&
        this.matrix[node.pos.y - 1][node.pos.x] &&
        this.matrix[node.pos.y - 1][node.pos.x].w &&
        this.matrix[node.pos.y][node.pos.x - 1] &&
        this.matrix[node.pos.y][node.pos.x - 1].w
      )
        neighbors.push(this.matrix[node.pos.y - 1][node.pos.x - 1]);
      if (
        this.matrix[node.pos.y + 1] &&
        this.matrix[node.pos.y + 1][node.pos.x - 1] &&
        this.matrix[node.pos.y + 1][node.pos.x - 1].w &&
        this.matrix[node.pos.y + 1][node.pos.x] &&
        this.matrix[node.pos.y + 1][node.pos.x].w &&
        this.matrix[node.pos.y][node.pos.x - 1] &&
        this.matrix[node.pos.y][node.pos.x - 1].w
      )
        neighbors.push(this.matrix[node.pos.y + 1][node.pos.x - 1]);
      if (
        this.matrix[node.pos.y - 1] &&
        this.matrix[node.pos.y - 1][node.pos.x + 1] &&
        this.matrix[node.pos.y - 1][node.pos.x + 1].w &&
        this.matrix[node.pos.y - 1][node.pos.x] &&
        this.matrix[node.pos.y - 1][node.pos.x].w &&
        this.matrix[node.pos.y][node.pos.x + 1] &&
        this.matrix[node.pos.y][node.pos.x + 1].w
      )
        neighbors.push(this.matrix[node.pos.y - 1][node.pos.x + 1]);
      if (
        this.matrix[node.pos.y + 1] &&
        this.matrix[node.pos.y + 1][node.pos.x + 1] &&
        this.matrix[node.pos.y + 1][node.pos.x + 1].w &&
        this.matrix[node.pos.y + 1][node.pos.x] &&
        this.matrix[node.pos.y + 1][node.pos.x].w &&
        this.matrix[node.pos.y][node.pos.x + 1] &&
        this.matrix[node.pos.y][node.pos.x + 1].w
      )
        neighbors.push(this.matrix[node.pos.y + 1][node.pos.x + 1]);

      return neighbors;
    };

    distance = (from, to) => {
      var dx = Math.abs(from.x - to.x);
      var dy = Math.abs(from.y - to.y);
      switch (this.heuristics) {
        case "euclidean":
          return Math.sqrt(dx * dx + dy * dy);
        case "manhattan":
        default:
          return dx + dy;
      }
    };

    free = (pos) => {
      return (
        this.nodesList.findIndex((n) => n.pos.x == pos.x && n.pos.y == pos.y) ==
        -1 /*&& this.blockedPositions.findIndex((n) => n.pos.x == pos.x && n.pos.y == pos.y) ==
        -1*/
      );
    };

    update(delta) {
      this.nodesList
        //.filter((n) => n.to)
        .forEach((node) => {
          if (typeof node.onUpdate === "function") node.onUpdate(node, delta);
          if (!node.to) return;
          if (node.isHovered) return;

          var speed = node.speed || 10;

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

            var distanceX = Math.abs(
              node.path[1].pos.x * this.tileSize.w - node.x
            );
            var distanceY = Math.abs(
              node.path[1].pos.y * this.tileSize.h - node.y
            );

            if (distanceX + distanceY < speed / delta) {
              node.jump(1);
            }
          }
        });
    }

    animation(pfx, timestamp) {
      if (pfx.lastFrameTimeMs === null) {
        pfx.lastFrameTimeMs = timestamp;
        pfx.delta = 0;
      }

      // Throttle the frame rate.
      if (timestamp < pfx.lastFrameTimeMs + 1000 / pfx.maxFPS) {
        pfx.animationFrameId = requestAnimationFrame(
          pfx.animation.bind(0, pfx)
        );
        return;
      }

      pfx.delta += timestamp - pfx.lastFrameTimeMs;
      pfx.lastFrameTimeMs = timestamp;

      var numUpdateSteps = 0;
      while (pfx.delta >= pfx.timestep) {
        pfx.update(pfx.timestep);
        pfx.delta -= pfx.timestep;
        if (++numUpdateSteps >= 240) {
          pfx.delta = 0;
          break;
        }
      }
      pfx.render();
      pfx.animationFrameId = requestAnimationFrame(pfx.animation.bind(0, pfx));
    }

    play() {
      this.lastFrameTimeMs = null;
      this.animationFrameId = requestAnimationFrame(
        this.animation.bind(0, this)
      );
    }

    stop() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.lastFrameTimeMs = null;
      this.delta = 0;
    }

    // START : ADDING DATA TO PFX

    addNode(node) {
      /*node.x = node.pos.x * this.tileSize.w
      node.y = node.pos.y * this.tileSize.h
      node.pfx = this
      node.interactive =  typeof node.interactive != "undefined" ? node.interactive : true,*/

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

            //node.findPath()
            //obj.onPosChange(node, obj);
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
          node.path = this.findPath(node.pos, node.to.pos);
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
            ...node.to,
            ...{
              onPosChange: (n, p) => {
                node.findPath();
              },
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
    }

    reset() {
      this.nodesList.length = 0;
      this.map.length = 0;

      this.canvas.removeEventListener("mousedown", this._mouseDownHandler);
      this.canvas.removeEventListener("mouseup", this._mouseUpHandler);
      this.canvas.removeEventListener("mouseleave", this._mouseLeaveHandler);
      this.canvas.removeEventListener("mousemove", this._mouseMoveHandler);
      this.mouseLeave();
      this.clearCanvas();

      window.removeEventListener("resize", () => this._resizeHandler);

      this.canvas.remove();
    }

    // END : ADDING DATA TO PFX

    // START : RENDER AND DRAW FUNCTIONS

    render() {
      //console.log('PFX::render()');
      //this.clearCanvas();
      this.drawMap();
      /*this.pathsList.forEach((path) => {
        this.drawPath(path);
      });*/
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

      if (this.interactionFocus) {
        this.drawContext(this.interactionFocus);
      } else if (this.position) {
        this.drawContext({ pos: this.position });
      }

      //this.blockedPositions = [];

      return this;
    }

    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawMap() {
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
                    ? { color: this.settings.wallEdgeColor }
                    : null,
                right:
                  (x == this.map[y].length - 1 && this.map[y][x] != 0) ||
                  (this.map[y][x] == 0 &&
                    typeof this.map[y][x + 1] != "undefined" &&
                    this.map[y][x + 1] != 0)
                    ? { color: this.settings.wallEdgeColor }
                    : null,
                bottom:
                  (y == this.map.length - 1 && this.map[y][x] != 0) ||
                  (this.map[y][x] == 0 &&
                    this.map[y + 1] &&
                    this.map[y + 1][x] != 0)
                    ? { color: this.settings.wallEdgeColor }
                    : null,
                left:
                  (x == 0 && this.map[y][x] != 0) ||
                  (this.map[y][x] == 0 &&
                    typeof this.map[y][x - 1] != "undefined" &&
                    this.map[y][x - 1] != 0)
                    ? { color: this.settings.wallEdgeColor }
                    : null,
                // also corners
                topLeft:
                  this.map[y][x] == 0 &&
                  this.map[y - 1] &&
                  this.map[y - 1][x] == 0 &&
                  this.map[y][x - 1] == 0 &&
                  this.map[y - 1][x - 1] != 0
                    ? { color: this.settings.wallEdgeColor }
                    : null,
                topRight:
                  this.map[y][x] == 0 &&
                  this.map[y - 1] &&
                  this.map[y - 1][x] == 0 &&
                  this.map[y][x + 1] == 0 &&
                  this.map[y - 1][x + 1] != 0
                    ? { color: this.settings.wallEdgeColor }
                    : null,
                bottomRight:
                  this.map[y][x] == 0 &&
                  this.map[y + 1] &&
                  this.map[y + 1][x] == 0 &&
                  this.map[y][x + 1] == 0 &&
                  this.map[y + 1][x + 1] != 0
                    ? { color: this.settings.wallEdgeColor }
                    : null,
                bottomLeft:
                  this.map[y][x] == 0 &&
                  this.map[y + 1] &&
                  this.map[y + 1][x] == 0 &&
                  this.map[y][x - 1] == 0 &&
                  this.map[y + 1][x - 1] != 0
                    ? { color: this.settings.wallEdgeColor }
                    : null,
              },
            }
          );
        }
      }
      return this;
    }

    drawPath(node) {
      node.path.forEach((n, key) => {
        let next = node.path[key + 1];
        if (!next) return;

        var drawX = typeof n.x != "undefined" ? n.x : n.pos.x * this.tileSize.w;
        var drawY = typeof n.y != "undefined" ? n.y : n.pos.y * this.tileSize.h;

        this.ctx.strokeStyle =
          node.path.color ||
          (typeof node.style != "undefined" &&
            typeof node.style.color != "undefined")
            ? node.style.color
            : this.settings.pathNodeColor;
        this.ctx.beginPath();
        this.ctx.moveTo(
          drawX + this.tileSize.w / 2,
          drawY + this.tileSize.h / 2
        );
        this.ctx.lineTo(
          next.pos.x * this.tileSize.w + this.tileSize.w / 2,
          next.pos.y * this.tileSize.h + this.tileSize.h / 2
        );
        this.ctx.stroke();
      });
    }

    drawContext(node) {
      node.style = {
        color: this.settings.wallNodeColor,
        mode: "stroke",
        shape: "roundRect",
      };

      this.drawNode(node);
    }

    drawNode(node, config = {}) {
      if (!node) return;

      const shape = node.style && node.style.shape ? node.style.shape : "rect";
      const mode = node.style && node.style.mode ? node.style.mode : "fill";

      var drawX =
        (node.x || node.pos.x * this.tileSize.w) +
        (typeof node.style != "undefined" &&
        typeof node.style.size != "undefined"
          ? (this.tileSize.w - (this.tileSize.w * node.style.size.w)) / 2
          : 0);
      var drawY =
        (node.y || node.pos.y * this.tileSize.h) +
        (typeof node.style != "undefined" &&
        typeof node.style.size != "undefined"
          ? (this.tileSize.h - (this.tileSize.h * node.style.size.h)) / 2
          : 0);

      var sizeX =
        typeof node.style != "undefined" &&
        typeof node.style.size != "undefined"
          ? node.style.size.w * this.tileSize.w
          : this.tileSize.w;
      var sizeY =
        typeof node.style != "undefined" &&
        typeof node.style.size != "undefined"
          ? node.style.size.h * this.tileSize.h
          : this.tileSize.h;

      switch (mode) {
        case "fill":
          this.ctx.fillStyle =
            typeof node.style != "undefined"
              ? node.style.color
              : config.color || this.settings.pathNodeColor;

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
              break;
          }

          break;
        case "stroke":
          this.ctx.fillStyle = config.color || this.settings.pathNodeColor;
          this.ctx.strokeStyle = config.color || this.settings.pathNodeColor;

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
    }

    // END : RENDER AND DRAW FUNCTIONS

    // START : CANVAS INTERACTIONS

    normalizePointFromEvent(event) {
      return {
        x: event.clientX - this.canvas.offsetLeft + window.scrollX,
        y: event.clientY - this.canvas.offsetTop + window.scrollY,
      };
    }

    getXYFromPoint(point) {
      const x = Math.round((point.x - this.tileSize.w / 2) / this.tileSize.w);
      const y = Math.round((point.y - this.tileSize.h / 2) / this.tileSize.h);
      return { x: x, y: y };

      if (
        typeof this.map[y] != "undefined" &&
        typeof this.map[y][x] != "undefined"
      ) {
        return this.map[y][x];
      }
      return null;
    }

    mouseDown(event) {
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
              if (this.free(pos)) {
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
              if (this.free(pos)) {
                this.map[pos.y][pos.x] = 1;
                this.updateMap(this.map);
              }
            }
          };
          break;
        /*case "walker":
          setPos = (pos) => {
            // Determine if node can have new position
            if (this.map[pos.y][pos.x]) {
              node.pos = pos;

              // Also setting the pixel position of the walker
              node.x = pos.x * this.tileSize.w;
              node.y = pos.y * this.tileSize.h;

              this.findPathForWalker(node);
            }
          };
          break;*/
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
                if (typeof node.x != "undefined")
                  node.x = pos.x * this.tileSize.w;
                if (typeof node.y != "undefined")
                  node.y = pos.y * this.tileSize.h;

                if (typeof node.onPosChange === "function")
                  node.onPosChange(node, pos);
                if (node.to) node.findPath();
              }
            }
          };
          break;
      }

      this.interactionFocus = {
        pos: { x: -1, y: -1 },
        node: node,
        setPos: function (pos) {
          this.pos = pos;
          setPos(pos);
        },
      };

      this.interactionFocus.setPos(this.position);

      this.interactionMode = this.detectContext(this.position, event); // TODO needed?

      /*if (
        this.interactionMode.type == "wall" ||
        this.interactionMode.type == "free"
      ) {
        let newMap = this.map;
        newMap[c.y][c.x] = this.interactionMode.type == "wall" ? 1 : 0;
        this.updateMap(newMap);
      }*/

      if (this.animationFrameId === null) {
        this.render();
      }
    }

    mouseLeave(event) {
      this.currentContext = null;
      this.pixelPosition = null;
      this.mouseUp(event);
    }

    mouseUp(event) {
      // if (!this.mouseIsDown) return; // ! this will not properly reset
      this.mouseIsDown = false;
      this.interactionFocus = null;
      this.position = null;
      this.interactionMode = null;
      /*if (this.targetNodeIndex !== null) {
        let node = this.nodesList[this.targetNodeIndex];

        this.targetNodeIndex = null;
      }

      if (this.targetWalkerIndex !== null) {
        this.findPathForWalker(this.walkers[this.targetWalkerIndex]);
        this.targetWalkerIndex = null;
      }*/

      this.render();
    }

    nodeIsHovered(node, c, pos) {
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
    }

    detectContext(pos, event) {
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
    }

    mouseMove(event) {
      this.pixelPosition = this.normalizePointFromEvent(event);
      this.position = this.getXYFromPoint(this.pixelPosition);

      if (this.interactionFocus) {
        if (
          this.interactionFocus.pos.x !== this.position.x ||
          this.interactionFocus.pos.y !== this.position.y
        ) {
          this.interactionFocus.setPos(this.position);
        }
      } else {
        this.detectContext(this.position, event);
      }

      if (this.animationFrameId === null) {
        this.render();
      }
    }

    // END : CANVAS INTERACTIONS

    // START : CALLBACKS

    updateMap(map) {
      if (typeof this.onUpdateMap === "function") this.onUpdateMap(map);
      this.map = map;
      this.initMatrix();
      this.highestWeight = Math.max(...this.map.flat());
      this.nodesList.forEach((node) => {
        node._positions = null;
        if (node.to) node.findPath();
      });
    }

    // END : CALLBACKS

    static init(elements, settings) {
      if (elements instanceof Node) {
        elements = [elements];
      }

      if (elements instanceof NodeList) {
        elements = [].slice.call(elements);
      }

      if (!(elements instanceof Array)) {
        return;
      }

      elements.forEach((element) => {
        new PathfindingFX(element, {
          map: JSON.parse(element.dataset.pathfinding),
        }).findPath(
          JSON.parse(element.dataset.from),
          JSON.parse(element.dataset.to)
        );
      });
    }
  }

  if (typeof document !== "undefined") {
    /* expose the class to window */
    window.PathfindingFX = PathfindingFX;
    /**
     * Auto load
     */
    setTimeout(() => {
      PathfindingFX.init(document.querySelectorAll("[data-pfx]"));
    }, 0);
  }

  return PathfindingFX;
})();
