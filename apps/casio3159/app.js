////////////////////////////////////////////////////////////////////////////////////////////
// Fonts
////////////////////////////////////////////////////////////////////////////////////////////
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

// Memory logging
const LOGGING_ENABLED = false;

// Interval of main timer
const MAIN_INTERVAL_MS = 250;

// Timer Mode
const MAX_TIMER_START_VALUE = (100 * 60 * 60) - 1;

// Stopwatch Mode
const MAX_STOPWATCH_TICK = (9 * 60 * 60 * 100) - 1;
const STOPWATCH_INTERVAL_MS = 80;
const MS_PER_TICK = 10;

// Save state
const SAVE_FILE = "casiostate.json";

// Colors
const BLACK = {r:0,g:0,b:0};
const LIGHT_GRAY = {r:0.9,g:1,b:0.9};
const BLUE = {r:0.3,g:0.9,b:1};
const TURKISH = {r:0.1,g:1,b:0.8};
const YELLOW = {r:1,g:0.8,b:0.1};
const RED = {r:1,g:0.2,b:0.5};

const STYLES = [
  {bg: LIGHT_GRAY, fg: BLACK},
  {bg: BLUE, fg: BLACK},
  {bg: TURKISH, fg: BLACK},
  {bg: YELLOW, fg: BLACK},
  {bg: RED, fg: BLACK},
  {bg: BLACK, fg: LIGHT_GRAY},
];

const TIMEZONES = [
  { shortName: "UTC", offset: 0 },     // Coordinated Universal Time
  { shortName: "NY", offset: -5 },    // New York (Eastern Time, no DST considered here)
  { shortName: "LA", offset: -8 },    // Los Angeles (Pacific Time)
  { shortName: "LDN", offset: 0 },    // London (GMT)
  { shortName: "PAR", offset: 1 },    // Paris (CET)
  { shortName: "BER", offset: 1 },    // Berlin (CET)
  { shortName: "DEL", offset: 5.5 },  // Delhi (IST)
  { shortName: "TKY", offset: 9 },    // Tokyo (JST)
  { shortName: "SYD", offset: 11 },   // Sydney (AEDT)
  { shortName: "RIO", offset: -3 },   // Rio de Janeiro (BRT)
  { shortName: "JHB", offset: 2 },    // Johannesburg (SAST)
  { shortName: "DXB", offset: 4 },    // Dubai (GST)
  { shortName: "HKG", offset: 8 },    // Hong Kong (HKT)
  { shortName: "SIN", offset: 8 },    // Singapore (SGT)
  { shortName: "BKK", offset: 7 },    // Bangkok (ICT)
  { shortName: "MEX", offset: -6 },   // Mexico City (CST)
  { shortName: "CAI", offset: 2 },    // Cairo (EET)
  { shortName: "IST", offset: 3 },    // Istanbul (TRT)
];

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

function loadIcon(filename) {
  return E.toArrayBuffer(atob(require('Storage').read(filename)));
}

////////////////////////////////////////////////////////////////////////////////////////////
// System parameter getters
////////////////////////////////////////////////////////////////////////////////////////////
function getUtcTimeStrings(offset) {
  // Get current offset to UTC
  let now = new Date();
  let systemOffset = now.getTimezoneOffset(); // in minutes
  let targetOffset = offset * 60; // in minutes

  let realOffset = systemOffset + targetOffset; // in minutes
  let isNegative = (realOffset < 0);

  let minutesOffset = Math.abs(realOffset) % 60;
  if (isNegative) minutesOffset = minutesOffset * -1;

  let resultMinutes = now.getMinutes() + minutesOffset;
  let hoursOverrun = 0;
  if (resultMinutes < 0) {
    hoursOverrun = -1;
  } else if (resultMinutes >= 60) {
    hoursOverrun = 1;
  }
  resultMinutes = Math.abs(resultMinutes) % 60;

  let hoursOffset = Math.floor(Math.abs(realOffset / 60));
  if (isNegative) hoursOffset = hoursOffset * -1;

  let resultHours = (24 + now.getHours() + hoursOverrun + hoursOffset) % 24;

  // Get UTC+X hours, minutes, and seconds
  let hours = resultHours.toString().padStart(2, '0'); // Hours (0-23)
  let minutes = resultMinutes.toString().padStart(2, '0'); // Minutes (0-59)
  let seconds = now.getSeconds().toString().padStart(2, '0'); // Seconds (0-59)

  return {hours: hours, minutes: minutes, seconds: seconds};
}


