////////////////////////////////////////////////////////////////////////////////////////////
// Global constants
////////////////////////////////////////////////////////////////////////////////////////////
// Language setting
const Language = {
    ENGLISH: "English",
    GERMAN: "German"
};

const language = Language.GERMAN;

// Memory logging
const LOGGING_ENABLED = false;

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

//Casio style library
const casio = require("casiostyle");

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

////////////////////////////////////////////////////////////////////////////////////////////
// Colors and styles
////////////////////////////////////////////////////////////////////////////////////////////
let currentStyle = 0; // Default

function setStyle(index) {
 casio.setStyle(STYLES[index]);
}

function nextStyle() {
  currentStyle = (currentStyle + 1) % STYLES.length;
  setStyle(currentStyle);
}

////////////////////////////////////////////////////////////////////////////////////////////
// Contents to be rendered
////////////////////////////////////////////////////////////////////////////////////////////
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
  // Submit for rendering
  casio.submitWatchStateToRender(renderedWatchState);
}

function initializeSavedValues() {
  let data = casio.loadSavedValues();

  // Check if the key exists before initializing
  if ("currentStyle" in data) {
    currentStyle = data.currentStyle;
    if (currentStyle >= STYLES.length) {
      // Corrupt data
      currentStyle = 0;
    }
    setStyle(currentStyle);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////
// Handle clock mode
////////////////////////////////////////////////////////////////////////////////////////////
let clockMode =
{
  src: "casio/modes/clock.js",
  modeName: "clock",
  defaultState: "running",
  update: () => updateClock(),
  callbacks: {
    running: {
      BTN1_short: () => {nextStyle(); casio.saveValue("currentStyle", currentStyle);},
      BTN1_long: () => {},
      BTN2_short: () => {casio.showWidgets(5000);},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => casio.loadNextMode(),
      BTN3_long: () => {}
    }
  }
};

////////////////////////////////////////////////////////////////////////////////////////////
// App Script
////////////////////////////////////////////////////////////////////////////////////////////
initializeSavedValues();
casio.initCasio(clockMode);
if (LOGGING_ENABLED) {
  casio.enableLogging();
} else {
  casio.disableLogging();
}
let clockInterval = setInterval(() => {updateClock();}, 1000);
