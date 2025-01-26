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

// Battery
const BATTERY_HIGH = 2;
const BATTERY_MEDIUM = 1;
const BATTERY_LOW = 0;

// Interval of main timer
const MAIN_INTERVAL_MS = 250;

// Save state
const SAVE_FILE = "casiostate.json";

// Colors
const BLACK = {r:0,g:0,b:0};
const LIGHT_GRAY = {r:0.9,g:1,b:0.9};
const DARK_GRAY = {r:0.4,g:0.5,b:0.4};
const BLUE = {r:0.3,g:0.9,b:1};
const TURKISH = {r:0.1,g:1,b:0.8};
const YELLOW = {r:1,g:0.8,b:0.1};
const RED = {r:1,g:0.2,b:0.5};
const NEON_GREEN = {r:0.1,g:1,b:0.1};
const NEON_PINK = {r:1,g:0.1,b:0.6};
const NEON_PURPLE = {r:0.6,g:0.2,b:1};
const NEON_ORANGE = {r:1,g:0.4,b:0};
const NEON_BLUE = {r:0.1,g:0.8,b:1};
const NEON_YELLOW = {r:1,g:1,b:0.1};

// Styles
const STYLES = [
  {bg: LIGHT_GRAY, fg: BLACK},
  {bg: TURKISH, fg: BLACK},
  {bg: BLUE, fg: BLACK},
  {bg: NEON_BLUE, fg: BLACK},
  {bg: NEON_PURPLE, fg: BLACK},
  {bg: RED, fg: BLACK},
  {bg: NEON_PINK, fg: BLACK},
  {bg: NEON_YELLOW, fg: BLACK},
  {bg: YELLOW, fg: BLACK},
  {bg: NEON_ORANGE, fg: BLACK},
  {bg: NEON_GREEN, fg: BLACK},
  {bg: DARK_GRAY, fg: NEON_GREEN},
  {bg: BLACK, fg: LIGHT_GRAY}
];


// Language setting
const LANGUAGES = {
    ENGLISH: "English",
    GERMAN: "German"
};

const SHOW_WIDGETS = false;
const WIDGET_SHOW_TIME_MS = 2000;

let currentLanguage = LANGUAGES.GERMAN;

// Icons
const ICON_SIZE = 48;
const ICON_SCALE = 0.4;

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

function setStyle(style) {
  fgColor=style.fg;
  bgColor=style.bg;
  enforceRedrawDigits();
}

function getAccentColor(bgColor, fgColor) {
  const weight = 0.09;
  let interpolatedColor = {r: 0, g: 0, b: 0};
  interpolatedColor.r = bgColor.r + (fgColor.r - bgColor.r) * weight;
  interpolatedColor.g = bgColor.g + (fgColor.g - bgColor.g) * weight;
  interpolatedColor.b = bgColor.b + (fgColor.b - bgColor.b) * weight;
  return interpolatedColor;
}

