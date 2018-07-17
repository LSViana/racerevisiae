const gameController = new GameController(null, -1, -1);
window.addEventListener("load", () => {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.getElementById("canvas");
  const ctx2D = canvas.getContext("2d");
  gameController.ctx2D = ctx2D;
  const body = document.querySelector("body");
  // Game Parameters
  window.gameController = gameController;
  // Adding Event Handlers
  window.addEventListener("resize", () => {
    let dimensions = body.getBoundingClientRect();
    gameController.width = dimensions.width;
    gameController.height = dimensions.height;
    if(gameController.activeMap != null) gameController.activeMap.adjustSize(gameController.width, gameController.height);
    // Fixing canvas size
    canvas.setAttribute("width", gameController.width);
    canvas.setAttribute("height", gameController.height);
  });
  //
  window.dispatchEvent(new UIEvent("resize"));
  // Start options and calls to GameController
  startGameController(gameController);
  // Setting function to redraw at each 16ms
  gameController.lastTick = new Date();
  window.gameLoopIntervalId = setInterval(() => {
    let now = new Date();
    let elapsed = now.getTime() - gameController.lastTick.getTime();
    gameController.lastTick = now;
    gameController.tick(elapsed);
  }, 16);
});

const leftKeys = {
  left: 65,
  right: 68,
  top: 87,
  down: 83
};

const rightKeys = {
  left: 37,
  right: 39,
  top: 38,
  down: 40
};

/**
 * @param {GameController} gameController 
 */
function startGameController(gameController) {
  startKeyDictionary(gameController);
  // Left map
  let leftMap = new SliderMap(0, 0, gameController.width / 2, gameController.height);
  gameController.maps.push(leftMap);
  gameController.addActiveMap(leftMap);
  let leftPlayer = new SCerevisiae(true, gameController.width / 4, gameController.height * .9, 20, 20, 1, leftKeys);
  leftMap.addPlayer(leftPlayer);
  // Right map
  let rightMap = new SliderMap(gameController.width / 2, 0, gameController.width / 2, gameController.height, "#00FFFF", "#FF0FFF");
  gameController.maps.push(rightMap);
  gameController.addActiveMap(rightMap);
  let rightPlayer = new SCerevisiae(true, 3 * gameController.width / 4, gameController.height * .9, 20, 20, 1, rightKeys);
  rightMap.addPlayer(rightPlayer);
}