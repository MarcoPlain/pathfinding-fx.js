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
function loadExamplePathfinding() {
  if (PFX) clearDemo();
  document
    .querySelector("[data-demo='ExamplePathfinding']")
    .classList.add("bg-primary");
    document
      .querySelector("[data-demo='ExamplePathfinding']")
      .classList.remove("bg-secondary");
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
            style: {
              size: { w: 10, h: 10 },
              color: "#0a9396",
              shape: "circle",
            },
          },
        },
        style: { color: "#0a9396", size: { w: 15, h: 15 }, shape: "circle" },
        speed: 100,
      },
      ...cbs,
    })
    .addNode({
      ...findRandomNode(map),
      ...{
        to: {
          ...findRandomNode(map),
          ...{ style: { size: { w: 10, h: 10 }, color: "#9b2226" } },
        },
        style: { color: "#9b2226", size: { w: 15, h: 15 } },
        speed: 50,
      },
      ...cbs,
    })
    .addNode({
      ...findRandomNode(map),
      ...{
        to: {
          ...findRandomNode(map),
          ...{ style: { size: { w: 10, h: 10 }, color: "#ee9b00" } },
        },
        style: { color: "#ee9b00", size: { w: 15, h: 15 } },
        speed: 200,
      },
      ...cbs,
    });

  PFX.play();
}
function loadExampleDataFlow() {
  if (PFX) clearDemo();
  document
    .querySelector("[data-demo='ExampleDataFlow']")
    .classList.add("bg-primary");
  document
    .querySelector("[data-demo='ExampleDataFlow']")
    .classList.remove("bg-secondary");
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
        onAdd: (node) => {
          node.jump(Math.floor(Math.random() * node.path.length));
        },
        onPathEnd: (node) => {
          node.x = node.start.pos.x * SIZE;
          node.y = node.start.pos.y * SIZE;
          node.pos.x = node.start.pos.x;
          node.pos.y = node.start.pos.y;
          PFX.findPathForNode(node);
        },
      },
    });
  }

  PFX.play();
}
function loadExampleMazeRunners() {
  if (PFX) clearDemo();
  document
    .querySelector("[data-demo='ExampleMazeRunners']")
    .classList.add("bg-primary");
    document
      .querySelector("[data-demo='ExampleMazeRunners']")
      .classList.remove("bg-secondary");
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
          node.pos = findRandomNode(map).pos;
          node.x = node.pos.x * SIZE;
          node.y = node.pos.y * SIZE;
          PFX.findPathForNode(node);
        },
      },
    });
  }

  PFX.play();
}
function loadExampleFlooding() {
  if (PFX) clearDemo();
  document
    .querySelector("[data-demo='ExampleFlooding']")
    .classList.add("bg-primary");
    document
      .querySelector("[data-demo='ExampleFlooding']")
      .classList.remove("bg-secondary");
  const canvas = document.getElementById("demo-examples");
  let map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];
  PFX = new PathfindingFX(canvas, {
    map: map,
    wallNodeColor: "rgba(254, 228, 64, 0.5)",
    wallEdgeColor: "rgba(254, 228, 64, 0.5)",
    onUpdateMap: (map) => {
      console.log(JSON.stringify(map));
    },
  });

  const cbs = {
    onUpdate: (node, delta) => {
      node.currentFloodAmount += node.floodSpeed / delta;
      if (node.currentFloodAmount > 32) node.currentFloodAmount = 0;

      node.floodToDraw = node
        .getAccessiblePositions()
        .filter((p) => p.f < node.currentFloodAmount);
    },
    onRender: (node) => {
      //return;
      //console.log(node.style.color);
      if (node.floodToDraw)
        node.floodToDraw.map((p) => {
          //if(node.pfx.positionNotOccupied(p)){
          p.style = { color: node.style.color, size: { w: 20, h: 20 } };
          node.pfx.drawNode(p);
          //  node.pfx.setBlockedPositions(p)
          //}
        });
    },
  };

  PFX.addNode({
    ...{
      floodSpeed: 12,
      currentFloodAmount: 0,
      pos: {
        x: 10,
        y: 10,
      },
      style: { color: "rgba(0, 187, 249,0.5)" },
    },
    ...cbs,
  });

  PFX.addNode({
    ...{
      floodSpeed: 18,
      currentFloodAmount: 0,
      pos: {
        x: map[0].length - 11,
        y: 10,
      },
      style: { color: "rgba(241, 91, 181,0.5)" },
    },
    ...cbs,
  });

  PFX.addNode({
    ...{
      floodSpeed: 22,
      currentFloodAmount: 0,
      pos: {
        x: 10,
        y: map.length - 11,
      },
      style: { color: "rgba(0, 245, 212,0.5)" },
    },
    ...cbs,
  });

  PFX.addNode({
    ...{
      floodSpeed: 10,
      currentFloodAmount: 0,
      pos: {
        x: map[0].length - 11,
        y: map.length - 11,
      },
      style: { color: "rgba(155, 93, 229,0.5)" },
    },
    ...cbs,
  });

  PFX.play();
}
function loadExampleMountainClimber() {
  if (PFX) clearDemo();
  document
    .querySelector("[data-demo='ExampleMountainClimber']")
    .classList.add("bg-primary");
    document
      .querySelector("[data-demo='ExampleMountainClimber']")
      .classList.remove("bg-secondary");
  const canvas = document.getElementById("demo-examples");
  let map = [
    [5, 5, 5, 5, 5, 4, 4, 4, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2],
    [4, 5, 5, 5, 5, 4, 4, 4, 3, 3, 3, 4, 4, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 2, 1],
    [4, 4, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1],
    [4, 4, 4, 5, 5, 5, 5, 4, 4, 4, 4, 4, 3, 4, 3, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1],
    [3, 4, 4, 4, 5, 5, 5, 5, 4, 3, 4, 3, 3, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1],
    [3, 3, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 2, 3, 2, 2, 2, 2, 1, 1, 1, 1],
    [3, 4, 3, 4, 4, 4, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1],
    [3, 3, 3, 3, 4, 4, 4, 3, 3, 2, 3, 2, 2, 2, 2, 1, 1, 1, 1, 2, 3, 4, 2, 1, 1],
    [3, 3, 4, 4, 4, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 4, 5, 2, 1, 1],
    [3, 4, 4, 4, 4, 3, 3, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1],
    [3, 3, 4, 4, 4, 3, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [3, 4, 4, 3, 3, 3, 2, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [3, 4, 3, 3, 3, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1],
    [3, 3, 3, 3, 2, 1, 1, 1, 1, 1, 1, 1, 2, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 1],
    [3, 3, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 3, 3, 2, 1, 1, 1, 1, 1],
    [2, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 4, 4, 4, 4, 3, 2, 1, 1, 1, 1, 1],
    [2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 4, 5, 5, 4, 3, 3, 1, 1, 1, 1, 1],
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 4, 4, 4, 4, 4, 3, 3, 1, 1, 1, 1],
    [2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 2, 3, 3, 3, 4, 4, 4, 3, 3, 1, 1, 1],
    [1, 1, 1, 1, 1, 2, 4, 3, 2, 2, 1, 1, 1, 1, 2, 2, 2, 3, 4, 4, 4, 3, 3, 1, 1],
    [1, 1, 1, 1, 1, 3, 5, 4, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 4, 4, 3, 3, 1],
    [1, 1, 1, 1, 1, 3, 4, 4, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 4, 4, 3, 1],
    [1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 5, 4, 3],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 4, 4],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 4, 4],
  ];

  PFX = new PathfindingFX(canvas, {
    map: map,
    onInteractionWithAFreeNode: (node, pos, pfx) => {
      if (pfx.positionNotOccupied(pos)) {
        if (pfx.map[pos.y][pos.x] == 5) pfx.map[pos.y][pos.x] = 1;
        pfx.map[pos.y][pos.x]++;
        pfx.updateMap(pfx.map);
      }
    },
  });

  PFX.addNode({
    pos: { x: 5, y: 20 },
    to: {
      pos: { x: 20, y: 15 },
      style: { color: "#6b705c", shape: "circle", size: { w: 10, h: 10 } },
    },
    style: { color: "#6b705c", shape: "circle", size: { w: 15, h: 15 } },
    speed: 100,
    onPathEnd: (node) => {
      const accessablePositions = node.getAccessiblePositions();
      if (accessablePositions.length > 0)
        node.to.pos =
          accessablePositions[
            Math.floor(Math.random() * accessablePositions.length)
          ].pos;
    },
  });

  PFX.play();
}
function loadExampleLightSource() {
  if (PFX) clearDemo();
  document
    .querySelector("[data-demo='ExampleLightSource']")
    .classList.add("bg-primary");
    document
      .querySelector("[data-demo='ExampleLightSource']")
      .classList.remove("bg-secondary");
  const canvas = document.getElementById("demo-examples");
  let map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
    [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  const cbs = {
    onUpdate: (node, delta) => {},
    onRender: (node) => {
      node
        .getAccessiblePositions()
        .filter((p) => p.f < (node.pos.x + node.pos.y) / 1.5)
        .map((p) => {
          p.style = {
            color: "rgba(255,255,0, " + 1 / (p.g / 1.5) + ")",
            size: { w: 20, h: 20 },
          };
          node.pfx.drawNode(p);
        });
    },
  };

  PFX = new PathfindingFX(canvas, {
    map: map,
    emptyNodeColor: "#242424",
    wallNodeColor: "#262626",
    highlightEdges: false,
  });

  PFX.addNode({
    ...{
      pos: { x: 5, y: 5 },
      style: { color: "silver", size: { w: 20, h: 20 } },
    },
    ...cbs,
  });

  //PFX.play();
}
function clearDemo() {
  document.querySelectorAll("[data-demo]").forEach((btn) => {
    btn.classList.remove("bg-primary");
    btn.classList.add("bg-secondary");
  });
  PFX.reset();
  PFX.stop();
}
loadExamplePathfinding();
