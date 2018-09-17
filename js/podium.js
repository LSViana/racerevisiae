window.addEventListener("load", () => {
  let imgWinner = document.getElementById("img-winner");
  let scoreMarker = document.getElementById("score-marker");
  let url = new URL(window.location.href);
  let score = url.searchParams.get("score");
  let winnerName = url.searchParams.get("winner");
  if (winnerName == "brown") {
    imgWinner.setAttribute("src", "img/cerevisiae-brown.png");
  } else if (winnerName == "blue") {
    imgWinner.setAttribute("src", "img/cerevisiae-blue.png");
  }
  scoreMarker.innerHTML = score;
  imgWinner.classList.remove("invisible");
});