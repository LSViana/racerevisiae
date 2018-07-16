function drawleftUserPlayers() {
  /**
   * @type {GameController}
   */
  let gameController = window.gameController;
  for(let userPlayer of gameController.leftUserPlayers) {
    userPlayer.draw();
  }
}