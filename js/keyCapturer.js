window.addEventListener("load", () => {
  window.addEventListener("keydown", (ev) => {
    gameController.keys[ev.keyCode] = true;
  });
  window.addEventListener("keyup", (ev) => {
    gameController.keys[ev.keyCode] = false;
  });
});

/**
 * 
 * @param {GameController} gameController 
 */
function startKeyDictionary(gameController) {
  for(let i = 8; i <= 222; i++) {
    gameController.keys[i] = false;
  }
}