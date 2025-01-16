// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);
require("FontTeletext5x9Ascii").add(Graphics);

console.info("Booting...");

////////////////////////////////////////////////////////////////////////////////////////////
// Global constants
////////////////////////////////////////////////////////////////////////////////////////////
const xmin = 0;
const ymin = 0;
const xmax = g.getWidth();
const ymax = g.getHeight();
const center = {x: xmax / 2, y: ymax / 2};
// Margin at top bigger for widgets
const margin = {top: ymax / 8, bottom: 2, left: 6, right: 6};
// Positioning of battery status
const battery_status = {width: center.x - 2 * margin.left, x: center.x + margin.left};

////////////////////////////////////////////////////////////////////////////////////////////
// Icon images (converted with https://www.espruino.com/Image+Converter)
////////////////////////////////////////////////////////////////////////////////////////////
const bell_icon = E.toArrayBuffer(atob("MDCBAf///////////////////////////////////////////////////D//////+D//////+B///+//+B//98f/4Af/58//gAP/485/AAH+c5x+AAD+c5z+AAB/OZz8AAB/OTn8AAA/OTn8AAA/mTn4AAA/nTn4AAA/nDn4AAA/nDn4AAA/nDn4AAA/nDn4AAA/nTn4AAA/uTn4AAA/OZz4AAA/OZz4AAA/OZx4AAA+c854AAAec8/4AAAf4+fwAAAf5+/wAAAP///gAAAH///AAAAH///AAAAD///AAAAD////////////////////8A//////8B///////D///////////////////////////////////////////////////w=="));

const mute_icon = E.toArrayBuffer(atob("HDCBAf/+f///4////j///+P///4f+f/h/4/+D/B/4H8H/gf4P+A/wf4B/g/gH+D+AP8H5gf4PnA/g+fD/B5+H+Dn8P8Gfw/wZ/j/gn+P/Af8/8B/z/4H/P/wf8//g/z/+D/P/8H8//4Pj//g+f/+Bx//4DP//kH//+Qf//5g/+AnB/gAcH4AB4PAAHwYAAfgAAD+AAAP8QAA/7AAH/8AA//wAH//AA//+AP//w=="));

const beep_icon = E.toArrayBuffer(atob("HDCBAf/+f///4////j///+P///4f///h///+D///4H///gf//+A///4B///gH//+AP//5gf//nA//+fD//5+H//n8P/+fw//5/j//n+P/+f8//5/z//n/P/+f8//5/z//n/P/+f8//5/j//n+f/+fx//5/P//n///+f///5//+An//gAf/4AB//AAH/4AAf/AAD/8AAP/wAA//AAH/8AA//wAH//AA//+AP//w=="));
  
const bt_icon = E.toArrayBuffer(atob("MDCBAf//////////+///////+f//////+P//////+H//////+D//////+B//////+Af/////+AP/////+AH/////+ED/////+GB/////+HA////x+HgP///w+Hwf///weHg////4OHB////8GGD////+CEH/////AAP/////gAf/////wA//////4B//////8D//////8D//////4B//////wA//////gAf/////AAP////+CEH////8GGD////4OHB////weHg////g+Hwf///x+Hgf///7+HA/////+GB/////+ED/////+AH/////+AP/////+Af/////+B//////+D//////+H//////+P//////+f//////+////////////w=="));

const bt_con_icon = E.toArrayBuffer(atob("MDCBAf//////////+///////+f//////+P//////+H//////+D//////+B//////+Af/////+AP/////+AH/////+ED/////+GB/////+HA////x+HgP///w+Hwf///weHg////4OHB////8GGD////+CEH/////AAP/////gAf///7/wA//f/x/4B/+P/g/8D/8H/Af8D/4D/g/4B/8H/x/wA/+P/7/gAf/f///AAP////+CEH////8GGD////4OHB////weHg////g+Hwf///x+Hgf///7+HA/////+GB/////+ED/////+AH/////+AP/////+Af/////+B//////+D//////+H//////+P//////+f//////+////////////w=="));


////////////////////////////////////////////////////////////////////////////////////////////
// System parameter getters
////////////////////////////////////////////////////////////////////////////////////////////

