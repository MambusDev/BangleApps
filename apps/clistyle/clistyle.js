const margin = 40;  // Top and bottom

const textColor = {
  green: 0,
  yellow: 1,
  red: 2,
  white: 3,
  highlighted: 4,
  black: 5
};


// Supported Fonts
//require("FontTeletext10x18Ascii").add(Graphics);
//require("FontHaxorNarrow7x17").add(Graphics);
require("FontDylex7x13").add(Graphics);

//const teletext10x18ascii = {name:"Teletext10x18Ascii", width:10, height:18};
//const builtin4x6 = {name:"4x6", width:4, height:6};
//const builtin6x8 = {name:"6x8", width:6, height:8};
//const haxornarrow7x17 = {name:"HaxorNarrow7x17", width:7, height:17};
const dylex7x13 = {name:"Dylex7x13", width:7, height:13};

// Set font here:
const cliFont = dylex7x13;

const cliHeight = g.getHeight() - 2 * margin;
const cliWidth = g.getWidth();


// Default font size is 1
var cliFontSize = 1;
var cursorFlag = false;

// Cache cursor state
var cursor = {
  initialized: false,
  x: 0,
  y: 0,
  show: false
};

// Private functions
function cliLineHeight() {
 return 1.25 * cliFont.height * cliFontSize; 
}

function cliColumnWidth() {
  return (cliFont.width) * cliFontSize;
}

function cliLineStart() {
  // Factor 1.5 to have some space between '>' and text
  return 1.5 * cliColumnWidth();
}

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
  setTextColorRgb(textColor.green);
  g.setFont(cliFont.name, cliFontSize);
  g.setFontAlign(-1,-1);
  g.drawString(">", cliLineStart() / 4, margin + line * cliLineHeight());
}

function clearLine(line) {
  let x1 = 0;
  let y1 = margin + line * cliLineHeight();
  let x2 = cliWidth;
  let y2 = y1 + cliLineHeight();
  g.setColor(0,0,0);
  g.fillRect(x1,y1,x2,y2);  
}

function writeLine(str, line, color){
  g.setFont(cliFont.name, cliFontSize);
  g.setFontAlign(-1,-1);
  if (color == textColor.highlighted) {
    //draw green / white rectangle
    g.setColor(1,1,1);
    let x1 = cliLineStart();
    let y1 = margin + line * cliLineHeight();
    let x2 = x1 + str.length * cliColumnWidth();
    let y2 = y1 + cliLineHeight();
    g.fillRect(x1,y1,x2,y2); 
  }
  setTextColorRgb(color);
  g.drawString(str, cliLineStart(), margin + line * cliLineHeight());
}

function drawCursor() {
  let lineWidth = 1;
  
  let x1 = cursor.x;
  let x2 = x1 + lineWidth; 
  let y1 = cursor.y;
  let y2 = y1 + cliFont.height * cliFontSize;
  
  g.fillRect(x1, y2, x2, y1);
}

function cursorAnimation() {
  if (cursor.initialized){
    setTextColorRgb(textColor.green);
    g.setFontAlign(-1,-1);
    //writeLineStart(cursor.line);
    
    if (cursor.show) {
      drawCursor();
    } else {
      setTextColorRgb(textColor.black);
      drawCursor();
    }

    cursor.show = !cursor.show;
  }
}

// Public functions
function setFontSize(size) {
   cliFontSize = size; 
}

function clear(clear_widgets) {
  let lines = cliHeight / cliLineHeight();
  
  if (clear_widgets) {
    g.clear();
  } else {
    for (let i = 0; i < lines; i++) {
      clearLine(i);
    }
  }
  
  cursor = {initialized: false, x: 0, y: 0, show: false};
}

function printLine(str, color, line, update_cursor) {
  clearLine(line);
  writeLineStart(line);
  writeLine(str, line, color);
  if (update_cursor) {
    cursor.x = g.stringWidth(str) + cliLineStart() + 0.25 * cliColumnWidth();
    cursor.y = margin + line * cliLineHeight();
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

// Unit test
//clear(true);
//setFontSize(2);
//printLine("12:33 Uhr", textColor.green, 1, false);
//printLine("00p00", textColor.green, 2, true);
//printLine(cursor.x, textColor.green, 3, false);