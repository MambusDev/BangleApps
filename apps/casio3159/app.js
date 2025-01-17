// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);
require("FontTeletext5x9Ascii").add(Graphics);
require("Font8x12").add(Graphics);

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

const storage = require('Storage');
const SETTINGS_FILE = 'setting.json';
const language = "German";

// Button timing
const LONG_PRESSED_TIME_MS = 750;
// Button sounds
const BTN_BEEP_TIME_MS = 80;
const BTN_BEEP_FREQ_HZ = 6000;

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
  let weekdays_german = ["SO", "MO", "DI", "MI", "DO", "FR", "SA"];
  
  if (language == "German") {
    weekday = weekdays_german[weekday];
  } else {
    weekday = weekdays_english[weekday];
  }

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
// Read settings
////////////////////////////////////////////////////////////////////////////////////////////
let settings;

//load settings
function loadSettings() {
  settings = storage.readJSON(SETTINGS_FILE, 1) || {};
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
// Read alarms
////////////////////////////////////////////////////////////////////////////////////////////

function alarmIsSet() {
  return (storage.readJSON('alarm.json',1)||[]).some(alarm=>alarm.on);
}

////////////////////////////////////////////////////////////////////////////////////////////
// Drawing functions
////////////////////////////////////////////////////////////////////////////////////////////

function drawTimeDot() {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("7x11Numeric7Seg", 3);
  g.setFontAlign(1, 1, 0); // right, bottom, normal
  g.drawString(".", xmax - margin.right - 42, ymax - margin.bottom - 2.5 * ymax / 10, true);
}

function drawSeconds(seconds) {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("7x11Numeric7Seg", 3);
  g.setFontAlign(1, 1, 0); // right, bottom, normal
  g.drawString(seconds, xmax - margin.right, ymax - margin.bottom - 2.5 * ymax / 10, true);
}

function drawHours(hours) {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("7x11Numeric7Seg", 5);
  g.setFontAlign(-1, 1, 0); // left, bottom, normal
  g.drawString(hours, xmin + margin.left, ymax - margin.bottom - 2.5 * ymax / 10, true);
}

function drawTimeColon() {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("7x11Numeric7Seg", 5);
  g.setFontAlign(-1, 1, 0); // left, bottom, normal
  g.drawString(":", xmin + margin.left + 70, ymax - margin.bottom - 2.5 * ymax / 10, true); // 70 = two times font width
}

function drawMinutes(minutes) {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("7x11Numeric7Seg", 5);
  g.setFontAlign(-1, 1, 0); // left, bottom, normal
  g.drawString(minutes, xmin + margin.left + 95, ymax - margin.bottom - 2.5 * ymax / 10, true); // 105 = three times font width
}

function drawTime(hours, minutes) {
  drawHours(hours);
  drawTimeColon();
  drawMinutes(minutes);
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
  // Top right box
  g.drawRect(center.x, ymin + margin.top, xmax - margin.right, ymin + ymax / 4 + margin.top);
  g.drawRect(center.x + 1, ymin + margin.top + 1, xmax - margin.right - 1, ymin + ymax / 4 + margin.top - 1); // Line width 2
  
  // Horizontal bottom line
  g.drawLine(xmin + margin.left, ymax - ymax / 10, xmax - margin.right, ymax - ymax / 10);
  g.drawLine(xmin + margin.left, ymax - ymax / 10 + 1, xmax - margin.right, ymax - ymax / 10 + 1); // Line width 2
  
  // Vertical bottom line
  g.drawLine(center.x, ymax - ymax / 10, center.x, ymax - margin.bottom);
  g.drawLine(center.x - 1, ymax - ymax / 10, center.x - 1, ymax - margin.bottom); // Line width 2

  drawBatteryLevels();
}

function drawTopLeftText(text) {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("Teletext5x9Ascii", 5);
  g.setFontAlign(1, -1, 0); // right, top, normal
  g.drawString(text, center.x - margin.right, ymin + 1.5 * margin.top, true);
}

function drawTopRightText(text) {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("8x12", 4);
  g.setFontAlign(1, -1, 0); // right, top, normal
  g.drawString(text, xmax - 1.5 * margin.right, ymin + 1.25 * margin.top, true);
}

function drawDate(day, month) {
  drawTopRightText(day + "." + month.padStart(2, ' '));
}

function drawWeekday(weekday) {
  drawTopLeftText(weekday);
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
      g.drawImage(bt_con_icon, xmin + margin.left, ymin + 1.5 * margin.top, {scale:0.4});
    } else {
      g.drawImage(bt_icon, xmin + margin.left, ymin + 1.5 * margin.top, {scale:0.4});
    }
  } else {
    g.setColor(0.9,1,0.9); // Green-Gray
    x1 = xmin + margin.left;
    y1 = ymin + 1.5 * margin.top;
    x2 = x1 + 48 * 0.4; // Icon size = 48x48
    y2 = y1 + 48 * 0.4; // Icon size = 48x48
    g.fillRect(x1, y1, x2, y2);
  }
}