function getTimeStrings() {
  // Get the current date and time
  let now = new Date();

  // Extract parts of the date and time
  let hours = now.getHours().toString().padStart(2, '0'); // Hours (0-23)
  let minutes = now.getMinutes().toString().padStart(2, '0'); // Minutes (0-59)
  let seconds = now.getSeconds().toString().padStart(2, '0'); // Seconds (0-59)
  let day = now.getDate().toString(); // Day of the month (1-31)
  let month = (now.getMonth() + 1).toString(); // Month (1-12)
  let weekday = now.getDay(); // Weekday (0-6, Sunday = 0)
  let year = now.getFullYear().toString();

  // Convert weekday to a two-character string
  let weekdays_english = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  let weekdays_german = ["SO", "MO", "DI", "MI", "DO", "FR", "SA"];

  if (language == "German") {
    weekday = weekdays_german[weekday];
  } else {
    weekday = weekdays_english[weekday];
  }

  return {year: year, hours: hours, minutes: minutes, seconds: seconds, day: day, month: month, weekday: weekday};
}

function getBatteryLevel() {
  let battery = E.getBattery();

  if (battery <= 33) {
    battery = BATTERY_LOW;
  } else if (battery <= 66) {
    battery = BATTERY_MEDIUM;
  } else {
    battery = BATTERY_HIGH;
  }

  return battery;
}

function alarmIsSet() {
  return (storage.readJSON('sched.json',1)||[]).some(alarm=>alarm.on);
}

////////////////////////////////////////////////////////////////////////////////////////////
// Colors and styles
////////////////////////////////////////////////////////////////////////////////////////////
// Could be changed for customization
let fgColor = BLACK;  // Default
let bgColor = LIGHT_GRAY;  // Default
let currentStyle = 0; // Default

function setStyle(index) {
 fgColor = STYLES[index].fg;
 bgColor = STYLES[index].bg;
}

function nextStyle() {
  currentStyle = (currentStyle + 1) % STYLES.length;
  setStyle(currentStyle);
}

function setColor(g, color) {
  g.setColor(color.r, color.g, color.b);
  return g;
}

function setBgColor(g, color) {
  g.setBgColor(color.r, color.g, color.b);
  return g;
}

////////////////////////////////////////////////////////////////////////////////////////////
// Drawing functions
////////////////////////////////////////////////////////////////////////////////////////////
function drawSmallDot() {
  setColor(g, fgColor);
  setBgColor(g, bgColor);
  g.setFont("7x11Numeric7Seg", 3);
  g.setFontAlign(1, 1, 0); // right, bottom, normal
  g.drawString(".", xmax - margin.right - 42, ymax - margin.bottom - 2.5 * ymax / 10, true);
}

function drawLowerDigits(digits) {
  setColor(g, fgColor);
  setBgColor(g, bgColor);
  g.setFont("7x11Numeric7Seg", 3);
  g.setFontAlign(1, 1, 0); // right, bottom, normal
  g.drawString(digits, xmax - margin.right, ymax - margin.bottom - 2.5 * ymax / 10, true);
}

function drawUpperDigits(digits) {
  setColor(g, fgColor);
  setBgColor(g, bgColor);
  g.setFont("7x11Numeric7Seg", 5);
  g.setFontAlign(-1, 1, 0); // left, bottom, normal
  g.drawString(digits, xmin + margin.left, ymax - margin.bottom - 2.5 * ymax / 10, true);
}

function drawColon() {
  setColor(g, fgColor);
  setBgColor(g, bgColor);
  g.setFont("7x11Numeric7Seg", 5);
  g.setFontAlign(-1, 1, 0); // left, bottom, normal
  g.drawString(":", xmin + margin.left + 70, ymax - margin.bottom - 2.5 * ymax / 10, true); // 70 = two times font width
}

function drawDot() {
  setColor(g, fgColor);
  setBgColor(g, bgColor);
  g.setFont("7x11Numeric7Seg", 5);
  g.setFontAlign(-1, 1, 0); // left, bottom, normal
  g.drawString(".", xmin + margin.left + 70, ymax - margin.bottom - 2.5 * ymax / 10, true); // 70 = two times font width
}