function getTimeStrings() {
  // Get the current date and time
  let now = new Date();

  // Extract parts of the date and time
  let hours = now.getHours().toString().padStart(2, '0'); // Hours (0-23)
  let minutes = now.getMinutes().toString().padStart(2, '0'); // Minutes (0-59)
  let seconds = now.getSeconds().toString().padStart(2, '0'); // Seconds (0-59)
  let day = now.getDate().toString(); // Day of the month (1-31)
  let month = (now.getMonth() + 1).toString(); // Month (1-12)
  var weekday = now.getDay(); // Weekday (0-6, Sunday = 0)

  // Convert weekday to a two-character string
  let weekdays_english = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  weekday = weekdays_english[weekday];

  // Log results (optional)
  console.info("Hours: " + hours);
  console.info("Minutes: " + minutes);
  console.info("Seconds: " + seconds);
  console.info("Day of Month: " + day);
  console.info("Month: " + month);
  console.info("Weekday: " + weekday);
  
  return {hours: hours, minutes: minutes, seconds: seconds, day: day, month: month, weekday: weekday};
}

function getBatteryLevel() {
  var battery = E.getBattery();
  console.info("Battery: " + battery.toString());

  if (battery <= 33) {
    battery = 0;
  } else if (battery <= 66) {
    battery = 1;
  } else {
    battery = 2;
  }

  return battery;
}

////////////////////////////////////////////////////////////////////////////////////////////
// Bluetooth settings and state
////////////////////////////////////////////////////////////////////////////////////////////
let settings;
const s = require('Storage');
const SETTINGS_FILE = 'setting.json';

//load settings
function loadSettings() {
  settings = s.readJSON(SETTINGS_FILE, 1) || {};
}

//return setting
function setting(key) {
  //define default settings
  const DEFAULTS = {
    'ble' : false,
    'beep' : false
  };
  if (!settings) { loadSettings(); }
  return (key in settings) ? settings[key] : DEFAULTS[key];
}

////////////////////////////////////////////////////////////////////////////////////////////
// Drawing functions
////////////////////////////////////////////////////////////////////////////////////////////

function drawSeconds(seconds) {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("7x11Numeric7Seg", 3);
  g.setFontAlign(1, 1, 0); // right, bottom, normal
  g.drawString(seconds, xmax - margin.right, ymax - margin.bottom - 2 * ymax / 10, true);
}

function drawClock(hours, minutes) {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("7x11Numeric7Seg", 5);
  g.setFontAlign(-1, 1, 0); // left, bottom, normal
  g.drawString(hours + ":" + minutes, xmin + margin.left, ymax - margin.bottom - 2 * ymax / 10, true);
}

function drawBatteryLevels() {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("Teletext5x9Ascii", 2);
  g.setFontAlign(-1, 1, 0); // left, bottom, normal


  y = ymax - ymax / 10 - margin.bottom;
  x_low = battery_status.x + 0.5 * battery_status.width / 3;
  x_mid = battery_status.x + 1.5 * battery_status.width / 3;
  x_high = battery_status.x + 2.5 * battery_status.width / 3;

  g.drawString("L", x_low, y, true);
  g.drawString("M", x_mid, y, true);
  g.drawString("H", x_high, y, true);
}

function drawStaticElements() {
  // Draw Background
  g.setColor(0.9,1,0.9); // Green-Gray
  g.setBgColor(0.9,1,0.9); // Green-Gray
  //g.setColor(0.1,0.8,1); // Blue (led on)
  g.fillRect(xmin, ymin + margin.top - 4, xmax, ymax);

  // Draw UI Borders
  g.setColor(0,0,0); // Black
  g.drawRect(center.x, ymin + margin.top, xmax - margin.right, ymin + ymax / 4 + margin.top);
  g.drawLine(xmin + margin.left, ymax - ymax / 10, xmax - margin.right, ymax - ymax / 10);
  g.drawLine(center.x, ymax - ymax / 10, center.x, ymax - margin.bottom);

  drawBatteryLevels();
}

function drawWeekday(weekday) {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("Teletext5x9Ascii", 5);
  g.setFontAlign(1, -1, 0); // right, top, normal
  g.drawString(weekday, center.x - margin.right, ymin + 1.5 * margin.top, true);
}

function drawDate(day, month) {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("7x11Numeric7Seg", 3);
  g.setFontAlign(1, -1, 0); // right, top, normal
  g.drawString(month + "." + day, xmax - 2 * margin.right, ymin + 1.5 * margin.top, true);
}

