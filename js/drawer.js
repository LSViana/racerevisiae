/**
 * @param {GameController} gameController
 */
function redraw(gameController) {
  // Clear before any further drawin
  gameController.ctx2D.clearRect(0, 0, gameController.width, gameController.height);
  // Drawing active maps
  for(let map of gameController.activeMaps)
    map.draw();
}