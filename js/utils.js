function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function getHexRandom(min = 0, max = 255) {
  let value = Math.round(Math.random() * (max - min)) + min;
  let strValue = value.toString(16);
  return strValue.padStart(2, "0");
}

function createDOMImage(backgroundImage) {
  let id = guid();
  let img = document.createElement("img");
  document.body.appendChild(img);
  img.id = id;
  img.setAttribute("src", backgroundImage);
  img.style.display = "none";
  return img;
}

function getFormattedTime(milisseconds) {
  let seconds = Math.floor(milisseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  let secondsOfMinute = seconds % 60;
  if (minutes <= 9)
    minutes = "0" + minutes;
  if (secondsOfMinute <= 9)
    secondsOfMinute = "0" + secondsOfMinute;
  return minutes + ":" + secondsOfMinute;
}