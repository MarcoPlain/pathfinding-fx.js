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
  document.querySelector("#example-title").innerHTML = "Basic Pathfinding";
  document.querySelector("#example-description").innerHTML =
    "The most basic example, showing 3 nodes following their way to their goal. Once reached, they simply get a new one.";
  document.querySelector("#example-instructions").innerHTML =
    "Use your mouse or finger to remove walls, add them, or drag the nodes and their goals around!";

  if (PFX) clearDemo();
  document
    .querySelector("[data-demo='ExamplePathfinding']")
    .classList.add("bg-primary");
  document
    .querySelector("[data-demo='ExamplePathfinding']")
    .classList.remove("bg-secondary");
  const canvas = document.getElementById("demo-examples");
  let map = [];

  for (let y = 0; y <  Math.ceil(canvas.offsetWidth / SIZE); y++) {
    map[y] = [];
    for (let x = 0; x < Math.ceil(canvas.offsetWidth / SIZE); x++) {
      map[y][x] = Math.random() > 0.6 ? 0 : 1;
    }
  }

  const cbs = {
    onNoPath: (node) => { 
      const accessablePositions = node.positions();
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
  document.querySelector("#example-title").innerHTML = "Data Flow";
  document.querySelector("#example-description").innerHTML =
    "Using mutiple similar nodes going the same direction, and resetting them on reaching their goal we got a 'stream like' effect.";
  document.querySelector("#example-instructions").innerHTML =
    "Use your mouse or finger to remove walls, add them, or drag the nodes and their goals around!";
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

          // Reset the nodes position back to the start position 
          // which we stored upon creating the node.
          node.pos.x = node.start.pos.x;
          node.pos.y = node.start.pos.y;

          // Node has new position now, the goal is the same, 
          // but we need to find the Path again.
          node.findPath();
        },
      },
    });
  }

  PFX.play();
}
function loadExampleMazeRunners() {
  document.querySelector("#example-title").innerHTML = "Maze Runners";
  document.querySelector("#example-description").innerHTML =
    "Probably the best way to show the strength of pathfinding is to send nodes into a maze with the goal to reach the center.";
  document.querySelector("#example-instructions").innerHTML =
    "Use your mouse or finger to remove walls, add them, or drag the nodes and their goals around!";
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
          node.findPath();
        },
      },
    });
  }

  PFX.play();
}
function loadExampleFlooding() {
  document.querySelector("#example-title").innerHTML = "Flooding";
  document.querySelector("#example-description").innerHTML =
    "By figuring out how far every position is from a specific node, and then allowing to show more and more, we've got a pretty floor flooding effect of colors!";
  document.querySelector("#example-instructions").innerHTML =
    "Use your mouse or finger to remove or add walls, see how it effects the flooding effect!";
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
      const highestF = Math.max(
        ...node.positions().map((p) => p.f)
      );
      if (node.currentFloodAmount > highestF * 1.25)
        node.currentFloodAmount = 0;
      node.floodToDraw = node
        .positions()
        .filter((p) => p.f < node.currentFloodAmount);
    },
    onRender: (node) => {
      if (node.floodToDraw)
        node.floodToDraw.map((p) => {
          p.style = { color: node.style.color, size: { w: 20, h: 20 } };
          node.pfx.drawNode(p);
        });
    },
  };

  PFX.addNode({
    ...{
      interactive: false,
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
      interactive: false,
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
      interactive: false,
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
      interactive: false,
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
  document.querySelector("#example-title").innerHTML = "Mountain Climber";
  document.querySelector("#example-description").innerHTML =
    "Making use of a weighted map the pathfinding algorithm makes sure to find the easiest path for our old and brave mountain climber.";
    document.querySelector("#example-instructions").innerHTML =
    "Interact with the map to toggle between different 'heights'";
  document
    .querySelector("[data-demo='ExampleMountainClimber']")
    .classList.add("bg-primary");
  document
    .querySelector("[data-demo='ExampleMountainClimber']")
    .classList.remove("bg-secondary");

  if (PFX) clearDemo();

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
      if (pfx.free(pos)) {
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
      const accessablePositions = node.positions();
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
  document.querySelector("#example-title").innerHTML = "Light Bulb";
  document.querySelector("#example-description").innerHTML =
    "By playing around with colors and calculated reachable positions we've got a light bulb effect.";
    document.querySelector("#example-instructions").innerHTML =
    "Drag around the light bulb node to increase its intensity, there is a smiley hidden somewhere!";
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
        .positions()
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