function drawMiddleDigits(digits) {
  setColor(g, fgColor);
  setBgColor(g, bgColor);
  g.setFont("7x11Numeric7Seg", 5);
  g.setFontAlign(-1, 1, 0); // left, bottom, normal
  g.drawString(digits, xmin + margin.left + 95, ymax - margin.bottom - 2.5 * ymax / 10, true); // 105 = three times font width
}

function drawBatteryLevels() {
  setColor(g, fgColor);
  setBgColor(g, bgColor);
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
  // Draw Background Color
  setColor(g, bgColor);
  g.fillRect(xmin, ymin + margin.top - 4, xmax, ymax);

  // Draw UI Borders
  setColor(g, fgColor); // Black

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
  setColor(g, fgColor);
  setBgColor(g, bgColor);
  g.setFont("Teletext5x9Ascii", 5);
  g.setFontAlign(1, -1, 0); // right, top, normal
  g.drawString(text, center.x - margin.right, ymin + 1.5 * margin.top, true);
}

function drawTextBox(text) {
  setColor(g, fgColor);
  setBgColor(g, bgColor);
  g.setFont("8x12", 4);
  g.setFontAlign(1, -1, 0); // right, top, normal
  g.drawString(text, xmax - 1.5 * margin.right, ymin + 1.25 * margin.top, true);
}

function clearBatteryStatus() {
  let battery_status = {width: center.x - 2 * margin.left, x: center.x + margin.left};

  setColor(g, bgColor);

  for (let battery = 0; battery <= 2; battery++) {
    let battery_bar = {x1: battery_status.x + battery * battery_status.width / 3, y1: ymax - ymax / 10 + 2 * margin.bottom, x2: battery_status.x + (battery + 1) * battery_status.width / 3, y2: ymax - 2 * margin.bottom};
    g.fillRect(battery_bar.x1, battery_bar.y1, battery_bar.x2, battery_bar.y2);
  }
}

function drawBatteryBar(battery) {
  // Draw new bar
  setColor(g, fgColor);

  let battery_bar = {x1: battery_status.x + battery * battery_status.width / 3, y1: ymax - ymax / 10 + 2 * margin.bottom, x2: battery_status.x + (battery + 1) * battery_status.width / 3, y2: ymax - 2 * margin.bottom};
  g.fillRect(battery_bar.x1, battery_bar.y1, battery_bar.x2, battery_bar.y2);
}

function drawBatteryStatus(battery) {
  let battery_status = {width: center.x - 2 * margin.left, x: center.x + margin.left};

  clearBatteryStatus();
  drawBatteryBar(battery);
}

function drawBtStatus(bt_enabled, bt_connected) {
  setColor(g, fgColor);
  setBgColor(g, fgColor);

  if (bt_enabled) {
    if (bt_connected) {
      bt_con_icon = loadIcon("bt_con.icon");
      g.drawImage(bt_con_icon, xmin + margin.left, ymin + 1.5 * margin.top, {scale:0.4});
    } else {
      bt_icon = loadIcon("bt_en.icon");
      g.drawImage(bt_icon, xmin + margin.left, ymin + 1.5 * margin.top, {scale:0.4});
    }
  } else {
    setColor(g, bgColor);
    x1 = xmin + margin.left;
    y1 = ymin + 1.5 * margin.top;
    x2 = x1 + 48 * 0.4; // Icon size = 48x48
    y2 = y1 + 48 * 0.4; // Icon size = 48x48
    g.fillRect(x1, y1, x2, y2);
  }
}

function drawBeepStatus(muted) {
  setColor(g, fgColor);
  setBgColor(g, fgColor);

  if (!muted) {
    beep_icon = loadIcon("beep.icon");
    g.drawImage(beep_icon, xmin + margin.left + 24, ymin + 1.5 * margin.top, {scale:0.4});
  } else {
    mute_icon = loadIcon("muted.icon");
    g.drawImage(mute_icon, xmin + margin.left + 24, ymin + 1.5 * margin.top, {scale:0.4});
  }
}

function drawChargingStatus(charging) {
  setColor(g, fgColor);
  setBgColor(g, fgColor);

  if (charging) {
    charging_icon = loadIcon("charging.icon");
    g.drawImage(charging_icon, xmin + margin.left + 24, ymin + 1.5 * margin.top + 24, {scale:0.4});
  } else {
    setColor(g, bgColor);
    x1 = xmin + margin.left + 24;
    y1 = ymin + 1.5 * margin.top + 24;
    x2 = x1 + 48 * 0.4; // Icon size = 48x48
    y2 = y1 + 48 * 0.4; // Icon size = 48x48
    g.fillRect(x1, y1, x2, y2);
  }
}