function drawBeepStatus() {
  g.setColor(0,0,0); // Black
  g.setBgColor(0,0,0); // Black

  if (setting("beep") != false) {
    console.info("Beep enabled");
    g.drawImage(beep_icon, xmin + margin.left + 24, ymin + 1.5 * margin.top, {scale:0.4});
  } else {
    g.drawImage(mute_icon, xmin + margin.left + 24, ymin + 1.5 * margin.top, {scale:0.4});
  }
}

function drawAlarmStatus() {
  g.setColor(0,0,0); // Black
  g.setBgColor(0,0,0); // Black

  if (alarmIsSet()) {
    console.info("Alarm set");
    g.drawImage(bell_icon, xmin + margin.left, ymin + 1.5 * margin.top + 24, {scale:0.4});
  } else {
    g.setColor(0.9,1,0.9); // Green-Gray
    x1 = xmin + margin.left;
    y1 = ymin + 1.5 * margin.top + 24;
    x2 = x1 + 48 * 0.4; // Icon size = 48x48
    y2 = y1 + 48 * 0.4; // Icon size = 48x48
    g.fillRect(x1, y1, x2, y2);
  }
}

function drawClock() {
  var time = getTimeStrings();
  var battery = getBatteryLevel(); 

  drawStaticElements();

  drawSeconds(time.seconds);
  drawTime(time.hours, time.minutes);
  drawWeekday(time.weekday);
  drawDate(time.day, time.month);
  drawBatteryStatus(battery);
  drawBtStatus();
  drawBeepStatus();
  drawAlarmStatus();
}

function updateClock() {
  var time = getTimeStrings();
  var battery = getBatteryLevel();

  drawSeconds(time.seconds);
  drawTime(time.hours, time.minutes);
  drawWeekday(time.weekday);
  drawDate(time.day, time.month);
  drawBtStatus();
  drawBeepStatus();
  drawAlarmStatus();
}

function drawStopwatch() {
  var battery = getBatteryLevel();

  var tenmilliseconds = (stopwatch_ticks % 100).toString().padStart(2, '0');
  var seconds = (Math.floor(stopwatch_ticks / 100) % 60).toString().padStart(2, '0');
  var minutes = (Math.floor(stopwatch_ticks / 6000) % 60).toString().padStart(2, '0');
  var hours = (Math.floor(stopwatch_ticks / 360000) % 24).toString(); // Not padded on purpose

  drawStaticElements();
  drawTopLeftText("ST"); // Also static here
  drawTimeDot();

  drawSeconds(tenmilliseconds);
  drawTime(minutes, seconds);
  drawTopRightText(hours + "H");
  drawBatteryStatus(battery);
  drawBtStatus();
  drawBeepStatus();
  drawAlarmStatus();
}

function updateStopwatch() {
  var tenmilliseconds = (stopwatch_ticks % 100).toString().padStart(2, '0');
  var seconds = (Math.floor(stopwatch_ticks / 100) % 60).toString().padStart(2, '0');
  var minutes = (Math.floor(stopwatch_ticks / 6000) % 60).toString().padStart(2, '0');
  var hours = (Math.floor(stopwatch_ticks / 360000) % 24).toString(); // Not padded on purpose

  drawSeconds(tenmilliseconds);
  drawTime(minutes, seconds);
  drawTopRightText(hours + "H");
}

////////////////////////////////////////////////////////////////////////////////////////////
// Globals
////////////////////////////////////////////////////////////////////////////////////////////
var stopwatch_ticks = 0; // ticks of 10 ms
var clockTimer;
var stopwatchTimer;
var tickTimer;

////////////////////////////////////////////////////////////////////////////////////////////
// App script
////////////////////////////////////////////////////////////////////////////////////////////
console.info("Booting...");
// Reset the state of the graphics library
g.reset();
// Clear the screen once, at startup
g.clear();

////////////////////////////////////////////////////////////////////////////////////////////
// Modes and states
////////////////////////////////////////////////////////////////////////////////////////////
class StateMachine {
  constructor(states, initialState) {
    if (!states[initialState]) {
      throw new Error("Initial state must be a valid state");
    }
    this.states = states;
    this.currentState = initialState;

    // Execute entry action of the initial state
    if (this.states[this.currentState].onEntry) {
      this.states[this.currentState].onEntry();
    }
  }

  transition(toState) {
    if (!this.states[toState]) {
      throw new Error(`State "${toState}" does not exist`);
    }

    const current = this.states[this.currentState];
    const next = this.states[toState];

    // Execute exit action of the current state
    if (current.onExit) {
      current.onExit();
    }

    this.currentState = toState;

    // Execute entry action of the next state
    if (next.onEntry) {
      next.onEntry();
    }
  }

  getCurrentState() {
    return this.currentState;
  }
}

