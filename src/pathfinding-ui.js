var PathfindingUi = (function () {
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
  };

  class PathfindingUi {
    constructor(element, settings = {}) {
      if (typeof Pathfinding == "undefined") {
        throw "Can't initialize PathfindingUi because Pathfinding is not defined.";
      }

      if (!(element instanceof Node)) {
        throw (
          "Can't initialize PathfindingUi because " +
          element +
          " is not a Node."
        );
      }
      this.canvas = element;
      this.width = element.offsetWidth;
      this.height = element.offsetHeight;
      this.ctx = element.getContext("2d");

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

      this.map = settings.map || [];

      this.tileSize = {
        h: Math.floor(this.height / this.map.length),
        w: Math.floor(this.width / this.map[0].length),
      };

      this.canvas.style.width = rect.width + "px";
      this.canvas.style.height = rect.height + "px";

      this.nodesList = [];
      this.pathsList = [];
      this.interactionMode = null;
      this.targetNodeIndex = null;
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

      this.clearCanvas();

      // Animation Stuff
      this.animationFrameId = null;
      this.lastFrameTimeMs = 0,
      this.maxFPS = 60,
      this.delta = 0,
      this.timestep = 1000 / 24;

      // Walkers Stuff
      this.walkers = [];

      return this;
    }

    update(delta){

    }

    animationLoop(pui, timestamp) {
      // Throttle the frame rate.    
      if (timestamp < pui.lastFrameTimeMs + (1000 / pui.maxFPS)) {
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
      this.animationFrameId = requestAnimationFrame(this.animationLoop.bind(0, this));
      this.interval = setInterval(() => {
        this.walkers.forEach((walker) => {
          walker.x = walker.path[walker.steps].x;
          walker.y = walker.path[walker.steps].y;
          walker.steps++;
          if(walker.steps == walker.path.length){
            walker.steps = 0;
          }
        });
      }, 1000 / 8);
    }

    addWalker(from, to, settings){
      var walker = {x:from.x, y:from.y, steps:0, from: from, to: to, settings: settings};
      walker.path = this.addPath(from, to);
      this.walkers.push(walker);
      return this;
    }

    render(settings={}){
      this.clearCanvas();
      this.drawMap();
      this.pathsList.forEach((path) => {
        this.drawNodes(new Pathfinding(this.map).findPath(path.from, path.to, settings));
      });
      this.drawNodes(this.nodesList);
      this.walkers.forEach((node) => { 
        this.drawNode(node, node.settings);
      });
      if(this.currentContext){
        this.drawContext(this.currentContext);
      }
      return this;
    }

    updateMap(map){
      if(typeof this.onMapUpdate != "undefined") this.onMapUpdate(map);
      this.map = map;
      
      this.walkers.forEach((walker) => {

        walker.path = this.addPath(walker.from, walker.to);
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
      ){
        let newMap = this.map;
        newMap[node.y][node.x] = this.interactionMode.type == "wall" ? 1 : 0;
        this.updateMap(newMap);
      }

      if(this.animationFrameId === null){
        this.render()
      }

      this.targetAxis = node;
    }

    mouseUp(event) {

      this.render();

      if (!this.mouseIsDown) return;
      this.mouseIsDown = false;
      this.interactionMode = null;
      this.targetNodeIndex = null;
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

      if(typeof this.map[node.y] == 'undefined' || typeof this.map[node.y][node.x] == 'undefined') {
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
              newMap[axis.y][axis.x] = this.interactionMode.type == "wall" ? 1 : 0;
              this.updateMap(newMap);
            } else {

              this.nodesList[this.targetNodeIndex].x = axis.x;
              this.nodesList[this.targetNodeIndex].y = axis.y;
              if(typeof this.onNodesListUpdate != "undefined")
                this.onNodesListUpdate(this.nodesList);
            }
            this.targetAxis = axis;
          }
        }

        this.currentContext = this.detectContext(axis);
        if(this.animationFrameId === null){
          this.render();
          this.drawContext(this.currentContext);
        }
      }
    }

    addPath(fromNode, toNode, settings = {}) {
      const pathfinding = new Pathfinding(this.map)
      const path = pathfinding.findPath(fromNode, toNode, settings);
      //this.pathsList.push(path);
      return path;
    }

    clearAllPaths(){
      this.pathsList.length = 0;
    }

    findFlood(fromNode, toNode, settings = {}) {
      const pathfinding = new Pathfinding(this.map)
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
      if(this.currentNode){
        this.pathsList.push({from: this.currentNode, to: node})
      }
      
      return this;
    }

    addNode(node, config = {}) {
      this.nodesList.push({ ...node, ...{ config: config } });
      this.drawNode(node, config);
    }

    drawNode(node, config = {}) {
      this.ctx.fillStyle = config.color || this.settings.pathNodeColor;

      this.ctx.fillRect(
        node.x * this.tileSize.w,
        node.y * this.tileSize.h,
        this.tileSize.w,
        this.tileSize.h
      );
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

      return this.nodesList[this.nodesList.length-1];
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
      return this.nodesList[this.nodesList.length-1];
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
        new PathfindingUi(element, {
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
    window.PathfindingUi = PathfindingUi;
    /**
     * Auto load
     */
    setTimeout(() => {
      PathfindingUi.init(document.querySelectorAll("[data-pathfinding]"));
    }, 0);
  }

  return PathfindingUi;
})();
