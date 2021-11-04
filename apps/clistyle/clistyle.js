const margin = 40;  // Top and bottom

const textColor = {
  green: 0,
  yellow: 1,
  red: 2,
  white: 3,
  highlighted: 4,
  black: 5
};

const cliFont="6x8";
const cliFontWidth=6;
const cliFontHeight=8;
const cliLineStart = 4;
const cliHeight = g.getHeight() - 2 * margin;
const cliWidth = g.getWidth();

var cliFontSize = 2;
var cursorFlag = false;
var cursor = {
  line: 0,
  show: false
};

// Private functions

function setTextColorRgb(color) {
  g.setBgColor(0,0,0);
  switch(color) {
    case textColor.green:
      g.setColor(0,1,0);
      break;
    case textColor.yellow:
      g.setColor(1,1,0);
      break;
    case textColor.red:
      g.setColor(1,0,0);
      break;
    case textColor.white:
      g.setColor(1,1,1);
      break;
    case textColor.highlighted:
      g.setBgColor(1,1,1);
      g.setColor(0,0,0);
      break;
    case textColor.black:
      g.setColor(0,0,0);
      break;
    default:
      g.setColor(0,1,0);
  }
}

function writeLineStart(line){
  let lineHeight = cliFontHeight + cliFontHeight / 2;
  setTextColorRgb(textColor.green);
  g.setFont(cliFont, cliFontSize);
  g.drawString(">", cliLineStart, margin + line * cliFontSize * lineHeight);
}

function writeLine(str,line, color){
  let lineHeight = cliFontHeight + cliFontHeight / 2;
  g.setFont(cliFont,cliFontSize);
  g.setFontAlign(-1,-1);
  writeLineStart(line);
  setTextColorRgb(color);
  g.drawString(str, 2 * cliFontWidth * cliFontSize, margin + line * cliFontSize * lineHeight, true);
}

function cursorAnimation() {
  let lineHeight = cliFontHeight + cliFontHeight / 2;
  setTextColorRgb(textColor.green);
  g.setFontAlign(-1,-1);
  writeLineStart(cursor.line);
  if (cursor.show) {
    g.drawString("|", 1.5 * cliFontWidth * cliFontSize, margin + cursor.line * cliFontSize * lineHeight);
  } else {
    setTextColorRgb(textColor.black);
    g.drawString("|", 1.5 * cliFontWidth * cliFontSize, margin + cursor.line * cliFontSize * lineHeight);
  }

  cursor.show = !cursor.show;
}

// Public functions

function setFontSize(size) {
 cliFontSize = size; 
}

function clear() {
  g.clear();
  cursor = {line: 0, char: 0, show: false};
}

function printLine(str, color) {
  writeLine(str, cursor.line, color);
  cursor.line++;
}

var animationInterval = setInterval(cursorAnimation, 500);

// Test
clear();
setFontSize(2);
printLine("10:57", textColor.green);
printLine("Nov 05, 2021", textColor.green);
printLine("CW44", textColor.green);