// Function to iterate through states in sequence
function createStateCycler(fsm, stateOrder) {
  let currentIndex = stateOrder.indexOf(fsm.currentState);

  return function cycleStates() {
    // Determine the next index
    currentIndex = (currentIndex + 1) % stateOrder.length;

    // Transition to the next state
    fsm.transition(stateOrder[currentIndex]);
  };
}

// Modes
const modes = {
  clock: {
    onEntry: () => {drawClock(); clockTimer = setInterval(() => updateClock(), 1000);},
    onExit: () => clearInterval(clockTimer)
  },
  stopwatch: {
    onEntry: () => {drawStopwatch(); stopwatchTimer = setInterval(() => updateStopwatch(), 50);},
    onExit: () => clearInterval(stopwatchTimer)
  }
};

// Stopwatch states
const stopwatch_states = {
  idle: {
    onEntry: () => stopwatch_ticks = 0,
    onExit: () => {}
  },
  running: {
    onEntry: () => tickTimer = setInterval(() => stopwatch_ticks += 8, 80), // somehow we cant get faster
    onExit: () => clearInterval(tickTimer)
  },
  paused: {
    onEntry: () => {},
    onExit: () => {}
  }
};

const modes_fsm = new StateMachine(modes, "clock");
const stopwatch_fsm = new StateMachine(stopwatch_states, "idle");

// Create a state cycler (modes are switched in the same order each time)
const modeOrder = ["clock", "stopwatch"];
const nextMode = createStateCycler(modes_fsm, modeOrder);

////////////////////////////////////////////////////////////////////////////////////////////
// Events and Callbacks
////////////////////////////////////////////////////////////////////////////////////////////

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    if (modes_fsm.getCurrentState() == "clock") {
      drawClock();
    }
    if (modes_fsm.getCurrentState() == "stopwatch") {
      drawStopwatch();
    }
  }
});

// Handle button presses
function onLongPressedBTN2() {
  console.debug("BTN2 long pressed");
  Bangle.showLauncher();
}

function onShortPressedBTN2() {
  console.debug("BTN2 short pressed");
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);

  // Stopwatch mode
  if (modes_fsm.getCurrentState() == "stopwatch") {
    if (stopwatch_fsm.getCurrentState() == "running") {
      stopwatch_fsm.transition("paused");
    } else {
      stopwatch_fsm.transition("running");
    }
  }
}

function onLongPressedBTN1() {
  console.debug("BTN1 long pressed");
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
}

function onShortPressedBTN1() {
  console.debug("BTN1 short pressed");
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);

  // Stopwatch mode
  if (modes_fsm.getCurrentState() == "stopwatch") {
    if (stopwatch_fsm.getCurrentState() == "paused") {
      stopwatch_fsm.transition("idle");
    }
  }
}

function onLongPressedBTN3() {
  console.debug("BTN3 long pressed");
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
}

function onShortPressedBTN3() {
  console.debug("BTN3 short pressed");
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
  nextMode();
}

let btnState = [{longPressTimer: null, isLongPress: false},{longPressTimer: null, isLongPress: false},{longPressTimer: null, isLongPress: false}];

let btnCallback = [{short: onShortPressedBTN1, long: onLongPressedBTN1},{short: onShortPressedBTN2, long: onLongPressedBTN2},{short: onShortPressedBTN3, long: onLongPressedBTN3}];

function handleRising(btn) {
  btnState[btn].isLongPress = false; // Reset long press state
  btnState[btn].longPressTimer = setTimeout(() => {
    btnState[btn].isLongPress = true; // Mark as long press
    btnCallback[btn].long();  // Trigger long press action
  }, LONG_PRESSED_TIME_MS); // 3 seconds
}

function handleFalling(btn) {
  if (btnState[btn].longPressTimer) {
    clearTimeout(btnState[btn].longPressTimer); // Cancel the long press timer
    btnState[btn].longPressTimer = null;
  }

  if (!btnState[btn].isLongPress) {
    btnCallback[btn].short(); // Trigger short press action
  }
}

// Register all (internal) button callbacks
setWatch(function (e) {
  handleRising(1); // 1 = BTN2
}, BTN2, { edge: "rising", repeat: true, debounce: 50 });

setWatch(function (e) {
  handleFalling(1); // 1 = BTN2
}, BTN2, { edge: "falling", repeat: true, debounce: 50 });

setWatch(function (e) {
  handleRising(0); // 0 = BTN1
}, BTN1, { edge: "rising", repeat: true, debounce: 50 });

setWatch(function (e) {
  handleFalling(0); // 0 = BTN1
}, BTN1, { edge: "falling", repeat: true, debounce: 50 });

setWatch(function (e) {
  handleRising(2); // 2 = BTN3
}, BTN3, { edge: "rising", repeat: true, debounce: 50 });

setWatch(function (e) {
  handleFalling(2); // 2 = BTN3
}, BTN3, { edge: "falling", repeat: true, debounce: 50 });


