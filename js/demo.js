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
  // Map
  let itemTypes = [ GameSugar, GameOxygen ];
  let backgroundImages = [ './img/scenario.png', './img/scenario.png' ];
  let mainMap = new SliderMap(gameController, 0, 0, gameController.width, gameController.height, null, 2, 1, itemTypes, .1, false, 2, backgroundImages, true, false, 3600, "#000000", 10, null);
  gameController.maps.push(mainMap);
  gameController.addActiveMap(mainMap);
  let leftPlayer = new SCerevisiae(true, gameController.width / 4, gameController.height * .8, 45, 90, 1, leftKeys, "./img/cerevisiae-blue.png");
  mainMap.addPlayer(leftPlayer);
  let rightPlayer = new SCerevisiae(true, 3 * gameController.width / 4, gameController.height * .8, 45, 90, 1, rightKeys, "./img/cerevisiae-brown.png");
  mainMap.addPlayer(rightPlayer);
}