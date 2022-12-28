var PathfindingUi = (function () {
  "use strict";

  /**
   * Created by Marco Schlichting (marcoplain) on 22/12/2022.
   * MIT License.
   * Version 1.0.0
   */

  const defaults = {
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

      this.mouseIsDown = false;
      element.addEventListener("mousedown", (evt) => this.mouseDown(evt));
      element.addEventListener("mouseup", (evt) => this.mouseUp(evt));
      element.addEventListener("mouseleave", (evt) => this.mouseUp(evt));
      element.addEventListener("mousemove", (evt) => this.mouseMove(evt));

      this.map = settings.map || [];

      this.tileSize = {
        h: this.height / this.map.length,
        w: this.width / this.map[0].length,
      };

      this.pathfinding = new Pathfinding(this.map);

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      //this.render();

      // Settings
      this.settings = {};
      this.settings.pathNodeColor =
        settings.pathNodeColor || defaults.pathNodeColor;
      this.settings.floodNodeColor =
        settings.floodNodeColor || defaults.floodNodeColor;
      this.settings.startNodeColor =
        settings.startNodeColor || defaults.startNodeColor;
      this.settings.endNodeColor =
        settings.endNodeColor || defaults.endNodeColor;

      return this;
    }

    normalizePointFromEvent(event) {
      return {
        x: event.clientX - this.canvas.offsetLeft + window.scrollX,
        y: event.clientY - this.canvas.offsetTop + window.scrollY,
      };
    }

    getNodeFromPoint(point){
      const x = Math.round((point.x-this.tileSize.w/2) / this.tileSize.w);
      const y = Math.round((point.y-this.tileSize.h/2) / this.tileSize.h);

      const node = this.map[y][x];

      return {x:x, y:y};
    }

    mouseDown(event) {
      this.mouseIsDown = true;

      let node = this.getNodeFromPoint(this.normalizePointFromEvent(event));
      //node = !node;
      this.map[node.y][node.x] = this.map[node.y][node.x] ? 0 : 1;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawMap();

      this.targetNode = node

    }

    mouseUp(event) {
      if (!this.mouseIsDown) return;
      this.mouseIsDown = false;
      console.log(this.mouseIsDown);
    }

    mouseMove(event){
      if (!this.mouseIsDown) return;

      let node = this.getNodeFromPoint(this.normalizePointFromEvent(event));
      if(node.x != this.targetNode.x || node.y != this.targetNode.y){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.map[node.y][node.x] = this.map[node.y][node.x] ? 0 : 1;
        this.drawMap();

        this.targetNode = node
      }
    }

    findPath(fromNode, toNode, settings = {}) {
      return this.pathfinding.findPath(fromNode, toNode, settings);
    }

    findFlood(fromNode, toNode, settings = {}) {
      return this.pathfinding.findFlood(fromNode, toNode, settings);
    }

    drawMap(config = {}) {
      for (let y = 0; y < this.map.length; y++) {
        for (let x = 0; x < this.map[y].length; x++) {
          this.ctx.font = "10px Arial";
          this.ctx.fillStyle = "#000000";
          if (!this.map[y][x])
            this.ctx.fillRect(
              x * this.tileSize.w,
              y * this.tileSize.h,
              this.tileSize.w,
              this.tileSize.h
            );
        }
      }
      return this;
    }

    drawNodes(path, config = {}) {
      for (let i = 0; i < path.length; i++) {
        this.drawNode(path[i], config);
      }
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

    drawStartNode(node, config = {}) {
      this.drawNode(node, {
        color: config.color || this.settings.startNodeColor,
      });
    }

    drawEndNode(node, config = {}) {
      this.drawNode(node, {
        color: config.color || this.settings.endNodeColor,
      });
    }

    loop() {}

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