function drawAlarmStatus(alarm) {
  setColor(g, fgColor);
  setBgColor(g, fgColor);

  if (alarm) {
    bell_icon = loadIcon("bell.icon");
    g.drawImage(bell_icon, xmin + margin.left, ymin + 1.5 * margin.top + 24, {scale:0.4});
  } else {
    setColor(g, bgColor);
    x1 = xmin + margin.left;
    y1 = ymin + 1.5 * margin.top + 24;
    x2 = x1 + 48 * 0.4; // Icon size = 48x48
    y2 = y1 + 48 * 0.4; // Icon size = 48x48
    g.fillRect(x1, y1, x2, y2);
  }
}

function drawCalendarWeek(clear) {
  setColor(g, fgColor);
  setBgColor(g, bgColor);

  g.setFont("Teletext5x9Ascii", 2);
  g.setFontAlign(1, 1, 0); // right, bottom, normal
  x = xmax - margin.right - 7;
  y = ymax - margin.bottom - 2.5 * ymax / 10 - 33;

  // Language
  cwString = "CW";
  if (language == "German") {
    cwString = "KW";
  }

  // Draw
  if (clear) {
  g.drawString("  ", x, y, true);
  } else {
  g.drawString(cwString, x, y, true);
  }
}

function renderUi(watchState) {
  drawStaticElements();
  drawBatteryStatus(watchState.battery);
}

function renderSlowContents(watchState, showHighlighted) {
  upperDigits = "  ";
  middleDigits = "  ";
  textField = "  ";
  textBox = "    ";

  // Evaluate blinking elements
  if ((watchState.upperDigits.highlighted && showHighlighted) || !watchState.upperDigits.highlighted) {
    upperDigits = watchState.upperDigits.value;
  }

  if ((watchState.middleDigits.highlighted && showHighlighted) || !watchState.middleDigits.highlighted) {
    middleDigits = watchState.middleDigits.value;
  }

  if ((watchState.textBox.highlighted && showHighlighted) || !watchState.textBox.highlighted) {
    textBox = watchState.textBox.text;
  }

  if ((watchState.textField.highlighted && showHighlighted) || !watchState.textField.highlighted) {
    textField = watchState.textField.text;
  }

  drawCalendarWeek(!watchState.cw);
  drawMiddleDigits(middleDigits);
  drawUpperDigits(upperDigits);
  drawTextField(textField);
  drawTextBox(textBox);
  drawBtStatus(watchState.bluetooth.enabled, watchState.bluetooth.connected);
  drawBeepStatus(watchState.muted);
  drawAlarmStatus(watchState.alarm);
  drawChargingStatus(watchState.charging);
  if (watchState.dividers.dot) drawDot();
  if (watchState.dividers.smallDot) drawSmallDot();
  if (watchState.dividers.colon) drawColon();
}

function renderFastContents(watchState, showHighlighted) {
  lowerDigits = "  ";

  if ((watchState.lowerDigits.highlighted && showHighlighted) || !watchState.lowerDigits.highlighted) { 
    lowerDigits = watchState.lowerDigits.value;
  }

  drawLowerDigits(lowerDigits); // used for milliseconds

}

function renderAll(watchState, showHighlighted) {
  renderUi(watchState);
  renderSlowContents(watchState, showHighlighted);
  renderFastContents(watchState, showHighlighted);
}

////////////////////////////////////////////////////////////////////////////////////////////
// Contents to be rendered
////////////////////////////////////////////////////////////////////////////////////////////
let showHighlighted = true;

