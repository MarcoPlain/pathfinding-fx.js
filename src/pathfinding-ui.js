var PathfindingUi = (function () {
  "use strict";

  /**
   * Created by Marco Schlichting (marcoplain) on 22/12/2022.
   * MIT License.
   * Version 1.0.0
   */

  const defaults = {
    pathNodeColor: '#a8a8a8',
    startNodeColor: '#0088bb',
    endNodeColor: '#00bb88',
  }

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
      this.settings.pathNodeColor = settings.pathNodeColor || defaults.pathNodeColor
      this.settings.startNodeColor = settings.startNodeColor || defaults.startNodeColor
      this.settings.endNodeColor = settings.endNodeColor || defaults.endNodeColor

      return this;
    }

    render() {
      const ctx = this.ctx;
      //ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let y = 0; y < this.map.length; y++) {
        for (let x = 0; x < this.map[y].length; x++) {
          ctx.font = "10px Arial";
          ctx.fillStyle = "#000000";
          if (!this.map[y][x])
            ctx.fillRect(
              x * this.tileSize.w,
              y * this.tileSize.h,
              this.tileSize.w,
              this.tileSize.h
            );
        }
      }
      return this;
    }

    findPath(fromNode, toNode) {
      this.path = this.pathfinding.fromTo(fromNode, toNode);
      return this.path;
      const ctx = this.ctx;
      const tileSize = this.tileSize;

      ctx.fillStyle = "#0088bb";
      ctx.fillRect(
        fromNode.x * tileSize.w,
        fromNode.y * tileSize.h,
        tileSize.w,
        tileSize.h
      );

      ctx.font = "10px Arial";
      ctx.fillStyle = "#a8a8a8";
      /*for (let i = 0; i < path.length; i++) {
        let node = path[i];
        if (i == path.length - 1) ctx.fillStyle = "#00bb88";
        ctx.fillRect(node.x * tileSize.w, node.y * tileSize.h, tileSize.w, tileSize.h);
      }*/

      setTimeout(() => {
        this.drawNode(this.path);
      }, 100);

      return this;
    }
    drawMap(config = {}){

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

    drawPath(path, config = {}){

      this.ctx.fillStyle = config.color || this.settings.pathNodeColor;

      for(let i=0; i < path.length; i++){
        if(config && config.distance && i==config.distance)
          break;
        let node = path[i];
        this.ctx.fillRect(
          node.x * this.tileSize.w,
          node.y * this.tileSize.h,
          this.tileSize.w,
          this.tileSize.h
        );
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
      this.drawNode(node, {color:config.color || this.settings.startNodeColor})
    }

    drawEndNode(node, config = {}) {
      this.drawNode(node, {color:config.color || this.settings.endNodeColor})
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
        }).findPath(JSON.parse(element.dataset.from), JSON.parse(element.dataset.to));
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
