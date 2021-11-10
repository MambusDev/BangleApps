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
  initialized: false,
  line: 0,
  column: 0,
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
  g.setFontAlign(-1,-1);
  g.drawString(">", cliLineStart, margin + line * cliFontSize * lineHeight);
}

function clearLine(line) {
  let lineHeight = cliFontHeight + cliFontHeight / 2;
  let x1 = 0;
  let y1 = margin + line * cliFontSize * lineHeight - 2;
  let x2 = cliWidth;
  let y2 = y1 + cliFontSize * cliFontHeight + 2;
  g.setColor(0,0,0);
  g.fillRect(x1,y1,x2,y2);  
}

function writeLine(str, line, color){
  let lineHeight = cliFontHeight + cliFontHeight / 2;
  g.setFont(cliFont,cliFontSize);
  g.setFontAlign(-1,-1);
  if (color == textColor.highlighted) {
    //draw green / white rectangle
    g.setColor(1,1,1);
    let x1 = (2 * cliFontWidth * cliFontSize) - 2;
    let y1 = margin + line * cliFontSize * lineHeight -2;
    let x2 = x1 + str.length * cliFontSize * cliFontWidth;
    let y2 = y1 + cliFontSize * cliFontHeight + 2;
    g.fillRect(x1,y1,x2,y2); 
  }
  setTextColorRgb(color);
  g.drawString(str, 1.5 * cliFontWidth * cliFontSize, margin + line * cliFontSize * lineHeight);
}

function cursorAnimation() {
  if (cursor.initialized){
    let lineHeight = cliFontHeight + cliFontHeight / 2;
    setTextColorRgb(textColor.green);
    g.setFontAlign(-1,-1);
    writeLineStart(cursor.line);
    if (cursor.show) {
      g.drawString("|", (1.25 + cursor.column) * cliFontWidth * cliFontSize, margin + cursor.line * cliFontSize * lineHeight);
    } else {
      setTextColorRgb(textColor.black);
      g.drawString("|", (1.25 + cursor.column) * cliFontWidth * cliFontSize, margin + cursor.line * cliFontSize * lineHeight);
    }

    cursor.show = !cursor.show;
  }
}

// Public functions
function setFontSize(size) {
   cliFontSize = size; 
}

function clear(clear_widgets) {
  let lineHeight = cliFontHeight + cliFontHeight / 2;
  let lines = cliHeight / lineHeight;
  
  if (clear_widgets) {
    g.clear();
  } else {
    for (let i = 0; i < lines; i++) {
      clearLine(i);
    }
  }
  
  cursor = {initialized: false, line: 0, column: 0, show: false};
}

function printLine(str, color, line, update_cursor) {
  clearLine(line);
  writeLineStart(line);
  writeLine(str, line, color);
  if (update_cursor) {
    cursor.line = line;
    cursor.column = str.length;
    cursor.initialized = true;
  }
}

exports.setFontSize = function(size) {
  setFontSize(size);
}

exports.clear = function(clear_widgets) {
  clear(clear_widgets);
}

exports.printLine = function(str, color, line, update_cursor) {
  printLine(str, color, line, update_cursor);
}

exports.textColor = textColor;

var animationInterval = setInterval(cursorAnimation, 500);