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