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

// Language setting
const Language = {
    ENGLISH: "English",
    GERMAN: "German"
};

const language = Language.GERMAN;

// Button timing
const LONG_PRESSED_TIME_MS = 750;
// Button sounds
const BTN_BEEP_TIME_MS = 80;
const BTN_BEEP_FREQ_HZ = 6000;

// Alarm sounds
const ALARM_BUZZ_COUNT = 3;
const ALARM_BUZZ_TIME_MS = 250;
const ALARM_BUZZ_PAUSE_MS = 1000;
const ALARM_BEEP_FREQ_HZ = 4000;

// Battery
const BATTERY_HIGH = 2;
const BATTERY_MEDIUM = 1;
const BATTERY_LOW = 0;

////////////////////////////////////////////////////////////////////////////////////////////
// Icon images (converted with https://www.espruino.com/Image+Converter)
////////////////////////////////////////////////////////////////////////////////////////////
const bell_icon = E.toArrayBuffer(atob("MDCBAf///////////////////////////////////////////////////D//////+D//////+B///+//+B//98f/4Af/58//gAP/485/AAH+c5x+AAD+c5z+AAB/OZz8AAB/OTn8AAA/OTn8AAA/mTn4AAA/nTn4AAA/nDn4AAA/nDn4AAA/nDn4AAA/nDn4AAA/nTn4AAA/uTn4AAA/OZz4AAA/OZz4AAA/OZx4AAA+c854AAAec8/4AAAf4+fwAAAf5+/wAAAP///gAAAH///AAAAH///AAAAD///AAAAD////////////////////8A//////8B///////D///////////////////////////////////////////////////w=="));

const mute_icon = E.toArrayBuffer(atob("HDCBAf/+f///4////j///+P///4f+f/h/4/+D/B/4H8H/gf4P+A/wf4B/g/gH+D+AP8H5gf4PnA/g+fD/B5+H+Dn8P8Gfw/wZ/j/gn+P/Af8/8B/z/4H/P/wf8//g/z/+D/P/8H8//4Pj//g+f/+Bx//4DP//kH//+Qf//5g/+AnB/gAcH4AB4PAAHwYAAfgAAD+AAAP8QAA/7AAH/8AA//wAH//AA//+AP//w=="));

const beep_icon = E.toArrayBuffer(atob("HDCBAf/+f///4////j///+P///4f///h///+D///4H///gf//+A///4B///gH//+AP//5gf//nA//+fD//5+H//n8P/+fw//5/j//n+P/+f8//5/z//n/P/+f8//5/z//n/P/+f8//5/j//n+f/+fx//5/P//n///+f///5//+An//gAf/4AB//AAH/4AAf/AAD/8AAP/wAA//AAH/8AA//wAH//AA//+AP//w=="));
  
const bt_icon = E.toArrayBuffer(atob("MDCBAf//////////+///////+f//////+P//////+H//////+D//////+B//////+Af/////+AP/////+AH/////+ED/////+GB/////+HA////x+HgP///w+Hwf///weHg////4OHB////8GGD////+CEH/////AAP/////gAf/////wA//////4B//////8D//////8D//////4B//////wA//////gAf/////AAP////+CEH////8GGD////4OHB////weHg////g+Hwf///x+Hgf///7+HA/////+GB/////+ED/////+AH/////+AP/////+Af/////+B//////+D//////+H//////+P//////+f//////+////////////w=="));

const bt_con_icon = E.toArrayBuffer(atob("MDCBAf//////////+///////+f//////+P//////+H//////+D//////+B//////+Af/////+AP/////+AH/////+ED/////+GB/////+HA////x+HgP///w+Hwf///weHg////4OHB////8GGD////+CEH/////AAP/////gAf///7/wA//f/x/4B/+P/g/8D/8H/Af8D/4D/g/4B/8H/x/wA/+P/7/gAf/f///AAP////+CEH////8GGD////4OHB////weHg////g+Hwf///x+Hgf///7+HA/////+GB/////+ED/////+AH/////+AP/////+Af/////+B//////+D//////+H//////+P//////+f//////+////////////w=="));