function clearBatteryStatus() {
  var battery_status = {width: center.x - 2 * margin.left, x: center.x + margin.left};
 
  g.setColor(0.9,1,0.9); // Green-Gray
  
  for (let battery = 0; battery <= 2; battery++) {
    var battery_bar = {x1: battery_status.x + battery * battery_status.width / 3, y1: ymax - ymax / 10 + 2 * margin.bottom, x2: battery_status.x + (battery + 1) * battery_status.width / 3, y2: ymax - 2 * margin.bottom};
    g.fillRect(battery_bar.x1, battery_bar.y1, battery_bar.x2, battery_bar.y2);
  }
}

function drawBatteryBar(battery) {
  // Draw new bar
  g.setColor(0,0,0); // Black
  
  var battery_bar = {x1: battery_status.x + battery * battery_status.width / 3, y1: ymax - ymax / 10 + 2 * margin.bottom, x2: battery_status.x + (battery + 1) * battery_status.width / 3, y2: ymax - 2 * margin.bottom};
  g.fillRect(battery_bar.x1, battery_bar.y1, battery_bar.x2, battery_bar.y2);  
}

function drawBatteryStatus(battery) {
  var battery_status = {width: center.x - 2 * margin.left, x: center.x + margin.left};
  
  clearBatteryStatus();
  drawBatteryBar(battery);
}

function drawBtStatus() {
  g.setColor(0,0,0); // Black
  g.setBgColor(0,0,0); // Black

  if (setting("ble")) {
    console.info("Bluetooth enabled");
    if (NRF.getSecurityStatus().connected) {
      console.info("Bluetooth connected");
      g.drawImage(bt_con_icon, xmin + margin.left, ymin + 1.75 * margin.top, {scale:0.4});
    } else {
      g.drawImage(bt_icon, xmin + margin.left, ymin + 1.75 * margin.top, {scale:0.4});
    }
  } else {
    g.setColor(0.9,1,0.9); // Green-Gray
    x1 = xmin + margin.left;
    y1 = ymin + 1.75 * margin.top;
    x2 = x1 + 24; // Icon size = 48x48
    y2 = y1 + 24; // Icon size = 48x48
    g.fillRect(x1, y1, x2, y2);
  }
}

function drawBeepStatus() {
  g.setColor(0,0,0); // Black
  g.setBgColor(0,0,0); // Black

  if (setting("beep") != false) {
    console.info("Beep enabled");
    g.drawImage(beep_icon, xmin + margin.left + 24, ymin + 1.75 * margin.top, {scale:0.4});
  } else {
    g.drawImage(mute_icon, xmin + margin.left + 24, ymin + 1.75 * margin.top, {scale:0.4});
  }
}

function drawAll() {
  var time = getTimeStrings();
  var battery = getBatteryLevel(); 

  drawStaticElements();

  drawSeconds(time.seconds);
  drawClock(time.hours, time.minutes);
  drawWeekday(time.weekday);
  drawDate(time.day, time.month);
  drawBatteryStatus(battery);
  drawBtStatus();
  drawBeepStatus();
}

function drawInfo() {
  var time = getTimeStrings();
  var battery = getBatteryLevel(); 

  drawSeconds(time.seconds);
  drawClock(time.hours, time.minutes);
  drawWeekday(time.weekday);
  drawDate(time.day, time.month);
  drawBtStatus();
  drawBeepStatus();
}

////////////////////////////////////////////////////////////////////////////////////////////
// App script
////////////////////////////////////////////////////////////////////////////////////////////

// Reset the state of the graphics library
g.reset();
// Clear the screen once, at startup
g.clear();
// draw immediately at first
drawAll();

// draw widgets
Bangle.loadWidgets(); 
Bangle.drawWidgets();

////////////////////////////////////////////////////////////////////////////////////////////
// Events and Callbacks
////////////////////////////////////////////////////////////////////////////////////////////

// Handle drawing interval
var secondInterval = setInterval(() => drawInfo(), 1000);
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (secondInterval) {
    clearInterval(secondInterval);
  }
  secondInterval = undefined;
  if (on) {
    secondInterval = setInterval(() => drawInfo(), 1000);
    // draw immediately
    drawAll();
    Bangle.loadWidgets(); 
    Bangle.drawWidgets();
  }
});

// Handle button presses
//setWatch(, BTN1, {repeat:false, edge:"falling"});
setWatch(Bangle.showLauncher, BTN2, {repeat:false, edge:"falling"});
//setWatch(, BTN3, {repeat:false, edge:"falling"});


