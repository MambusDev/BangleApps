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
  var battery_status = {width: center.x - 2 * margin.left, x: center.x + margin.left};
  
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

function drawAll() {
  var time = getTimeStrings();
  var battery = getBatteryLevel(); 
  
  drawStaticElements();
  drawSeconds(time.seconds);
  drawClock(time.hours, time.minutes);
  drawWeekday(time.weekday);
  drawDate(time.day, time.month);
  drawBatteryStatus(battery);
}

function drawInfo() {
  var time = getTimeStrings();
  var battery = getBatteryLevel(); 
  
  drawSeconds(time.seconds);
  drawClock(time.hours, time.minutes);
  drawWeekday(time.weekday);
  drawDate(time.day, time.month);
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


