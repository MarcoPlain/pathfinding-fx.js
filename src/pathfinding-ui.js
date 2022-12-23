var PathfindingUi = (function () {
  "use strict";

  /**
   * Created by Marco Schlichting (marcoplain) on 22/12/2022.
   * MIT License.
   * Version 1.0.0
   */

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

      this.matrix = settings.matrix || [];

      this.tileSize = {
        h: this.height / this.matrix.length,
        w: this.width / this.matrix[0].length,
      };

      this.pathfinding = new Pathfinding(this.matrix);


      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.render();

      return this;
    }

    render() {
      const ctx = this.ctx;
      //ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let y = 0; y < this.matrix.length; y++) {
        for (let x = 0; x < this.matrix[y].length; x++) {
          ctx.font = "10px Arial";
          ctx.fillStyle = "#000000";
          if (!this.matrix[y][x])
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

    drawPath(fromNode, toNode) {
      const path = this.pathfinding.fromTo(fromNode, toNode);
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
        this.drawNode(path);
      }, 100);

      return this;
    }

    drawNode(path) {
      const ctx = this.ctx;
      const tileSize = this.tileSize;
      ctx.fillStyle = "#a8a8a8";
      const node = path.shift();
      if (!path.length) ctx.fillStyle = "#00bb88";
      ctx.fillRect(
        node.x * tileSize.w,
        node.y * tileSize.h,
        tileSize.w,
        tileSize.h
      );
      if (path.length) {
        setTimeout(() => {
          this.drawNode(path);
        }, 100);
      }
    }

    loop() {}

    static init(elements, settings) {
      console.log("init");
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
          matrix: JSON.parse(element.dataset.pathfinding),
        }).drawPath(JSON.parse(element.dataset.from), JSON.parse(element.dataset.to));
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