const charging_icon = 
E.toArrayBuffer(atob("MDCBAf//////////////////////////////////4Af/////wAP/////wAP/////wAP////8AAA////4AAAf///wAAAP///wAAAP///wAAAP///wAAAP///wAAAP///wAAAP///wAAAP///wAQAP///wAQAP///wAwAP///wAwAP///wBwAP///wBwAP///wDwAP///wD/wP///wH/gP///wH/gP///wP/AP///wAPAP///wAOAP///wAOAP///wAMAP///wAMAP///wAIAP///wAIAP///wAAAP///wAAAP///wAAAP///wAAAP///wAAAP///wAAAP///wAAAP///4AAAf///8AAA//////////////////////////////////w=="));


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
    battery = BATTERY_LOW;
  } else if (battery <= 66) {
    battery = BATTERY_MEDIUM;
  } else {
    battery = BATTERY_HIGH;
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
    'beep' : false,
    'quiet': 0
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

function drawDot() {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("7x11Numeric7Seg", 3);
  g.setFontAlign(1, 1, 0); // right, bottom, normal
  g.drawString(".", xmax - margin.right - 42, ymax - margin.bottom - 2.5 * ymax / 10, true);
}

function drawLowerDigits(digits) {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("7x11Numeric7Seg", 3);
  g.setFontAlign(1, 1, 0); // right, bottom, normal
  g.drawString(digits, xmax - margin.right, ymax - margin.bottom - 2.5 * ymax / 10, true);
}

function drawUpperDigits(digits) {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("7x11Numeric7Seg", 5);
  g.setFontAlign(-1, 1, 0); // left, bottom, normal
  g.drawString(digits, xmin + margin.left, ymax - margin.bottom - 2.5 * ymax / 10, true);
}

function drawColon() {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("7x11Numeric7Seg", 5);
  g.setFontAlign(-1, 1, 0); // left, bottom, normal
  g.drawString(":", xmin + margin.left + 70, ymax - margin.bottom - 2.5 * ymax / 10, true); // 70 = two times font width
}

function drawMiddleDigits(digits) {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("7x11Numeric7Seg", 5);
  g.setFontAlign(-1, 1, 0); // left, bottom, normal
  g.drawString(digits, xmin + margin.left + 95, ymax - margin.bottom - 2.5 * ymax / 10, true); // 105 = three times font width
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

function drawTextField(text) {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("Teletext5x9Ascii", 5);
  g.setFontAlign(1, -1, 0); // right, top, normal
  g.drawString(text, center.x - margin.right, ymin + 1.5 * margin.top, true);
}

function drawTextBox(text) {
  g.setColor(0,0,0); // Black
  g.setBgColor(0.9,1,0.9); // Green-Gray
  g.setFont("8x12", 4);
  g.setFontAlign(1, -1, 0); // right, top, normal
  g.drawString(text, xmax - 1.5 * margin.right, ymin + 1.25 * margin.top, true);
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

function drawBtStatus(bt_enabled, bt_connected) {
  g.setColor(0,0,0); // Black
  g.setBgColor(0,0,0); // Black

  if (bt_enabled) {
    if (bt_connected) {
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

function drawBeepStatus(muted) {
  g.setColor(0,0,0); // Black
  g.setBgColor(0,0,0); // Black

  if (!muted) {
    g.drawImage(beep_icon, xmin + margin.left + 24, ymin + 1.5 * margin.top, {scale:0.4});
  } else {
    g.drawImage(mute_icon, xmin + margin.left + 24, ymin + 1.5 * margin.top, {scale:0.4});
  }
}

function drawChargingStatus(charging) {
  g.setColor(0,0,0); // Black
  g.setBgColor(0,0,0); // Black

  if (charging) {
    g.drawImage(charging_icon, xmin + margin.left + 24, ymin + 1.5 * margin.top + 24, {scale:0.4});
  } else {
    g.setColor(0.9,1,0.9); // Green-Gray
    x1 = xmin + margin.left + 24;
    y1 = ymin + 1.5 * margin.top + 24;
    x2 = x1 + 48 * 0.4; // Icon size = 48x48
    y2 = y1 + 48 * 0.4; // Icon size = 48x48
    g.fillRect(x1, y1, x2, y2);
  }
}

function drawAlarmStatus(alarm) {
  g.setColor(0,0,0); // Black
  g.setBgColor(0,0,0); // Black

  if (alarm) {
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

/*

function setCountdownValues() {
  var seconds = (countdownValue % 60).toString().padStart(2, '0');
  var minutes = (Math.floor(countdownValue / 60) % 60).toString().padStart(2, '0');

  renderedWatchState.textField.text = "CT";
  // ...
}

function updateCountdownValues() {
  var seconds = (countdownValue % 60).toString().padStart(2, '0');
  var minutes = (Math.floor(countdownValue / 60) % 60).toString().padStart(2, '0');

  renderedWatchState.upperDigits.value = minutes;
  renderedWatchState.middleDigits.value = seconds;
}

*/

function renderUi(watchState) {
  drawStaticElements();
  drawBatteryStatus(watchState.battery);
}

function renderSlowContents(watchState) {
  drawMiddleDigits(watchState.middleDigits.value);
  drawUpperDigits(watchState.upperDigits.value);
  drawTextField(watchState.textField.text);
  drawTextBox(watchState.textBox.text);
  drawBtStatus(watchState.bluetooth.enabled, watchState.bluetooth.connected);
  drawBeepStatus(watchState.muted);
  drawAlarmStatus(watchState.alarm);
  drawChargingStatus(watchState.charging);
  if (watchState.dividers.dot) drawDot();
  if (watchState.dividers.colon) drawColon();
}

function renderFastContents(watchState) {
  drawLowerDigits(watchState.lowerDigits.value); // used for milliseconds

}

////////////////////////////////////////////////////////////////////////////////////////////
// Contents to be rendered
////////////////////////////////////////////////////////////////////////////////////////////

// State to be rendered
var renderedWatchState = {
  dividers: {
    colon: true,
    dot: false
  },
  upperDigits: {
    value: "00",
    highlighted: false
  },
  middleDigits: {
    value: "00",
    highlighted: false
  },
  lowerDigits: {
    value: "00",
    highlighted: false
  },
  textField: {
    text: "SO",
    highlighted: false
  },
  textBox: {
    text: " 1. 1",
    highlighted: false
  },
  bluetooth: {
    enabled: false,
    connected: false
  },
  charging: false,
  muted: false,
  alarm: false,
  battery: BATTERY_HIGH
};

// Update for clock mode
function updateClock() {
  var time = getTimeStrings();

  renderedWatchState.dividers.colon = true;
  renderedWatchState.dividers.dot = false;
  renderedWatchState.upperDigits.value = time.hours;
  renderedWatchState.middleDigits.value = time.minutes;
  renderedWatchState.lowerDigits.value = time.seconds;
  renderedWatchState.textField.text = time.weekday;
  renderedWatchState.textBox.text = time.day + "." + time.month.padStart(2, ' ');
}

// Update for stopwatch mode
function updateStopwatch(elapsedTenMilliseconds) {
  var tenmilliseconds = (elapsedTenMilliseconds % 100).toString().padStart(2, '0');
  var seconds = (Math.floor(elapsedTenMilliseconds / 100) % 60).toString().padStart(2, '0');
  var minutes = (Math.floor(elapsedTenMilliseconds / 6000) % 60).toString().padStart(2, '0');
  var hours = (Math.floor(elapsedTenMilliseconds / 360000) % 24).toString(); // Not padded on purpose

  renderedWatchState.dividers.colon = true;
  renderedWatchState.dividers.dot = true;
  renderedWatchState.lowerDigits.value = tenmilliseconds;
  renderedWatchState.middleDigits.value = seconds;
  renderedWatchState.upperDigits.value = minutes;
  renderedWatchState.textField.text = "ST";
  renderedWatchState.textBox.text = hours + "H";
}

/*
// Update for timer mode
function updateTimer(timeLeft) {
  var seconds = (timeLeft % 60).toString().padStart(2, '0');
  var minutes = (Math.floor(timeLeft / 60) % 60).toString().padStart(2, '0');

  renderedWatchState.dividers.colon = true;
  renderedWatchState.dividers.dot = false;
  renderedWatchState.lowerDigits.value = "";
  renderedWatchState.middleDigits.value = seconds;
  renderedWatchState.upperDigits.value = minutes;
  renderedWatchState.textField.text = "TR";
  renderedWatchState.textBox.text = "";
}
*/

// General system updates
function updateSystemStatus() {
  renderedWatchState.battery = getBatteryLevel();
  renderedWatchState.muted = !setting("beep");
  renderedWatchState.bluetooth.enabled = setting("ble");
  if (renderedWatchState.bluetooth.enabled) {
    renderedWatchState.bluetooth.connected = NRF.getSecurityStatus().connected;
  }
  renderedWatchState.alarm = alarmIsSet();
  renderedWatchState.charging = Bangle.isCharging();
}

// Buzz on charging event
Bangle.on('charging', charging => { if (charging) Bangle.buzz(); });

////////////////////////////////////////////////////////////////////////////////////////////
// Modes
////////////////////////////////////////////////////////////////////////////////////////////
const modes = [
  {
    clock: {
      defaultState: "running",
      update: () => updateClock(),
      callbacks: {
        running: {
          BTN1: {
            short: () => {},
            long: () => {}
          },
          BTN2: {
            short: () => {},
            long: () => Bangle.showLauncher()
          },
          BTN3: {
            short: () => nextMode(),
            long: () => {}
          }
        }
      }
    }
  },
  {
    stopwatch: {
      defaultState: "idle",
      update: () => updateStopwatch(stopwatchTicks),
      callbacks: {
        idle: {
          BTN2: {
            short: () => {currentModeState = "running"; stopWatchTimer = setInterval(() => { stopwatchTicks+=8; updateStopwatch(stopwatchTicks);}, 80);},
            long: () => Bangle.showLauncher()
          },
          BTN1: {
            short: () => {},
            long: () => {}
          },
          BTN3: {
            short: () => nextMode(),
            long: () => {}
          }
        },
        paused: {
          BTN2: {
            short: () => {currentModeState = "running"; stopWatchTimer = setInterval(() => { stopwatchTicks+=8; updateStopwatch(stopwatchTicks);}, 80);},
            long: () => Bangle.showLauncher()
          },
          BTN1: {
            short: () => { stopwatchTicks = 0; currentModeState = "idle"; updateStopwatch(stopwatchTicks);},
            long: () => {}
          },
          BTN3: {
            short: () => nextMode(),
            long: () => {}
          }
        },
        running: {
          BTN2: {
            short: () => {currentModeState = "paused"; clearInterval(stopWatchTimer);},
            long: () => Bangle.showLauncher()
          },
          BTN1: {
            short: () => {},
            long: () => {}
          },
          BTN3: {
            short: () => nextMode(),
            long: () => {}
          }
        }
      }
    }
  }/*,
  {
    timer: {
      defaultState: "idle",
      update: () => updateTimer(timerValue),
      callbacks: {
        idle: {
          BTN2: {
            short: () => {currentModeState = "running"; timerTimer = setInterval(() => { timerValue-=1; updateTimer(timerValue);}, 1000);},
            long: () => Bangle.showLauncher()
          },
          BTN1: {
            short: () => {},
            long: () => {}
          },
          BTN3: {
            short: () => nextMode(),
            long: () => {}
          }
        },
        paused: {
          BTN2: {
            short: () => {currentModeState = "running"; timerTimer = setInterval(() => { timerValue-=1; updateTimer(timerValue);}, 1000);},
            long: () => Bangle.showLauncher()
          },
          BTN1: {
            short: () => { timerValue = timerStartValue; currentModeState = "idle"; updateTimer(timerValue);},
            long: () => {}
          },
          BTN3: {
            short: () => nextMode(),
            long: () => {}
          }
        },
        running: {
          BTN2: {
            short: () => {currentModeState = "paused"; clearInterval(timerTimer);},
            long: () => Bangle.showLauncher()
          },
          BTN1: {
            short: () => {},
            long: () => {}
          },
          BTN3: {
            short: () => nextMode(),
            long: () => {}
          }
        }
      }
    }
  }*/
];

function getIndexByMode(mode) {
  return modes.findIndex(m => Object.keys(m)[0] === mode);
}

function getModeByIndex(index) {
  return Object.keys(modes[new_index])[0];
}

function getDefaultState(mode) {
  return modes.find(m => m[mode])[mode].defaultState;
}

function getCallbacks(mode) {
  return modes.find(m => m[mode])[mode].callbacks;
}

function getUpdate(mode) {
  return modes.find(m => m[mode])[mode].update;
}

var currentMode = "clock"; // initial mode
var currentModeState = getDefaultState(currentMode); // initial state of initial mode

function nextMode() {
  index = getIndexByMode(currentMode);
  new_index = (index + 1) % modes.length;

  currentMode = getModeByIndex(new_index);
  currentModeState = getDefaultState(currentMode);

  // Immediate update and render
  updateSystemStatus();
  getUpdate(currentMode)();
  renderUi(renderedWatchState);
  renderSlowContents(renderedWatchState);
  renderFastContents(renderedWatchState);
}

////////////////////////////////////////////////////////////////////////////////////////////
// App script
////////////////////////////////////////////////////////////////////////////////////////////
console.info("Booting...");
console.info("Free memory: " + require("Storage").getFree().toString());
// Reset the state of the graphics library
g.reset();
// Clear the screen once, at startup
g.clear();
// Initial rendering
updateSystemStatus();
getUpdate(currentMode)();
renderUi(renderedWatchState);
renderSlowContents(renderedWatchState);
renderFastContents(renderedWatchState);

////////////////////////////////////////////////////////////////////////////////////////////
// Rendering intervals
////////////////////////////////////////////////////////////////////////////////////////////

setInterval(() => renderFastContents(renderedWatchState), 250);
setInterval(() => {if (currentMode == "clock") updateClock(); updateSystemStatus(); renderSlowContents(renderedWatchState);}, 500);

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on =>{
  if (on) {
    updateSystemStatus();
    getUpdate(currentMode);
    renderUi(renderedWatchState);
    renderSlowContents(renderedWatchState);
    renderFastContents(renderedWatchState);
  }
});

////////////////////////////////////////////////////////////////////////////////////////////
// Handle stopwatch
////////////////////////////////////////////////////////////////////////////////////////////
var stopwatchTimer;
var stopwatchTicks = 0; // 10 ms per tick


////////////////////////////////////////////////////////////////////////////////////////////
// Countdown timer utilities
//////////////////////////////////////////////////////////////////////////////////////////// 
/*
var timerTimer;
var timerStartValue = 120; // in Seconds
var timerValue = timerStartValue; // in Seconds
*/

/*
function evaluateCountdowntimer() {
  if (countdownValue == 0) {
    console.info("Timer expired!");
    countdown_fsm.transition("beeping");
  }
}

function alarm() {
  var buzzCount = ALARM_BUZZ_COUNT;
  function buzz() {
    if (setting('quiet')>1) return; // total silence, not even buzzing
    Bangle.buzz(ALARM_BUZZ_TIME_MS).then(()=>{
      setTimeout(()=>{
        Bangle.beep(ALARM_BUZZ_TIME_MS, ALARM_BEEP_FREQ_HZ);
        Bangle.buzz(ALARM_BUZZ_TIME_MS).then(function() {
          if (buzzCount--) setTimeout(buzz, ALARM_BUZZ_PAUSE_MS);
        });
      },100);
    });
  }
  buzz();
  countdown_fsm.transistion("idle");
}
*/

////////////////////////////////////////////////////////////////////////////////////////////
// Events and Callbacks
////////////////////////////////////////////////////////////////////////////////////////////

// Handle button presses
function onLongPressedBTN2() {
  console.debug("BTN2 long pressed");
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
  getCallbacks(currentMode)[currentModeState].BTN2.long();
}

function onShortPressedBTN2() {
  console.debug("BTN2 short pressed");
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
  getCallbacks(currentMode)[currentModeState].BTN2.short();
}

function onLongPressedBTN1() {
  console.debug("BTN1 long pressed");
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
  getCallbacks(currentMode)[currentModeState].BTN1.long();
}

function onShortPressedBTN1() {
  console.debug("BTN1 short pressed");
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
  getCallbacks(currentMode)[currentModeState].BTN1.short();
}

function onLongPressedBTN3() {
  console.debug("BTN3 long pressed");
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
  getCallbacks(currentMode)[currentModeState].BTN3.long();
}

function onShortPressedBTN3() {
  console.debug("BTN3 short pressed");
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
  getCallbacks(currentMode)[currentModeState].BTN3.short();
}

let btnState = [{longPressTimer: null, isLongPress: false},{longPressTimer: null, isLongPress: false},{longPressTimer: null, isLongPress: false}];

let btnCallback = [{short: onShortPressedBTN1, long: onLongPressedBTN1},{short: onShortPressedBTN2, long: onLongPressedBTN2},{short: onShortPressedBTN3, long: onLongPressedBTN3}];

function handleRising(btn) {
  btnCallback[btn].short(); // Trigger short press action immediately
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
