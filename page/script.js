const SIZE = 20;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loadPathfinding() {
  const canvas= document.getElementById("pathfinding-canvas");
  canvas.style.height = "100vh";
  canvas.style.width = "100vw";
  let map = [];
  var from, to = {}


  for (let y = 0; y < Math.floor(canvas.offsetHeight / SIZE); y++) {
    map[y] = [];
    for (let x = 0; x < Math.floor(canvas.offsetWidth / SIZE); x++) {
      map[y][x] = Math.random() > 0.7 ? 0 : 1;
    }
  }

  while (true) {
    let checkY = getRandomInt(0, map.length - 1);
    let checkX = getRandomInt(0, map[checkY].length - 1);
    if (map[checkY][checkX]) {
      from = { x: checkX, y: checkY };
      break;
    }
  }
  while (true) {
    let checkY = getRandomInt(0, map.length - 1);
    let checkX = getRandomInt(0, map[checkY].length - 1);
    if (map[checkY][checkX]) {
      to = { x: checkX, y: checkY };
      break;
    }
  }

  const PFX = new PathfindingFX(
      document.getElementById("pathfinding-canvas"),
      { map: map }
    )
  .fromNode(from, {color:"red"})
  .toNode(to, {color:"green"})
  .render();


  while (true) {
    let checkY = getRandomInt(0, map.length - 1);
    let checkX = getRandomInt(0, map[checkY].length - 1);
    if (map[checkY][checkX]) {
      from = { x: checkX, y: checkY };
      break;
    }
  }

  while (true) {
    let checkY = getRandomInt(0, map.length - 1);
    let checkX = getRandomInt(0, map[checkY].length - 1);
    if (map[checkY][checkX]) {
      to = { x: checkX, y: checkY };
      break;
    }
  }


  PFX.addWalker(from, to, {color:"blue", loop: false, onPosChange: (node, pos) => {
    if(node.x == node.to.x && node.y == node.to.y){

      while (true) {
        let checkY = getRandomInt(0, map.length - 1);
        let checkX = getRandomInt(0, map[checkY].length - 1);
        if (map[checkY][checkX] && PFX.findPath({x:node.x, y:node.y}, node.to)) {
          to = { x: checkX, y: checkY };
          break;
        }
      }
      node.to.x = to.x;
      node.to.y = to.y;
    }
  }}).render();

  PFX.animate()
}

loadPathfinding()
