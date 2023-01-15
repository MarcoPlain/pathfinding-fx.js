const SIZE = 20;
const COLORS_DATAFLOW = [
  "#D9ED92",
  "#B5E48C",
  "#99D98C",
  "#76C893",
  "#52B69A",
  "#34A0A4",
  "#168AAD",
  "#1A759F",
  "#1E6091",
  "#184E77",
];
const COLORS_MAZERUNNERS = [
  "#ff595e",
  "#ffca3a",
  "#8ac926",
  "#1982c4",
  "#6a4c93",
];

var PFX = null;

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
  if (PFX) clearDemo();
  const canvas = document.getElementById("demo-examples");
  let map = [];

  for (let y = 0; y < Math.floor(canvas.offsetHeight / SIZE); y++) {
    map[y] = [];
    for (let x = 0; x < Math.floor(canvas.offsetWidth / SIZE); x++) {
      map[y][x] = Math.random() > 0.6 ? 0 : 1;
    }
  }

  const cbs = {
    onPathEnd: (node) => {
      const accessablePositions = node.getAccessiblePositions();
      if (accessablePositions.length > 0)
        node.to.pos =
          accessablePositions[
            Math.floor(Math.random() * accessablePositions.length)
          ].pos;
    },
    onNoPath: (node) => {
      const accessablePositions = node.getAccessiblePositions();
      if (accessablePositions.length > 0)
        node.to.pos =
          accessablePositions[
            Math.floor(Math.random() * accessablePositions.length)
          ].pos;
    },
  };

  PFX = new PathfindingFX(canvas, {
    map: map,
  })
    .addNode({
      ...findRandomNode(map),
      ...{
        to: {
          ...findRandomNode(map),
          ...{
            style: { size: { w: 10, h: 10 }, color: "blue", shape: "circle" },
          },
        },
        style: { color: "blue", size: { w: 15, h: 15 }, shape: "circle" },
        speed: 100,
      },
      ...cbs,
    })
    .addNode({
      ...findRandomNode(map),
      ...{
        to: {
          ...findRandomNode(map),
          ...{ style: { size: { w: 10, h: 10 }, color: "purple" } },
        },
        style: { color: "purple", size: { w: 15, h: 15 } },
        speed: 50,
      },
      ...cbs,
    })
    .addNode({
      ...findRandomNode(map),
      ...{
        to: {
          ...findRandomNode(map),
          ...{ style: { size: { w: 10, h: 10 }, color: "orange" } },
        },
        style: { color: "orange", size: { w: 15, h: 15 } },
        speed: 200,
      },
      ...cbs,
    });

  PFX.play();
}

function loadExampleDataFlow() {
  if (PFX) clearDemo();
  const canvas = document.getElementById("demo-examples");
  let map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  PFX = new PathfindingFX(canvas, {
    map: map,
    emptyNodeColor: "#242424",
    wallNodeColor: "#464646",
    onUpdateMap: (map) => {
      //console.log(JSON.stringify(map));
    },
  });

  for (let i = 0; i < 100; i++) {
    let color =
      COLORS_DATAFLOW[Math.floor(Math.random() * COLORS_DATAFLOW.length)];
    PFX.addNode({
      ...{
        pos: { x: 1, y: 6 + Math.floor(Math.random() * 13) },
        start: { pos: { x: 1, y: 6 + Math.floor(Math.random() * 13) } },
        to: {
          pos: { x: 23, y: 6 + Math.floor(Math.random() * 13) },
          style: { size: { w: 10, h: 10 }, color: color, shape: "circle" },
        },
        style: { color: color, size: { w: 15, h: 15 }, shape: "circle" },
        speed: 80 + Math.random() * 120,
      },
      ...{
        onPathEnd: (node) => {
          node.x = node.start.pos.x * SIZE;
          node.y = node.start.pos.y * SIZE;
          node.pos.x = node.start.pos.x;
          node.pos.y = node.start.pos.y;
          PFX.findPathForWalker(node);
        },
      },
    });
  }

  PFX.play();
}
function loadExampleMazeRunners() {
  if (PFX) clearDemo();
  const canvas = document.getElementById("demo-examples");
  let map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  PFX = new PathfindingFX(canvas, {
    map: map,
  });

  const sides = ["top", "left", "right", "bottom"];

  for (let i = 0; i < 100; i++) {
    let color =
      COLORS_MAZERUNNERS[Math.floor(Math.random() * COLORS_MAZERUNNERS.length)];

    var pos = null;
    switch (sides[Math.floor(Math.random() * sides.length)]) {
      case "top":
        pos = { y: 0, x: Math.floor(Math.random() * map[0].length) };
        break;
      case "left":
        pos = { x: 0, y: Math.floor(Math.random() * map.length) };
        break;
      case "right":
        pos = {
          x: map[0].length - 1,
          y: Math.floor(Math.random() * map.length),
        };
        break;
      case "bottom":
        pos = {
          y: map.length - 1,
          x: Math.floor(Math.random() * map[0].length),
        };
        break;
    }

    PFX.addNode({
      ...{
        pos: pos,
        start: { pos: pos },
        to: {
          pos: {
            x: Math.floor(map[0].length / 2),
            y: Math.floor(map.length / 2),
          },
        },
        style: { color: color, size: { w: 15, h: 15 } },
        speed: 80 + Math.random() * 120,
      },
      ...{
        onPathEnd: (node) => {
          node.x = node.start.pos.x * SIZE;
          node.y = node.start.pos.y * SIZE;
          node.pos.x = node.start.pos.x;
          node.pos.y = node.start.pos.y;
          PFX.findPathForWalker(node);
        },
      },
    });
  }

  PFX.play();
}

function clearDemo() {
  PFX.reset();
  PFX.stop();
}
loadPathfinding();