// State to be rendered
let renderedWatchState = {
  cw: false,
  dividers: {
    colon: true,
    smallDot: false,
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
  let time = getTimeStrings();

  renderedWatchState.cw = false;
  renderedWatchState.dividers.colon = true;
  renderedWatchState.dividers.dot = false;
  renderedWatchState.dividers.smallDot = false;
  renderedWatchState.upperDigits.value = time.hours;
  renderedWatchState.middleDigits.value = time.minutes;
  renderedWatchState.lowerDigits.value = time.seconds;
  renderedWatchState.textField.text = time.weekday;
  renderedWatchState.textBox.text = time.day + "." + time.month.padStart(2, ' ');
}

// Update for clock mode
function updateWorldTime(tz) {
  let utcTime = getUtcTimeStrings(tz.offset);

  renderedWatchState.cw = false;
  renderedWatchState.dividers.colon = true;
  renderedWatchState.dividers.dot = false;
  renderedWatchState.dividers.smallDot = false;
  renderedWatchState.upperDigits.value = utcTime.hours;
  renderedWatchState.middleDigits.value = utcTime.minutes;
  renderedWatchState.lowerDigits.value = utcTime.seconds;
  renderedWatchState.textField.text = "WT";
  renderedWatchState.textBox.text = tz.shortName;
}

// Update for calendar mode
function updateCalendar() {
  let time = getTimeStrings();
  let now = new Date();

  renderedWatchState.cw = true;
  renderedWatchState.dividers.colon = false;
  renderedWatchState.dividers.dot = true;
  renderedWatchState.dividers.smallDot = false;
  renderedWatchState.lowerDigits.value = getWeekNumber(now).toString().padStart(2, '0');
  renderedWatchState.upperDigits.value = time.day;
  renderedWatchState.middleDigits.value = time.month.padStart(2, '0');
  renderedWatchState.textField.text = time.weekday;
  renderedWatchState.textBox.text = time.year;
}

// Update for stopwatch mode
function updateStopwatch(elapsedTenMilliseconds) {
  let tenmilliseconds = (elapsedTenMilliseconds % 100).toString().padStart(2, '0');
  let seconds = (Math.floor(elapsedTenMilliseconds / 100) % 60).toString().padStart(2, '0');
  let minutes = (Math.floor(elapsedTenMilliseconds / 6000) % 60).toString().padStart(2, '0');
  let hours = (Math.floor(elapsedTenMilliseconds / 360000) % 24).toString(); // Not padded on purpose

  renderedWatchState.cw = false;
  renderedWatchState.dividers.colon = true;
  renderedWatchState.dividers.dot = false;
  renderedWatchState.dividers.smallDot = true;
  renderedWatchState.lowerDigits.value = tenmilliseconds;
  renderedWatchState.middleDigits.value = seconds;
  renderedWatchState.upperDigits.value = minutes;
  renderedWatchState.textField.text = "ST";
  renderedWatchState.textBox.text = hours + "H";
}

// Update for timer mode
function updateTimer(timeLeft) {
  let seconds = (timeLeft % 60).toString().padStart(2, '0');
  let minutes = (Math.floor(timeLeft / 60) % 60).toString().padStart(2, '0');
  let hours = (Math.floor(timeLeft / 3600) % 100).toString().padStart(2, '0');
  let time = getTimeStrings();

  renderedWatchState.cw = false;
  renderedWatchState.dividers.colon = true;
  renderedWatchState.dividers.dot = false;
  renderedWatchState.dividers.smallDot = false;
  renderedWatchState.lowerDigits.value = seconds;
  renderedWatchState.middleDigits.value = minutes;
  renderedWatchState.upperDigits.value = hours;
  renderedWatchState.textField.text = "TR";
  renderedWatchState.textBox.text = time.hours + ":" + time.minutes;
}

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
const modes = [];

function getIndexByMode(modeName) {
  return modes.findIndex(m => m.modeName === modeName);
}

function getModeByIndex(index) {
  return modes[index].modeName;
}

function getDefaultState(mode) {
  return modes.find(m => m.modeName === mode).defaultState;
}

function getCallbacks(mode) {
  return modes.find(m => m.modeName === mode).callbacks;
}

function getUpdate(mode) {
  return modes.find(m => m.modeName === mode).update;
}

function nextMode() {
  index = getIndexByMode(currentMode);
  new_index = (index + 1) % modes.length;

  currentMode = getModeByIndex(new_index);
  currentModeState = getDefaultState(currentMode);

  // Immediate update and render
  updateSystemStatus();
  getUpdate(currentMode)();
  renderUi(renderedWatchState);
  renderSlowContents(renderedWatchState, showHighlighted);
  renderFastContents(renderedWatchState, showHighlighted);
}

////////////////////////////////////////////////////////////////////////////////////////////
// Save state
////////////////////////////////////////////////////////////////////////////////////////////

function saveValue(key, value) {
  let data = loadAllValues(); // Load existing data
  data[key] = value; // Add or update the key-value pair
  require("Storage").write(SAVE_FILE, JSON.stringify(data));
}

function loadAllValues() {
  const fileContents = require("Storage").read(SAVE_FILE);
  if (fileContents) {
    try {
      const data = JSON.parse(fileContents);
      return data;
    } catch (error) {
    }
  }
  return {}; // Return an empty object if the file doesn't exist or is invalid
}

function initializeLoadedValues() {
  let data = loadAllValues();

  // Check if the key exists before initializing
  if ("timerStartValue" in data) {
    timerStartValue = data.timerStartValue;
    timerValue = timerStartValue;
  }
  if ("currentStyle" in data) {
    currentStyle = data.currentStyle;
    if (currentStyle >= STYLES.length) {
      // Corrupt data
      currentStyle = 0;
    }
    setStyle(currentStyle);
  }
  if ("currentTimeZone" in data) {
    currentTimeZone = data.currentTimeZone;
    if (currentTimeZone >= TIMEZONES.length) {
      // Corrupt data
      currentTimeZone = 0;
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////////////
// Logging
////////////////////////////////////////////////////////////////////////////////////////////
function logFlashStats() {
  const files = require("Storage").list();
  let usedSpace = 0;

  files.forEach(file => {
    const size = require("Storage").read(file).length;
    usedSpace += size;
  });

  const freeSpace = require("Storage").getFree();
  const totalFlash = usedSpace + freeSpace;

  console.log(`- Total: ${totalFlash} bytes`);
  console.log(`- Used: ${usedSpace} bytes`);
  console.log(`- Free: ${freeSpace} bytes`);

  return totalFlash;
}

function logSystemState() {
  // Log current RAM usage
  const memory = process.memory();
  console.log(`RAM Usage:`);
  console.log(`- Total: ${memory.total} bytes`);
  console.log(`- Used: ${memory.total - memory.free} bytes`);
  console.log(`- Free: ${memory.free} bytes`);

  // Log current Flash usage
  console.log(`Flash Usage:`);
  logFlashStats();


  // Optional: Log the current time for periodic state tracking
  console.log(`- Current Time: ${new Date().toISOString()}`);
}

////////////////////////////////////////////////////////////////////////////////////////////
// Handle clock mode
////////////////////////////////////////////////////////////////////////////////////////////
let clockMode =
{
  modeName: "clock",
  defaultState: "running",
  update: () => updateClock(),
  callbacks: {
    running: {
      BTN1_short: () => {nextStyle(); saveValue("currentStyle", currentStyle); renderAll(renderedWatchState, showHighlighted);},
      BTN1_long: () => {},
      BTN2_short: () => {},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => nextMode(),
      BTN3_long: () => {}
    }
  }
};

modes.push(clockMode);

////////////////////////////////////////////////////////////////////////////////////////////
// Handle world time mode
////////////////////////////////////////////////////////////////////////////////////////////
let currentTimeZone = 0; // UTC

function nextTimeZone() {
  currentTimeZone = (currentTimeZone + 1) % TIMEZONES.length;
}

let worldTimeMode =
{
  modeName: "worldTime",
  defaultState: "running",
  update: () => updateWorldTime(TIMEZONES[currentTimeZone]),
  callbacks: {
    running: {
      BTN1_short: () => {nextTimeZone(); updateWorldTime(TIMEZONES[currentTimeZone]); renderAll(renderedWatchState, showHighlighted); saveValue("currentTimeZone", currentTimeZone);},
      BTN1_long: () => {},
      BTN2_short: () => {},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => nextMode(),
      BTN3_long: () => {}
    }
  }
};

modes.push(worldTimeMode);

////////////////////////////////////////////////////////////////////////////////////////////
// Handle calendar mode
////////////////////////////////////////////////////////////////////////////////////////////
function ISO8601_week_no(dt) 
{
  var tdt = new Date(dt.valueOf());
  var dayn = (dt.getDay() + 6) % 7;
  tdt.setDate(tdt.getDate() - dayn + 3);
  var firstThursday = tdt.valueOf();
  tdt.setMonth(0, 1);
  if (tdt.getDay() !== 4) 
  {
    tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - tdt) / 604800000);
}

function getWeekNumber(datetime) {
  return ISO8601_week_no(datetime);
}

let calendarMode =
{
  modeName: "calendar",
  defaultState: "running",
  update: () => updateCalendar(),
  callbacks: {
    running: {
      BTN1_short: () => {},
      BTN1_long: () => {},
      BTN2_short: () => {},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => nextMode(),
      BTN3_long: () => {}
    }
  }
};

modes.push(calendarMode);

////////////////////////////////////////////////////////////////////////////////////////////
// Handle stopwatch mode
////////////////////////////////////////////////////////////////////////////////////////////
let stopwatchTimer; // high-speed timer for countdown ticks
let stopwatchTicks = 0; // 10 ms per tick

function incStopwatchTicks() {
  stopwatchTicks+=STOPWATCH_INTERVAL_MS / MS_PER_TICK;
  stopwatchTicks = Math.min(stopwatchTicks, MAX_STOPWATCH_TICK);
}

let stopwatchMode =
{
  modeName: "stopwatch",
  defaultState: "idle",
  update: () => updateStopwatch(stopwatchTicks),
  callbacks: {
    idle: {
      BTN1_short: () => {stopwatchTicks = 0; updateStopwatch(stopwatchTicks);},
      BTN1_long: () => {},
      BTN2_short: () => {currentModeState = "running"; stopwatchTimer = setInterval(() => { incStopwatchTicks(); updateStopwatch(stopwatchTicks);}, STOPWATCH_INTERVAL_MS);},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => nextMode(),
      BTN3_long: () => {}
    },
    running: {
      BTN1_short: () => {},
      BTN1_long: () => {},
      BTN2_short: () => {currentModeState = "paused"; clearInterval(stopwatchTimer);},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => {clearInterval(stopwatchTimer); nextMode();},
      BTN3_long: () => {}
    },
    paused: {
      BTN1_short: () => {stopwatchTicks = 0; currentModeState = "idle"; updateStopwatch(stopwatchTicks);},
      BTN1_long: () => {},
      BTN2_short: () => {currentModeState = "running"; stopwatchTimer = setInterval(() => { incStopwatchTicks(); updateStopwatch(stopwatchTicks);}, STOPWATCH_INTERVAL_MS);},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => nextMode(),
      BTN3_long: () => {}
    }
  }
};

modes.push(stopwatchMode);

////////////////////////////////////////////////////////////////////////////////////////////
// Handle timer mode
//////////////////////////////////////////////////////////////////////////////////////////// 
let timerStartValue = 180; // in Seconds
let timerValue = timerStartValue; // in Seconds

function decTimerValue() {
  timerValue--;
  timerValue = Math.max(0, timerValue);
}

function addTimerStartValue(add) {
  timerStartValue += add;
  timerStartValue = Math.max(0, timerStartValue);
  timerStartValue = Math.min(MAX_TIMER_START_VALUE , timerStartValue);
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
}

let timerMode =
{
  modeName: "timer",
  defaultState: "idle",
  update: () => updateTimer(timerValue),
  callbacks: {
    idle: {
      BTN1_short: () => {timerValue = timerStartValue; updateTimer(timerValue);},
      BTN1_long: () => {currentModeState = "chg_hours"; renderedWatchState.upperDigits.highlighted = true; renderedWatchState.middleDigits.highlighted = false; renderedWatchState.lowerDigits.highlighted = false;},
      BTN2_short: () => {currentModeState = "running";},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => nextMode(),
      BTN3_long: () => {}
    },
    running: {
      BTN1_short: () => {},
      BTN1_long: () => {},
      BTN2_short: () => {currentModeState = "paused";},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => nextMode(),
      BTN3_long: () => {}
    },
    paused: {
      BTN1_short: () => {timerValue = timerStartValue; currentModeState = "idle"; updateTimer(timerValue);},
      BTN1_long: () => {},
      BTN2_short: () => {currentModeState = "running";},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => nextMode(),
      BTN3_long: () => {}
    },
    chg_hours: {
      BTN1_short: () => {addTimerStartValue(3600); timerValue=timerStartValue; updateTimer(timerValue);},
      BTN1_long: () => {},
      BTN2_short: () => {currentModeState = "chg_minutes"; renderedWatchState.upperDigits.highlighted = false; renderedWatchState.middleDigits.highlighted = true; renderedWatchState.lowerDigits.highlighted = false;},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => {addTimerStartValue(-3600); timerValue=timerStartValue; updateTimer(timerValue);},
      BTN3_long: () => {}
    },
    chg_minutes: {
      BTN1_short: () => {addTimerStartValue(60); timerValue=timerStartValue; updateTimer(timerValue);},
      BTN1_long: () => {},
      BTN2_short: () => {currentModeState = "chg_seconds"; renderedWatchState.upperDigits.highlighted = false; renderedWatchState.middleDigits.highlighted = false; renderedWatchState.lowerDigits.highlighted = true;},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => {addTimerStartValue(-60); timerValue=timerStartValue; updateTimer(timerValue);},
      BTN3_long: () => {}
    },
    chg_seconds: {
      BTN1_short: () => {addTimerStartValue(1); timerValue=timerStartValue; updateTimer(timerValue);},
      BTN1_long: () => {},
      BTN2_short: () => {saveValue("timerStartValue", timerStartValue); currentModeState = "idle"; renderedWatchState.upperDigits.highlighted = false; renderedWatchState.middleDigits.highlighted = false; renderedWatchState.lowerDigits.highlighted = false;},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => {addTimerStartValue(-1); timerValue=timerStartValue; updateTimer(timerValue);},
      BTN3_long: () => {}
    }
  }
};

modes.push(timerMode);

////////////////////////////////////////////////////////////////////////////////////////////
// App startup script
////////////////////////////////////////////////////////////////////////////////////////////
let currentMode = "clock"; // initial mode
let currentModeState = getDefaultState(currentMode); // initial state of initial mode

// Reset the state of the graphics library
g.reset();
// Clear the screen once, at startup
g.clear();
// Load save state
initializeLoadedValues();
// Initial rendering
updateSystemStatus();
getUpdate(currentMode)();
renderAll(renderedWatchState, showHighlighted);

////////////////////////////////////////////////////////////////////////////////////////////
// Clock & Rendering intervals and events
////////////////////////////////////////////////////////////////////////////////////////////
let mainTicks = 0;

function mainInterval(watchState) {
  // After 1000 ms
  if ((mainTicks % (1000 / MAIN_INTERVAL_MS)) == 0) {
    if (currentMode == "clock") {
      updateClock();
    } else if (currentMode == "worldTime") {
      updateWorldTime(TIMEZONES[currentTimeZone]);
    } else if (currentMode == "timer") {
      if (currentModeState == "running") {
        decTimerValue();
        if (timerValue <= 0) {
          currentModeState = "idle";
          timerValue = timerStartValue;
          alarm();
        }
      }
      updateTimer(timerValue);
    }
    if (global.gc) global.gc();
  }

  // After 10s
  if ((mainTicks % (10000 / MAIN_INTERVAL_MS)) == 0) {
    if (currentMode == "calendar") {
      updateCalendar();
    }
    if (LOGGING_ENABLED) {
      logSystemState();
    }
  }

  // After 250 ms
  if ((mainTicks % (250 / MAIN_INTERVAL_MS)) == 0) {
    updateSystemStatus();
    renderSlowContents(watchState, showHighlighted);
    renderFastContents(watchState, showHighlighted);
  }

  // After 500 ms
  if ((mainTicks % (500 / MAIN_INTERVAL_MS)) == 0) {
    showHighlighted = !showHighlighted; // 1 second blinking
  }

  // Each call
  mainTicks = (mainTicks + 1) % (10000 / MAIN_INTERVAL_MS); // Prevent overflow
}

let mainTimer = setInterval(() => mainInterval(renderedWatchState), MAIN_INTERVAL_MS);

// Initial rendering on turning on LCD
Bangle.on('lcdPower',on =>{
  if (on) {
    updateSystemStatus();
    getUpdate(currentMode);
    renderAll(renderedWatchState, showHighlighted);
  }
});

////////////////////////////////////////////////////////////////////////////////////////////
// Button Callback Logic
////////////////////////////////////////////////////////////////////////////////////////////

// Handle button presses
function onLongPressedBTN2() {
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
  getCallbacks(currentMode)[currentModeState].BTN2_long();
}

function onShortPressedBTN2() {
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
  getCallbacks(currentMode)[currentModeState].BTN2_short();
}

function onLongPressedBTN1() {
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
  getCallbacks(currentMode)[currentModeState].BTN1_long();
}

function onShortPressedBTN1() {
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
  getCallbacks(currentMode)[currentModeState].BTN1_short();
}

function onLongPressedBTN3() {
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
  getCallbacks(currentMode)[currentModeState].BTN3_long();
}

function onShortPressedBTN3() {
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
  getCallbacks(currentMode)[currentModeState].BTN3_short();
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
