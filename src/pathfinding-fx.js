var PathfindingFX = (function () {
  "use strict";

  /**
   * Created by Marco Schlichting (marcoplain) on 22/12/2022.
   * MIT License.
   * Version 1.0.0
   */

  const defaults = {
    wallNodeColor: "#000000",
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

      this.heuristics = "euclidean";

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
      element.addEventListener("mouseleave", (evt) => this.mouseUp(evt));
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
            w: this.map[y][x],
            x: x,
            y: y,
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
        if (currentNode.x == to.x && currentNode.y == to.y) {
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
            if (closed[c].x == neighbor.x && closed[c].y == neighbor.y)
              invalid = true;
          }
          if (invalid) continue;
          let g = currentNode.g;
          // Diagonal g 
          if(neighbor.x != currentNode.x && neighbor.y != currentNode.y){
            g += this.sqrt2;
          } else {
            g += 1;
          }
          let gBest = false;
          let found = false;
          for (let o = 0; o < open.length; o++)
            if (open[o].x == neighbor.x && open[o].y == neighbor.y)
              found = true;

          if (!found) {
            gBest = true;
            neighbor.h = Math.round(this.distance(neighbor, to));
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
          x: currentNode.x,
          y: currentNode.y,
          h: Math.round(currentNode.h),
        });*/

        // End case -- result has been found, return the traced path

        if (greedy && currentNode.x == to.x && currentNode.y == to.y) {
          return flood;
        }

        open.splice(lowInd, 1);

        closed.push(currentNode);

        let neighbors = this.neighbors(currentNode);
        for (let n = 0; n < neighbors.length; n++) {
          let neighbor = neighbors[n];
          let invalid = false;
          for (let c = 0; c < closed.length; c++) {
            if (closed[c].x == neighbor.x && closed[c].y == neighbor.y)
              invalid = true;
          }
          if (invalid) continue;

          let g = currentNode.g;
          // Diagonal g 
          if(neighbor.x != currentNode.x && neighbor.y != currentNode.y){
            g += this.sqrt2;
          } else {
            g += 1;
          }

          let gBest = false;
          let found = false;
          for (let o = 0; o < open.length; o++)
            if (open[o].x == neighbor.x && open[o].y == neighbor.y)
              found = true;

          if (!found) {
            gBest = true;
            neighbor.h = Math.round(this.distance(neighbor, to));
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
        this.matrix[node.y - 1] &&
        this.matrix[node.y - 1][node.x] &&
        this.matrix[node.y - 1][node.x].w
      )
        neighbors.push(this.matrix[node.y - 1][node.x]);
      if (
        this.matrix[node.y + 1] &&
        this.matrix[node.y + 1][node.x] &&
        this.matrix[node.y + 1][node.x].w
      )
        neighbors.push(this.matrix[node.y + 1][node.x]);
      if (
        this.matrix[node.y] &&
        this.matrix[node.y][node.x - 1] &&
        this.matrix[node.y][node.x - 1].w
      )
        neighbors.push(this.matrix[node.y][node.x - 1]);
      if (
        this.matrix[node.y] &&
        this.matrix[node.y][node.x + 1] &&
        this.matrix[node.y][node.x + 1].w
      )
        neighbors.push(this.matrix[node.y][node.x + 1]);

      // Diagonal neighbors
      if (
        this.matrix[node.y - 1] &&
        this.matrix[node.y - 1][node.x - 1] &&
        this.matrix[node.y - 1][node.x - 1].w &&
        this.matrix[node.y - 1][node.x] &&
        this.matrix[node.y - 1][node.x].w &&
        this.matrix[node.y][node.x - 1] &&
        this.matrix[node.y][node.x - 1].w
      )
        neighbors.push(this.matrix[node.y - 1][node.x - 1]);
      if (
        this.matrix[node.y + 1] &&
        this.matrix[node.y + 1][node.x - 1] &&
        this.matrix[node.y + 1][node.x - 1].w &&
        this.matrix[node.y + 1][node.x] &&
        this.matrix[node.y + 1][node.x].w &&
        this.matrix[node.y][node.x - 1] &&
        this.matrix[node.y][node.x - 1].w
      )
        neighbors.push(this.matrix[node.y + 1][node.x - 1]);
      if (
        this.matrix[node.y - 1] &&
        this.matrix[node.y - 1][node.x + 1] &&
        this.matrix[node.y - 1][node.x + 1].w &&
        this.matrix[node.y - 1][node.x] &&
        this.matrix[node.y - 1][node.x].w &&
        this.matrix[node.y][node.x + 1] &&
        this.matrix[node.y][node.x + 1].w
      )
        neighbors.push(this.matrix[node.y - 1][node.x + 1]);
      if (
        this.matrix[node.y + 1] &&
        this.matrix[node.y + 1][node.x + 1] &&
        this.matrix[node.y + 1][node.x + 1].w &&
        this.matrix[node.y + 1][node.x] &&
        this.matrix[node.y + 1][node.x].w &&
        this.matrix[node.y][node.x + 1] &&
        this.matrix[node.y][node.x + 1].w
      )
        neighbors.push(this.matrix[node.y + 1][node.x + 1]);

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
      
      this.walkers.forEach(walker => {
        walker.path = this.findPath({x:walker.x, y:walker.y}, walker.to);
        if(walker.path.length > 1){
          walker.x = walker.path[1].x;
          walker.y = walker.path[1].y;
        }
      })
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
      /*this.interval = setInterval(() => {
        this.walkers.forEach((walker) => {
          if (!walker.path) return;

          if (walker.settings.loop && walker.steps == walker.path.length)
            walker.steps = 0;
          if (walker.path[walker.steps]) {
            walker.x = walker.path[walker.steps].x;
            walker.y = walker.path[walker.steps].y;
          }
          if (walker.steps < walker.path.length) walker.steps++;
        });
      }, 1000 / 8);*/
    }

    addWalker(from, to, settings) {
      var walker = {
        x: from.x,
        y: from.y,
        steps: 0,
        from: from,
        to: to,
        settings: settings,
      };
      walker.path = this.findPath(from, to);
      this.walkers.push(walker);

      this.addCircle(to, {
        onPosChange: (pos) => {
          walker.to = pos;
          walker.path = this.findPath({ x: walker.x, y: walker.y }, walker.to);
          walker.steps = 0;
        },
      });

      return this;
    }

    render(settings = {}) {
      //this.clearCanvas();
      this.drawMap();
      this.pathsList.forEach((path) => {
        this.drawPath(path.path);
      });
      this.drawNodes(this.nodesList);
      this.walkers.forEach((node) => {
        this.drawNode(node, node.settings);
        this.drawPath(node.path);
      });
      if (this.currentContext) {
        this.drawContext(this.currentContext);
      }
      return this;
    }

    updateMap(map) {
      if (typeof this.onMapUpdate != "undefined") this.onMapUpdate(map);
      this.map = map;
      this.initMatrix();
      this.walkers.forEach((walker) => {
        walker.path = this.findPath(walker.from, walker.to);
      });
      this.pathsList.forEach((path) => {
        path.path = this.findPath(path.from, path.to);
      });
    }

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

      let node = this.getXYFromPoint(this.normalizePointFromEvent(event));

      this.interactionMode = this.detectContext(node);

      if (
        this.interactionMode.type == "wall" ||
        this.interactionMode.type == "free"
      ) {
        let newMap = this.map;
        newMap[node.y][node.x] = this.interactionMode.type == "wall" ? 1 : 0;
        this.updateMap(newMap);
      }

      if (this.animationFrameId === null) {
        this.render();
      }

      this.targetAxis = node;
    }

    mouseUp(event) {
      this.render();

      if (!this.mouseIsDown) return;
      this.mouseIsDown = false;
      this.interactionMode = null;
      if (this.targetNodeIndex !== null) {
        let node = this.nodesList[this.targetNodeIndex];

        this.targetNodeIndex = null;
      }

      if (this.targetWalkerIndex !== null) {
        this.walkers[this.targetWalkerIndex].steps = 0;
        this.walkers[this.targetWalkerIndex].path = this.findPath(
          {
            x: this.walkers[this.targetWalkerIndex].x,
            y: this.walkers[this.targetWalkerIndex].y,
          },
          this.walkers[this.targetWalkerIndex].to
        );
        this.targetWalkerIndex = null;
      }

      this.currentContext = null;
    }

    detectContext(node) {
      if (!node) return;

      const nodeIndex = this.nodesList.findIndex(
        (n) => n.x == node.x && n.y == node.y
      );

      if (nodeIndex >= 0) {
        this.targetNodeIndex = nodeIndex;
        return { ...this.nodesList[nodeIndex], ...{ type: "node" } };
      }

      const walkerIndex = this.walkers.findIndex(
        (n) => n.x == node.x && n.y == node.y
      );

      if (walkerIndex >= 0) {
        this.targetWalkerIndex = walkerIndex;
        return { ...this.walkers[walkerIndex], ...{ type: "walker" } };
      }

      if (
        typeof this.map[node.y] == "undefined" ||
        typeof this.map[node.y][node.x] == "undefined"
      ) {
        return false;
      }

      // Check if current node might be a wall
      if (this.map[node.y][node.x] === 0) {
        return {
          type: "wall",
          x: node.x,
          y: node.y,
        };
      }
      if (this.map[node.y][node.x] === 1) {
        return {
          type: "free",
          x: node.x,
          y: node.y,
        };
      }
    }

    mouseMove(event) {
      let axis = this.getXYFromPoint(this.normalizePointFromEvent(event));
      if (axis) {
        if (this.mouseIsDown) {
          if (axis.x != this.targetAxis.x || axis.y != this.targetAxis.y) {
            if (
              this.interactionMode.type == "wall" ||
              this.interactionMode.type == "free"
            ) {
              let newMap = this.map;
              newMap[axis.y][axis.x] =
                this.interactionMode.type == "wall" ? 1 : 0;
              this.updateMap(newMap);
            } else {
              if (this.interactionMode.type == "node") {
                this.nodesList[this.targetNodeIndex].x = axis.x;
                this.nodesList[this.targetNodeIndex].y = axis.y;

                if (
                  typeof this.nodesList[this.targetNodeIndex].config
                    .onPosChange != "undefined"
                )
                  this.nodesList[this.targetNodeIndex].config.onPosChange(axis);
              }
              if (this.interactionMode.type == "walker") {
                this.walkers[this.targetWalkerIndex].x = axis.x;
                this.walkers[this.targetWalkerIndex].y = axis.y;
              }

              // Update all paths
              this.pathsList.forEach((path) => {
                path.path = this.findPath(path.from, path.to);
              });

              if (typeof this.onNodesListUpdate != "undefined")
                this.onNodesListUpdate(this.nodesList);
            }
            this.targetAxis = axis;
          }
        }

        this.currentContext = this.detectContext(axis);
        if (this.animationFrameId === null) {
          this.render();
          this.drawContext(this.currentContext);
        }
      }
    }

    addPath(fromNode, toNode, settings = {}) {
      const path = {
        from: fromNode,
        to: toNode,
        path: this.findPath(fromNode, toNode, settings),
      };
      this.pathsList.push(path);
      return path;
    }

    clearAllPaths() {
      this.pathsList.length = 0;
    }

    findFlood(fromNode, toNode, settings = {}) {
      const pathfinding = new Pathfinding(this.map);
      return pathfinding.findFlood(fromNode, toNode, settings);
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
          this.drawNode({ x: x, y: y }, { color: color });
        }
      }
      return this;
    }

    drawNodes(path, config = {}) {
      for (let i = 0; i < path.length; i++) {
        this.drawNode(path[i], { ...config, ...path[i].config });
      }
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
          path: this.findPath(this.currentNode, node),
        });
      }

      return this;
    }

    addNode(node, config = {}) {
      this.nodesList.push({ ...node, ...{ config: config } });
      this.drawNode(node, config);
    }

    drawNode(node, config = {}) {
      if (!node) return;

      const draw = node.draw || { fill: "rect" };

      switch (draw.fill) {
        case "rect":
          this.ctx.fillStyle = config.color || this.settings.pathNodeColor;
          this.ctx.fillRect(
            node.x * this.tileSize.w,
            node.y * this.tileSize.h,
            this.tileSize.w,
            this.tileSize.h
          );
          break;
        case "circle":
          this.ctx.strokeStyle = config.color || this.settings.pathNodeColor;
          this.ctx.beginPath(); // Start a new path

          this.ctx.arc(
            node.x * this.tileSize.w + this.tileSize.w / 2,
            node.y * this.tileSize.h + this.tileSize.h / 2,
            (this.tileSize.w + this.tileSize.h) / 4,
            0,
            2 * Math.PI
          );
          this.ctx.stroke();
          break;
      }
    }
    addCircle(node, config = {}) {
      node = {
        ...node,
        ...{ config: config },
        ...{ draw: { fill: "circle" } },
      };
      this.nodesList.push(node);
      //this.drawCircle(node, config);
    }

    drawPath(nodes, config = {}) {
      nodes.forEach((node, key) => {
        let next = nodes[key + 1];
        if (!next) return;

        this.ctx.strokeStyle = config.color || this.settings.pathNodeColor;
        this.ctx.beginPath(); // Start a new path
        this.ctx.moveTo(
          node.x * this.tileSize.w + this.tileSize.w / 2,
          node.y * this.tileSize.h + this.tileSize.h / 2
        ); // Move the pen to (30, 50)
        this.ctx.lineTo(
          next.x * this.tileSize.w + this.tileSize.w / 2,
          next.y * this.tileSize.h + this.tileSize.h / 2
        ); // Move the pen to (30, 50)
        this.ctx.stroke(); // Render the path
      });
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

    drawContext(node, config = {}) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.3;
      if (node.type == "empty" || !config.color) {
        config.color = this.settings.wallNodeColor;
      }

      if (node.type == "wall" || !config.color) {
        config.color = this.settings.emptyNodeColor;
      }

      this.drawNode(node, {
        color: config.color || this.settings.startNodeColor,
      });

      this.ctx.restore();
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
