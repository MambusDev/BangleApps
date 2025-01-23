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

// Interval of main timer
const MAIN_INTERVAL_MS = 250;

// Save state
const SAVE_FILE = "casiostate.json";

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

function loadIcon(filename) {
  return E.toArrayBuffer(atob(storage.read(filename)));
}

////////////////////////////////////////////////////////////////////////////////////////////
// System parameter getters
////////////////////////////////////////////////////////////////////////////////////////////
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

let currentMode; // Current active mode
let currentModeState; // Current mode's state
let mainTimer; // Rendering interval timer
let loggingEnabled = false; // Enables logging

////////////////////////////////////////////////////////////////////////////////////////////
// API
////////////////////////////////////////////////////////////////////////////////////////////
exports.hideWidgets = function() {
  setColor(g, BLACK);
  g.fillRect(0, 0, xmax, 24);
  g.setClipRect(0, 25, xmax, ymax);  // Disallow drawing to widget area
};

exports.showWidgets = function(timeout) {
  g.setClipRect(); // Re-allow drawing to widget area
  Bangle.loadWidgets(); // lazy intialization
  Bangle.drawWidgets();
  if (timeout > 0) {
    setTimeout(() => hideWidgets(), timeout);
  }
};

exports.loadNextMode = function() {
  // List all scripts in the "casio/modes/" namespace
  let scripts = storage.list("casio/modes/");

  // Sort the scripts lexicographically to ensure a consistent order
  scripts.sort();

  // Find the index of the current script
  let index = scripts.indexOf(modes[0].src);

  // Calculate the next script, wrapping around if at the end
  let nextIndex = (index + 1) % scripts.length;

  // Load the next mode script
  load(scripts[nextIndex]);
};

exports.setStyle = function(style) {
  fgColor=style.fg;
  bgColor=style.bg;
};

exports.submitWatchStateToRender = function(watchState) {
  renderedWatchState = watchState;
};

exports.enableLogging = function() {
  loggingEnabled = true;
};

exports.disableLogging = function() {
  loggingEnabled = false;
};

exports.initCasio = function(modeObj) {
  modes.push(modeObj);
  currentMode = modeObj.modeName;
  currentModeState = modeObj.defaultState;

  // Reset the state of the graphics library
  g.reset();
  // Clear the screen once, at startup
  g.clear();
  // Initial rendering
  updateSystemStatus();
  getUpdate(currentMode)();
  renderAll(renderedWatchState, showHighlighted);
  showWidgets(5000);
  mainTimer = setInterval(() => mainInterval(renderedWatchState), MAIN_INTERVAL_MS);

  // Initial rendering on turning on LCD
  Bangle.on('lcdPower',on =>{
    if (on) {
      updateSystemStatus();
      getUpdate(currentMode);
      renderAll(renderedWatchState, showHighlighted);
      showWidgets(5000);
    }
  });

  // Buzz on charging event
  Bangle.on('charging', charging => { if (charging) Bangle.buzz(); });

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
};

exports.saveValue = function(key, value) {
  let data = loadAllValues(); // Load existing data
  data[key] = value; // Add or update the key-value pair
  storage.write(SAVE_FILE, JSON.stringify(data));
};

exports.loadSavedValues = function() {
  const fileContents = storage.read(SAVE_FILE);
  if (fileContents) {
    try {
      const data = JSON.parse(fileContents);
      return data;
    } catch (error) {
    }
  }
  return {}; // Return an empty object if the file doesn't exist or is invalid
};

////////////////////////////////////////////////////////////////////////////////////////////
// Logging
////////////////////////////////////////////////////////////////////////////////////////////
function logFlashStats() {
  const files = storage.list();
  let usedSpace = 0;

  files.forEach(file => {
    const size = storage.read(file).length;
    usedSpace += size;
  });

  const freeSpace = storage.getFree();
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
// Clock & Rendering intervals and events
////////////////////////////////////////////////////////////////////////////////////////////
let mainTicks = 0;

function mainInterval(watchState) {
  // After 1000 ms
  if ((mainTicks % (1000 / MAIN_INTERVAL_MS)) == 0) {
    if (global.gc) global.gc();
  }

  // After 10s
  if ((mainTicks % (10000 / MAIN_INTERVAL_MS)) == 0) {
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
