import { tryCatch } from './index';
import { setTime } from '../engine/time';
import localStorageWrapper from '../engine/localStorage';
const LZString = require('../vendor/lz-string-new');//.orig');

/*  ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
"P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "[", "\", "]", "^", "_",
"`", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o",
"p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
58 max blocks atm. extentable to 62 without rework */
const LOOKUP_TABLE = new Array(58).fill(1).map((_,i)=>String.fromCharCode(65+i));

function mapStringToCurrentMap(str) {
  for (let i=0; i<str.length; i++) {
    const z = i % 256;
    const y = i / 256 % 64 | 0;
    const x = i / 256 / 64 | 0;

    if (str[i] !== '-') {
      const idx = LOOKUP_TABLE.indexOf(str[i]);
      if (idx !== -1) window.game.map[x][y][z] = idx; // if invalid, then refer to seed (by doing nothing). else use.
    }
  }
}

function repeat(char, times) {
  let out = '';
  for (let i=0; i<times; i++) out += char;
  return out;
}

function unMinify(str) {
  let out = ''

  let numberAssembly = '';
  for (let i=0; i<str.length; i++) {
    const isNumber = /\d/.test(str[i]);
    if (isNumber) numberAssembly += str[i];
    else if (numberAssembly) {
      out += repeat(str[i], parseInt(numberAssembly, 10));
      numberAssembly = '';
    }
    else out += str[i];
  }
  return out;
}

function main() {
  const { game } = window;
  // load items from save
  const time = document.getElementById("_mct").textContent || '';//localStorageWrapper.safeGet('_mct');
  const itemsFromSave = tryCatch(() => JSON.parse(document.getElementById("_mci").textContent || ''/*localStorageWrapper.safeGet('_mci')*/));
  if (itemsFromSave) game.hotbar.items = itemsFromSave.map(item => item === null ? Infinity : item);
  if (time) setTime(time);

  // const seed = window.localStorage.get
  //const compressed = document.getElementById("_mcm").textContent;//localStorageWrapper.safeGet('_mcm');
  const compressedStrArray = document.getElementById("_mcm").textContent.split(',');
  let compressed = undefined;
  if(compressedStrArray.length > 1)
    compressed = Uint8Array.from(compressedStrArray);
  if (!compressed) return;
  //console.log(compressed);

  // For now just use the minified string, will come back and bzip this or something
  // issues with UTF-16 in div, need to use byte array and compress byte array
  //const uncompressed = compressed;
  const uncompressed = LZString.decompressFromUint8Array(compressed);
  //const uncompressed = LZString.decompress(compressed);
  //console.log(uncompressed);
  const mapStr = unMinify(uncompressed);
  mapStringToCurrentMap(mapStr);
  console.log("Map Loaded");
}

module.exports = {
  main,
  unMinify,
};
