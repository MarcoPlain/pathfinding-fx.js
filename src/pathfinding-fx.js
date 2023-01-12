var PathfindingFX = (function () {
  "use strict";

  /**
   * Created by Marco Schlichting (marcoplain) on 22/12/2022.
   * MIT License.
   * Version 1.0.0
   */

  const defaults = {
    wallNodeColor: "#dbdbdb",
    emptyNodeColor: "#f8f8f8",
    pathNodeColor: "#a8a8a8",
    floodNodeColor: "#585858",
    startNodeColor: "#0088bb",
    endNodeColor: "#00bb88",

    greedy: true,
  };

  class PathfindingFX {
    constructor(element, settings = {}) {
      this.map = settings.map || [];

      // START PATHFINDING

      this.heuristics = "manhattan";

      this.initMatrix();

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
      this.canvas = element;
      this.width = element.offsetWidth;
      this.height = element.offsetHeight;
      this.ctx = element.getContext("2d");

      this.tileSize = {
        h: Math.floor(this.height / this.map.length),
        w: Math.floor(this.width / this.map[0].length),
      };

      this.ctx.mozImageSmoothingEnabled = false;
      this.ctx.webkitImageSmoothingEnabled = false;
      this.ctx.msImageSmoothingEnabled = false;
      this.ctx.imageSmoothingEnabled = false;

      const rect = this.canvas.getBoundingClientRect();

      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;

      this.ctx.scale(devicePixelRatio, devicePixelRatio);

      this.mouseIsDown = false;

      element.addEventListener("mousedown", (evt) => this.mouseDown(evt));
      element.addEventListener("mouseup", (evt) => this.mouseUp(evt));
      element.addEventListener("mouseleave", (evt) => this.mouseLeave(evt));
      element.addEventListener("mousemove", (evt) => this.mouseMove(evt));

      this.canvas.style.width = rect.width + "px";
      this.canvas.style.height = rect.height + "px";

      this.nodesList = [];
      this.pathsList = [];
      this.interactionMode = null;
      this.targetNodeIndex = null;
      this.targetWalkerIndex = null;
      this.currentContext = null;

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

      this.sqrt2 = Math.sqrt(2);

      this.clearCanvas();

      // Animation Stuff
      this.animationFrameId = null;
      (this.lastFrameTimeMs = 0),
        (this.maxFPS = 60),
        (this.delta = 0),
        (this.timestep = 1000 / 24);

      // Walkers Stuff
      this.walkers = [];

      return this;
    }

    initMatrix() {
      let nodeMatrix = [];
      for (let y = 0; y < this.map.length; y++) {
        nodeMatrix[y] = [];
        for (let x = 0; x < this.map[y].length; x++) {
          nodeMatrix[y][x] = {
            pos: {
              x: x,
              y: y,
            },
            w: this.map[y][x],
            f: 0,
            g: 0,
          };
        }
      }
      this.matrix = nodeMatrix;
    }

    findPath = (from, to, options = {}) => {
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
            g += this.sqrt2;
          } else {
            g += 1;
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

    findPathForWalker(node) {
      if (typeof node.path == "undefined") node.path = [];
      node.path = this.findPath(node.pos, node.to.pos);
      if (node.path.length <= 1) {
        if (typeof node.config.onNoPath == "function") {
          try {
            node.config.onNoPath(node);
          } catch (e) {}
        }
      }
    }

    findFlood = (from, to, options = {}) => {
      this.initMatrix();
      const greedy = options.greedy || this.greedy;

      to = this.matrix[to.y][to.x];

      let open = [this.matrix[from.y][from.x]];
      let closed = [];

      let flood = [];

      while (open.length) {
        var lowInd = 0;
        for (var i = 0; i < open.length; i++) {
          if (open[i].f < open[lowInd].f) {
            lowInd = i;
          }
        }

        let currentNode = open[lowInd];
        flood.push(currentNode);
        /*console.log("currentNode", {
          x: currentNode.pos.x,
          y: currentNode.pos.y,
          h: Math.round(currentNode.h),
        });*/

        // End case -- result has been found, return the traced path

        if (
          greedy &&
          currentNode.pos.x == to.pos.x &&
          currentNode.pos.y == to.pos.y
        ) {
          return flood;
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
            g += this.sqrt2;
          } else {
            g += 1;
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

      return flood;
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

    update(delta) {
      this.walkers.forEach((walker) => {
        if (walker.isHovered) return;

        var speed = walker.config.speed || 10;

        if (walker.path.length > 1) {
          var dX = walker.path[1].pos.x * this.tileSize.w - walker.x;
          var dY = walker.path[1].pos.y * this.tileSize.h - walker.y;
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

          walker.x += sX;
          walker.y += sY;

          var distanceX = Math.abs(
            walker.path[1].pos.x * this.tileSize.w - walker.x
          );
          var distanceY = Math.abs(
            walker.path[1].pos.y * this.tileSize.h - walker.y
          );

          if (distanceX + distanceY < speed / delta) {
            // Updating internal values becuase walker has reached next path position
            walker.pos = walker.path[1].pos;
            walker.x = walker.pos.x * this.tileSize.w;
            walker.y = walker.pos.y * this.tileSize.h;

            if (typeof walker.config.onPosChange != "undefined")
              walker.config.onPosChange(walker, walker.pos);

            // When mouse is inside canvas we need to check, if by this change the mouse is now hovering over the walker
            if (this.pixelPosition)
              this.walkerIsHovered(
                walker,
                this.getXYFromPoint(this.pixelPosition)
              );

            this.findPathForWalker(walker);
            if (
              walker.path.length == 1 &&
              typeof walker.config.onPathEnd == "function"
            ) {
              walker.config.onPathEnd(walker);
            }
          }
        }
      });
    }

    animationLoop(pui, timestamp) {
      // Throttle the frame rate.
      if (timestamp < pui.lastFrameTimeMs + 1000 / pui.maxFPS) {
        requestAnimationFrame(pui.animationLoop.bind(0, pui));
        return;
      }
      pui.delta += timestamp - pui.lastFrameTimeMs;
      pui.lastFrameTimeMs = timestamp;

      var numUpdateSteps = 0;
      while (pui.delta >= pui.timestep) {
        pui.update(pui.timestep);
        pui.delta -= pui.timestep;
        if (++numUpdateSteps >= 240) {
          pui.delta = 0;
          break;
        }
      }
      pui.render();
      requestAnimationFrame(pui.animationLoop.bind(0, pui));
    }

    animate() {
      this.animationFrameId = requestAnimationFrame(
        this.animationLoop.bind(0, this)
      );
    }

    // START : ADDING DATA TO PFX

    addNode(node, config = {}) {
      this.nodesList.push({ ...node, ...{ config: config } });
      this.drawNode(node, config);
    }

    addPath(settings = {}) {
      if (
        typeof settings.from == "undefined" ||
        typeof settings.from.pos == "undefined" ||
        typeof settings.from.pos.x == "undefined" ||
        typeof settings.from.pos.y == "undefined"
      ) {
        throw 'pathfinding-fx.js : addPath() requires a valid "from" setting.';
      }
      if (
        typeof settings.to == "undefined" ||
        typeof settings.to.pos == "undefined" ||
        typeof settings.to.pos.x == "undefined" ||
        typeof settings.to.pos.y == "undefined"
      ) {
        throw 'pathfinding-fx.js : addPath() requires a valid "to" setting.';
      }

      const path = {
        from: settings.from,
        to: settings.to,
        path: this.findPath(settings.from.pos, settings.to.pos, settings),
        color: settings.color,
      };
      this.pathsList.push(path);
      return this.render();
    }

    addMovingNode(settings = {}) {
      var walker = {
        pos: settings.from.pos,
        size: {
          w: this.tileSize.w / 1.5,
          h: this.tileSize.h / 1.5,
        },
        x: settings.from.pos.x * this.tileSize.w,
        y: settings.from.pos.y * this.tileSize.h,
        from: settings.from,
        config: settings,
        color: settings.color, // !We need to take this color, also for path and circle?
      };

      settings.to.size = { w: walker.size.w / 2, h: walker.size.h / 2 }; // TODO this should be configurable

      const self = this;

      walker.to = new Proxy(
        this.addCircle(settings.to, {
          ...settings,
          ...{
            onPosChange: (node, pos) => {
              walker.to.pos = pos;
              this.findPathForWalker(walker);
            },
          },
        }),
        {
          set(obj, prop, value) {
            // The default behavior to store the value
            obj[prop] = value;

            if (prop === "pos") {
              self.findPathForWalker(walker);
            }

            // Indicate success
            return true;
          },
        }
      );

      this.findPathForWalker(walker);

      const handler = {
        set(obj, prop, value) {
          // The default behavior to store the value
          obj[prop] = value;

          // Indicate success
          return true;
        },
      };

      this.walkers.push(new Proxy(walker, handler));

      return this;
    }

    addStartNode(node, config = {}) {
      config = {
        ...config,
        ...{
          color: config.color || this.settings.startNodeColor,
        },
      };
      this.nodesList.push({ ...node, ...{ config: config } });
      this.drawNode(node, {
        config,
      });

      return this.nodesList[this.nodesList.length - 1];
    }

    addEndNode(node, config = {}) {
      config = {
        ...config,
        ...{
          color: config.color || this.settings.endNodeColor,
        },
      };
      this.nodesList.push({ ...node, ...{ config: config } });
      this.drawNode(node, {
        config,
      });
      return this.nodesList[this.nodesList.length - 1];
    }

    addCircle(node, config = {}) {
      node = {
        ...node,
        ...{ config: config },
        ...{ draw: { mode: "stroke", type: "circle" } },
      };
      this.nodesList.push(node);
      return node;
    }

    // END : ADDING DATA TO PFX

    // START : RENDER AND DRAW FUNCTIONS

    render(settings = {}) {
      //console.log('PFX::render()');
      //this.clearCanvas();
      this.drawMap();
      this.pathsList.forEach((path) => {
        this.drawPath(path);
      });
      this.drawNodes(this.nodesList);
      this.walkers.forEach((node) => {
        if (node.path.length) {
          node.path.shift();
          node.path.unshift({ x: node.x, y: node.y });
          this.drawPath(node, node.config);
        }
        this.drawNode(node, node.config);
      });

      
      if (this.interactionFocus) {
        this.drawContext(this.interactionFocus);
      } else if (this.position){
        this.drawContext({pos: this.position});
      }
      
      return this;
    }

    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawMap(config = {}) {
      this.clearCanvas();
      for (let y = 0; y < this.map.length; y++) {
        for (let x = 0; x < this.map[y].length; x++) {
          const color =
            this.map[y][x] === 1
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
                    ? { color: "#a8a8a8" }
                    : null,
                right:
                  (x == this.map[y].length - 1 && this.map[y][x] != 0) ||
                  (this.map[y][x] == 0 &&
                    typeof this.map[y][x + 1] != "undefined" &&
                    this.map[y][x + 1] != 0)
                    ? { color: "#a8a8a8" }
                    : null,
                bottom:
                  (y == this.map.length - 1 && this.map[y][x] != 0) ||
                  (this.map[y][x] == 0 &&
                    this.map[y + 1] &&
                    this.map[y + 1][x] != 0)
                    ? { color: "#a8a8a8" }
                    : null,
                left:
                  (x == 0 && this.map[y][x] != 0) ||
                  (this.map[y][x] == 0 &&
                    typeof this.map[y][x - 1] != "undefined" &&
                    this.map[y][x - 1] != 0)
                    ? { color: "#a8a8a8" }
                    : null,
                // also corners
                topLeft:
                  this.map[y][x] == 0 &&
                  this.map[y - 1] &&
                  this.map[y - 1][x] == 0 &&
                  this.map[y][x - 1] == 0 &&
                  this.map[y - 1][x - 1] != 0
                    ? { color: "#a8a8a8" }
                    : null,
                topRight:
                  this.map[y][x] == 0 &&
                  this.map[y - 1] &&
                  this.map[y - 1][x] == 0 &&
                  this.map[y][x + 1] == 0 &&
                  this.map[y - 1][x + 1] != 0
                    ? { color: "#a8a8a8" }
                    : null,
                bottomRight:
                  this.map[y][x] == 0 &&
                  this.map[y + 1] &&
                  this.map[y + 1][x] == 0 &&
                  this.map[y][x + 1] == 0 &&
                  this.map[y + 1][x + 1] != 0
                    ? { color: "#a8a8a8" }
                    : null,
                bottomLeft:
                  this.map[y][x] == 0 &&
                  this.map[y + 1] &&
                  this.map[y + 1][x] == 0 &&
                  this.map[y][x - 1] == 0 &&
                  this.map[y + 1][x - 1] != 0
                    ? { color: "#a8a8a8" }
                    : null,
              },
            }
          );
        }
      }
      return this;
    }

    drawNodes(path, config = {}) {
      for (let i = 0; i < path.length; i++) {
        this.drawNode(path[i], { ...config, ...path[i].config });
      }
    }

    drawPath(path, config = {}) {
      path.path.forEach((node, key) => {
        let next = path.path[key + 1];
        if (!next) return;

        var drawX =
          typeof node.x != "undefined" ? node.x : node.pos.x * this.tileSize.w;
        var drawY =
          typeof node.y != "undefined" ? node.y : node.pos.y * this.tileSize.h;

        this.ctx.strokeStyle = path.color || this.settings.pathNodeColor;
        this.ctx.beginPath(); // Start a new path
        this.ctx.moveTo(
          drawX + this.tileSize.w / 2,
          drawY + this.tileSize.h / 2
        ); // Move the pen to (30, 50)
        this.ctx.lineTo(
          next.pos.x * this.tileSize.w + this.tileSize.w / 2,
          next.pos.y * this.tileSize.h + this.tileSize.h / 2
        ); // Move the pen to (30, 50)
        this.ctx.stroke(); // Render the path
      });
    }

    drawContext(node, config = {}) {
      //this.ctx.save();
      //this.ctx.globalAlpha = 0.3;

      config.color = this.settings.wallNodeColor;
      config.draw = { mode: "stroke", type: "roundRect" };
      // config.size = node.size;

      /*if (node.type == "empty" || !config.color) {
        config.color = this.settings.wallNodeColor;
      }
      if (node.type == "empty" || !config.draw) {
        config.draw = {mode:"stroke", type:"rect"}
      }

      if (node.type == "wall" || !config.color) {
        config.color = this.settings.emptyNodeColor;
      }
      if (node.type == "wall" || !config.draw) {
        config.draw = {mode:"stroke", type:"rect"}
      }*/

      this.drawNode(node, config);

      //this.ctx.restore();
    }

    drawNode(node, config = {}) {
      if (!node) return;

      const draw = config.draw || node.draw || { mode: "fill", type: "rect" };

      var drawX =
        (node.x || node.pos.x * this.tileSize.w) +
        (typeof node.size != "undefined"
          ? (this.tileSize.w - node.size.w) / 2
          : 0);
      var drawY =
        (node.y || node.pos.y * this.tileSize.h) +
        (typeof node.size != "undefined"
          ? (this.tileSize.h - node.size.h) / 2
          : 0);

      var sizeX =
        typeof node.size != "undefined" ? node.size.w : this.tileSize.w;
      var sizeY =
        typeof node.size != "undefined" ? node.size.h : this.tileSize.h;

      switch (draw.mode) {
        case "fill":
          this.ctx.fillStyle = config.color || this.settings.pathNodeColor;
          this.ctx.fillRect(drawX, drawY, sizeX, sizeY);

          if (config.highlightEdges) {
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
          }

          break;
        case "stroke":
          this.ctx.fillStyle = config.color || this.settings.pathNodeColor;
          this.ctx.strokeStyle = config.color || this.settings.pathNodeColor;

          switch (draw.type) {
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
            let newMap = this.map;
            newMap[pos.y][pos.x] = 0;
            this.updateMap(newMap);
          };
          break;
        case "wall":
          setPos = (pos) => {
            let newMap = this.map;
            newMap[pos.y][pos.x] = 1;
            this.updateMap(newMap);
          };
          break;
        case "walker":
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
          break;
        case "node":
          setPos = (pos) => {
            // Determine if node can have new position
            if (this.map[pos.y][pos.x]) {
              node.pos = pos;
              if (typeof node.config.onPosChange === "function")
                node.config.onPosChange(node, pos);
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
      this.interactionMode = null;
      if (this.targetNodeIndex !== null) {
        let node = this.nodesList[this.targetNodeIndex];

        this.targetNodeIndex = null;
      }

      if (this.targetWalkerIndex !== null) {
        this.findPathForWalker(this.walkers[this.targetWalkerIndex]);
        this.targetWalkerIndex = null;
      }

      this.render();
    }

    walkerIsHovered(node, c, pos) {
      node.isHovered = node.pos.x == c.x && node.pos.y == c.y;
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

      const walkerIndex = this.walkers.findIndex((n) =>
        this.walkerIsHovered(n, pos, this.normalizePointFromEvent(event))
      );

      if (walkerIndex >= 0) {
        return {
          node: this.walkers[walkerIndex],
          type: "walker",
        };
      }

      const nodeIndex = this.nodesList.findIndex(
        (n) => n.pos.x == pos.x && n.pos.y == pos.y
      );

      if (nodeIndex >= 0) {
        return {
          node: this.nodesList[nodeIndex],
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
      if (this.map[pos.y][pos.x] === 1) {
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
      if (typeof this.onUpdateMap != "undefined") this.onUpdateMap(map);
      this.map = map;
      this.initMatrix();
      //if (this.animationFrameId === null)
      this.walkers.forEach((walker) => {
        this.findPathForWalker(walker);
      });
      this.pathsList.forEach((path) => {
        path.path = this.findPath(path.from.pos, path.to.pos);
      });
    }

    // END : CALLBACKS

    clearAllPaths() {
      this.pathsList.length = 0;
    }

    fromNode(node, config = {}) {
      this.currentNode = this.addStartNode(node, config);
      return this;
    }

    toNode(node, config = {}) {
      node = this.addEndNode(node, config);
      if (this.currentNode) {
        this.pathsList.push({
          from: this.currentNode,
          to: node,
          path: this.findPath(this.currentNode.pos, node.pos),
        });
      }

      return this;
    }

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
