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

/**
 * @param {GameController} gameController 
 */
function startGameController(gameController) {
  startKeyDictionary(gameController);
  let leftMap = new SliderMap(0, 0, gameController.width / 2, gameController.height);
  gameController.maps.push(leftMap);
  gameController.activeMap = leftMap;
  gameController.addLeftPlayer(new SCerevisiae(true, gameController.width / 4, gameController.height * .9, 20, 20));
}