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
      return { pos: { x: checkX, y: checkY }, color: "pink" };
      break;
    }
  }
}

function loadPathfinding() {
  const canvas = document.getElementById("pathfinding-canvas");
  canvas.style.height = "500px";
  canvas.style.width = "500px";
  let map = [];

  for (let y = 0; y < Math.floor(canvas.offsetHeight / SIZE); y++) {
    map[y] = [];
    for (let x = 0; x < Math.floor(canvas.offsetWidth / SIZE); x++) {
      map[y][x] = Math.random() > 0.8 ? 0 : 1;
    }
  }

  const cbs = {
    onPathEnd: (node) => {
      node.to.pos = findRandomNode(map).pos;
    },
    onNoPath: (node) => {
      node.to.pos = findRandomNode(map).pos;
    },
  };

  const PFX = new PathfindingFX(canvas, {
    map: map,
  })
    .addPath({
      from: findRandomNode(map),
      to: findRandomNode(map),
      color: "gray",
    })
    .addMovingNode({...{
      from: findRandomNode(map),
      to: findRandomNode(map),
      color: "blue",
      speed: 100,
    }, ...cbs})
    /*.addMovingNode({...{
      from: findRandomNode(map),
      to: findRandomNode(map),
      color: "purple",
      speed: 50,
    }, ...cbs})
    .addMovingNode({...{
      from: findRandomNode(map),
      to: findRandomNode(map),
      color: "orange",
      speed: 200,
    }, ...cbs})*/

  PFX.animate();
}

loadPathfinding();
