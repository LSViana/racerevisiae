/**
 * @param {GameController} gameController
 */
function redraw(gameController) {
  // Clear before any further drawin
  gameController.ctx2D.clearRect(0, 0, gameController.width, gameController.height);
  // Drawing active map
  gameController.activeMap.draw();
  // Drawing players
  for(let userPlayer of gameController.leftUserPlayers)
    userPlayer.draw();
}