function initializeStyle() {
  let data = loadSavedValues();

  // Check if the key exists before initializing
  if ("style" in data) {
    setStyle(data.style);
  } else {
    setStyle(STYLES[0]);
  }
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

// Only update display if values change to avoid flickering
let lastDrawnDigits = { lower: "", middle: "", upper: "" };

function enforceRedrawDigits() {
  lastDrawnDigits = { lower: "", middle: "", upper: "" };
}

function drawLowerDigits(digits) {
  if (digits == lastDrawnDigits.lower) return;
  lastDrawnDigits.lower = digits;
  setBgColor(g, bgColor);
  g.setFont("7x11Numeric7Seg", 3);
  g.setFontAlign(1, 1, 0); // right, bottom, normal

  setColor(g, getAccentColor(bgColor, fgColor));
  g.drawString("88", xmax - margin.right, ymax - margin.bottom - 2.5 * ymax / 10, true);
  setColor(g, fgColor);
  g.drawString(digits, xmax - margin.right, ymax - margin.bottom - 2.5 * ymax / 10, false);
}

function drawUpperDigits(digits) {
  if (digits == lastDrawnDigits.upper) return;
  lastDrawnDigits.upper = digits;
  setBgColor(g, bgColor);
  g.setFont("7x11Numeric7Seg", 5);
  g.setFontAlign(-1, 1, 0); // left, bottom, normal

  setColor(g, getAccentColor(bgColor, fgColor));
  g.drawString("88", xmin + margin.left, ymax - margin.bottom - 2.5 * ymax / 10, true);
  setColor(g, fgColor);
  g.drawString(digits, xmin + margin.left, ymax - margin.bottom - 2.5 * ymax / 10, false);
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
  if (digits == lastDrawnDigits.middle) return;
  lastDrawnDigits.middle = digits;
  setBgColor(g, bgColor);
  g.setFont("7x11Numeric7Seg", 5);
  g.setFontAlign(-1, 1, 0); // left, bottom, normal

  setColor(g, getAccentColor(bgColor, fgColor));
  g.drawString("88", xmin + margin.left + 95, ymax - margin.bottom - 2.5 * ymax / 10, true); // 105 = three times font width
  setColor(g, fgColor);
  g.drawString(digits, xmin + margin.left + 95, ymax - margin.bottom - 2.5 * ymax / 10, false); // 105 = three times font width
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

  // Text banner background
  setColor(g, getAccentColor(bgColor, fgColor));
  g.fillRect(xmin, ymin + margin.top + ymax / 4 + 4, xmax, ymin + margin.top + ymax / 4 + 30);

  drawBatteryLevels();
}

function drawTextField(text) {
  setColor(g, fgColor);
  setBgColor(g, bgColor);
  g.setFont("Teletext5x9Ascii", 5);
  g.setFontAlign(1, -1, 0); // right, top, normal
  g.drawString(text.padStart(4, ' '), center.x - margin.right, ymin + 1.5 * margin.top, true);
}

function drawTextBox(text) {
  setColor(g, fgColor);
  setBgColor(g, bgColor);
  g.setFont("8x12", 4);
  g.setFontAlign(1, -1, 0); // right, top, normal
  g.drawString(text.padStart(4, ' '), xmax - 1.5 * margin.right, ymin + 1.25 * margin.top, true);
}

function drawTextBanner(text) {
  setColor(g, fgColor);
  setBgColor(g, getAccentColor(bgColor, fgColor));
  g.setFont("8x12", 2);
  g.setFontAlign(-1, -1, 0); // left, top, normal
  g.drawString(text.padEnd(20, ' '), xmin + margin.left, ymin + margin.top + ymax / 4 + 6, true);
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

function clearIcon(slot) {
  setColor(g, bgColor);

  x1 = xmin + 2 * margin.left + slot * (ICON_SIZE * ICON_SCALE + margin.left);
  y1 = ymax - ymax / 10 + margin.bottom;
  x2 = x1 + ICON_SIZE * ICON_SCALE; // Icon size = 48x48
  y2 = y1 + ICON_SIZE * ICON_SCALE; // Icon size = 48x48

  g.fillRect(x1, y1, x2, y2);
}

function drawIcon(icon, slot) {
  setColor(g, fgColor);
  setBgColor(g, fgColor);

  x1 = xmin + 2 * margin.left + slot * (ICON_SIZE * ICON_SCALE + margin.left);
  y1 = ymax - ymax / 10 + margin.bottom;

  g.drawImage(icon, x1, y1, {scale:ICON_SCALE});

}

function drawBtStatus(bt_enabled, bt_connected) {
  const slot = 0;
  if (bt_enabled) {
    if (bt_connected) {
      bt_con_icon = loadIcon("bt_con.icon");
      drawIcon(bt_con_icon, slot);
    } else {
      bt_icon = loadIcon("bt_en.icon");
      drawIcon(bt_icon, slot);
    }
  } else {
    clearIcon(slot);
  }
}

function drawBeepStatus(muted) {
  const slot = 1;

  if (!muted) {
    beep_icon = loadIcon("beep.icon");
    drawIcon(beep_icon, slot);
  } else {
    mute_icon = loadIcon("muted.icon");
    drawIcon(mute_icon, slot);
  }
}

function drawAlarmStatus(alarm) {
  const slot = 2;

  if (alarm) {
    bell_icon = loadIcon("bell.icon");
    drawIcon(bell_icon, slot);
  } else {
    clearIcon(slot);
  }
}

function drawChargingStatus(charging) {
  const slot = 3;

  if (charging) {
    charging_icon = loadIcon("charging.icon");
    drawIcon(charging_icon, slot);
  } else {
    clearIcon(slot);
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
  if (currentLanguage == "German") {
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

function renderVerySlowContents(watchState) {
  drawCalendarWeek(!watchState.cw);
  drawBtStatus(watchState.bluetooth.enabled, watchState.bluetooth.connected);
  drawBeepStatus(watchState.muted);
  drawAlarmStatus(watchState.alarm);
  drawChargingStatus(watchState.charging);
  if (watchState.dividers.dot) drawDot();
  if (watchState.dividers.smallDot) drawSmallDot();
  if (watchState.dividers.colon) drawColon();
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

  if ((watchState.textBanner.highlighted && showHighlighted) || !watchState.textBanner.highlighted) {
    textBanner = watchState.textBanner.text;
  }

  drawMiddleDigits(middleDigits);
  drawUpperDigits(upperDigits);
  drawTextField(textField);
  drawTextBox(textBox);
  drawTextBanner(textBanner);

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
  renderVerySlowContents(watchState);
  renderSlowContents(watchState, showHighlighted);
  renderFastContents(watchState, showHighlighted);
}

////////////////////////////////////////////////////////////////////////////////////////////
// Contents to be rendered
////////////////////////////////////////////////////////////////////////////////////////////
let showHighlighted = true;

// State to be rendered
let modeWatchState = {
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
  textBanner: {
    text: "",
    highlighted: false
  }
};

let systemWatchState = {
  bluetooth: {
    enabled: false,
    connected: false
  },
  charging: false,
  muted: false,
  alarm: false,
  battery: BATTERY_HIGH
};

// Combine to states for rendering functions
function renderedWatchState() {
  return Object.assign({}, modeWatchState, systemWatchState);
}

// General system updates
function updateSystemStatus() {
  systemWatchState.battery = getBatteryLevel();
  systemWatchState.muted = !setting("beep");
  systemWatchState.bluetooth.enabled = setting("ble");
  if (systemWatchState.bluetooth.enabled) {
    systemWatchState.bluetooth.connected = NRF.getSecurityStatus().connected;
  }
  systemWatchState.alarm = alarmIsSet();
  systemWatchState.charging = Bangle.isCharging();
}

////////////////////////////////////////////////////////////////////////////////////////////
// Modes
////////////////////////////////////////////////////////////////////////////////////////////
let currentMode; // Current mode
let currentModeState; // Current mode's state

////////////////////////////////////////////////////////////////////////////////////////////
// Widgets
////////////////////////////////////////////////////////////////////////////////////////////
function hideWidgets() {
  setColor(g, BLACK);
  g.fillRect(0, 0, xmax, 24);
  g.setClipRect(0, 25, xmax, ymax);  // Disallow drawing to widget area
}

function showWidgets(timeout) {
  g.setClipRect(); // Re-allow drawing to widget area
  Bangle.drawWidgets();
  if (timeout > 0) {
    setTimeout(() => hideWidgets(), timeout);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////
// Savefile
////////////////////////////////////////////////////////////////////////////////////////////
function saveValue(key, value) {
  let data = loadSavedValues(); // Load existing data
  data[key] = value; // Add or update the key-value pair
  storage.write(SAVE_FILE, JSON.stringify(data));
}

function loadSavedValues() {
  const fileContents = storage.read(SAVE_FILE);
  if (fileContents) {
    try {
      const data = JSON.parse(fileContents);
      return data;
    } catch (error) {
    }
  }
  return {}; // Return an empty object if the file doesn't exist or is invalid
}

////////////////////////////////////////////////////////////////////////////////////////////
// API
////////////////////////////////////////////////////////////////////////////////////////////
exports.STYLES = STYLES;

exports.LANGUAGES = LANGUAGES;

exports.hideWidgets = hideWidgets;

exports.showWidgets = showWidgets;

exports.loadNextMode = function() {
  // List all scripts in the "casio/modes/" namespace
  let scripts = storage.list("casio/modes/");

  // Sort the scripts lexicographically to ensure a consistent order
  scripts.sort();

  // Find the index of the current script
  let index = scripts.indexOf(currentMode.src);

  // Calculate the next script, wrapping around if at the end
  let nextIndex = (index + 1) % scripts.length;

  // Load the next mode script
  load(scripts[nextIndex]);
};

exports.setLanguage = function(language) {
  if (Object.values(LANGUAGES).includes(lanlanguageg)) {
    currentLanguage = language;
  }
};

exports.changeState = function(state) {
  currentModeState = state;
};

exports.setStyle = function(style) {
  setStyle(style);
  saveValue("style", style);
  renderAll(renderedWatchState(), showHighlighted);
};

exports.getStyle = function() {
  return {bg: bgColor, fg: fgColor};
};

exports.submitWatchStateToRender = function(watchState) {
  modeWatchState = Object.assign(modeWatchState, watchState);
};

exports.enableLogging = function() {
  loggingEnabled = true;
};

exports.disableLogging = function() {
  loggingEnabled = false;
};

let mainTimer; // Rendering interval timer
let loggingEnabled = false; // Enables logging

exports.initCasio = function(modeObj) {
  currentMode = modeObj;
  currentModeState = currentMode.defaultState;

  if (SHOW_WIDGETS) Bangle.loadWidgets();

  // Reset the state of the graphics library
  g.reset();
  // Clear the screen once, at startup
  g.clear();
  // Initial rendering
  updateSystemStatus();
  currentMode.update();
  initializeStyle();
  renderAll(renderedWatchState(), showHighlighted);
  if (SHOW_WIDGETS) showWidgets(WIDGET_SHOW_TIME_MS);
  mainTimer = setInterval(() => mainInterval(renderedWatchState()), MAIN_INTERVAL_MS);

  // Initial rendering on turning on LCD
  Bangle.on('lcdPower',on =>{
    if (on) {
      updateSystemStatus();
      currentMode.update();
      enforceRedrawDigits();
      renderAll(renderedWatchState(), showHighlighted);
      if (SHOW_WIDGETS) showWidgets(WIDGET_SHOW_TIME_MS);
      mainTimer = setInterval(() => mainInterval(renderedWatchState()), MAIN_INTERVAL_MS);
    } else {
      // Save energy
      clearInterval(mainTimer);
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

exports.saveValue = saveValue;

exports.loadSavedValues = loadSavedValues;

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
    renderVerySlowContents(watchState);
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
    renderFastContents(watchState, showHighlighted);
  }

  // After 500 ms
  if ((mainTicks % (500 / MAIN_INTERVAL_MS)) == 0) {
    showHighlighted = !showHighlighted; // 1 second blinking
    renderSlowContents(watchState, showHighlighted);
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
  currentMode.callbacks[currentModeState].BTN2_long();
}

function onShortPressedBTN2() {
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
  currentMode.callbacks[currentModeState].BTN2_short();
}

function onLongPressedBTN1() {
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
  currentMode.callbacks[currentModeState].BTN1_long();
}

function onShortPressedBTN1() {
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
  currentMode.callbacks[currentModeState].BTN1_short();
}

function onLongPressedBTN3() {
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
  currentMode.callbacks[currentModeState].BTN3_long();
}

function onShortPressedBTN3() {
  if (setting("beep")) Bangle.beep(BTN_BEEP_TIME_MS, BTN_BEEP_FREQ_HZ);
  currentMode.callbacks[currentModeState].BTN3_short();
}

let btnState = [{longPressTimer: null, isLongPress: false},{longPressTimer: null, isLongPress: false},{longPressTimer: null, isLongPress: false}];

let btnCallback = [{short: onShortPressedBTN1, long: onLongPressedBTN1},{short: onShortPressedBTN2, long: onLongPressedBTN2},{short: onShortPressedBTN3, long: onLongPressedBTN3}];

function handleRising(btn) {
  btnCallback[btn].short(); // Trigger short press action immediately
  btnState[btn].isLongPress = false; // Reset long press state
  btnState[btn].longPressTimer = setTimeout(() => {
    btnState[btn].isLongPress = true; // Mark as long press
    btnCallback[btn].long();  // Trigger long press action
  }, LONG_PRESSED_TIME_MS);
}

function handleFalling(btn) {
  if (btnState[btn].longPressTimer) {
    clearTimeout(btnState[btn].longPressTimer); // Cancel the long press timer
    btnState[btn].longPressTimer = null;
  }
}
