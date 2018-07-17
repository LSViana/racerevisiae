function getHexRandom(min = 0, max = 255) {
  let value = Math.round(Math.random() * (max - min)) + min;
  let strValue = value.toString(16);
  return strValue.padStart(2, "0");
}