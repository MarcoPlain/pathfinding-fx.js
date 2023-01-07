const SIZE = 20;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function findRandomNode(map) {
  while (true) {
    let checkY = getRandomInt(0, map.length - 1);
    let checkX = getRandomInt(0, map[checkY].length - 1);
    if (map[checkY][checkX]) {
      return { pos: { x: checkX, y: checkY } };
      break;
    }
  }
}

function loadPathfinding() {
  const canvas = document.getElementById("pathfinding-canvas");
  canvas.style.height = "500px";
  canvas.style.width = "500px";
  let map = [];
  var from,
    to = {};

  for (let y = 0; y < Math.floor(canvas.offsetHeight / SIZE); y++) {
    map[y] = [];
    for (let x = 0; x < Math.floor(canvas.offsetWidth / SIZE); x++) {
      map[y][x] = Math.random() > 0.8 ? 0 : 1;
    }
  }

  from = findRandomNode(map);
  to = findRandomNode(map);

  const PFX = new PathfindingFX(document.getElementById("pathfinding-canvas"), {
    map: map,
  })
    /*.fromNode(from, { color: "red" })
    .toNode(to, { color: "green" })
    .render();*/

  PFX.addWalker(findRandomNode(map), findRandomNode(map), {
    color: "blue",
    speed: 100,
    onPosChange: (node, pos) => {
      if (node.pos.x == node.to.pos.x && node.pos.y == node.to.pos.y) {
        to = findRandomNode(map);
        node.to.pos = to.pos;
      }
    },
  })
    .addWalker(findRandomNode(map), findRandomNode(map), {
      color: "purple",
      speed: 50,
      onPosChange: (node, pos) => {
        if (node.pos.x == node.to.pos.x && node.pos.y == node.to.pos.y) {
          to = findRandomNode(map);
          node.to.pos = to.pos;
        }
      },
    })
    .addWalker(findRandomNode(map), findRandomNode(map), {
      color: "orange",
      speed: 200,
      onPosChange: (node, pos) => {
        if (node.pos.x == node.to.pos.x && node.pos.y == node.to.pos.y) {
          to = findRandomNode(map);
          node.to.pos = to.pos;
        }
      },
    });

  PFX.animate();
}

loadPathfinding();
