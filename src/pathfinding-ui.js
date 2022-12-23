var PathfindingUI = (function () {
  "use strict";

  /**
   * Created by Marco Schlichting (marcoplain) on 22/12/2022.
   * MIT License.
   * Version 1.0.0
   */

  class PathfindingUI {
    constructor(settings = {}) {
      /*if (!(element instanceof Node)) {
              throw ("Can't initialize VanillaTilt because " + element + " is not a Node.");
            }*/

    }
  }

  if (typeof document !== "undefined") {
    /* expose the class to window */
    window.PathfindingUI = PathfindingUI;

    /**
     * Auto load
     */
    // VanillaTilt.init(document.querySelectorAll("[data-tilt]"));
  }

  return PathfindingUI;
})();

export default PathfindingUI;