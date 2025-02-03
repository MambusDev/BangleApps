////////////////////////////////////////////////////////////////////////////////////////////
// Global constants
////////////////////////////////////////////////////////////////////////////////////////////
//Casio style library
const casio = require("casiostyle");

const language = casio.LANGUAGES.GERMAN;

// Memory logging
const LOGGING_ENABLED = false;

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
function getStyleIndex(styles, style) {
  const index = styles.findIndex(item => 
    item.bg.r === style.bg.r && 
    item.bg.g === style.bg.g && 
    item.bg.b === style.bg.b &&
    item.fg.r === style.fg.r && 
    item.fg.g === style.fg.g && 
    item.fg.b === style.fg.b
  );

  if (index == -1) {
    return 0;
  }

  return index;
}

function setStyle(index) {
  casio.setStyle(casio.STYLES[index]);
}

function nextStyle() {
  let style = getStyleIndex(casio.STYLES, casio.getStyle());
  let nextStyle = (style + 1) % casio.STYLES.length;
  setStyle(nextStyle);
}

////////////////////////////////////////////////////////////////////////////////////////////
// Contents to be rendered
////////////////////////////////////////////////////////////////////////////////////////////
// State to be rendered
let clockWatchState = {
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

// Update for clock mode
function updateClock() {
  let time = getTimeStrings();

  clockWatchState.cw = false;
  clockWatchState.dividers.colon = true;
  clockWatchState.dividers.dot = false;
  clockWatchState.dividers.smallDot = false;
  clockWatchState.upperDigits.value = time.hours;
  clockWatchState.middleDigits.value = time.minutes;
  clockWatchState.lowerDigits.value = time.seconds;
  clockWatchState.textField.text = time.weekday;
  clockWatchState.textBox.text = time.day + "." + time.month.padStart(2, ' ');
  // Submit for rendering
  casio.submitWatchStateToRender(clockWatchState);
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
      BTN1_short: () => {nextStyle();},
      BTN1_long: () => {casio.toggleNightMode();},
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
casio.initCasio(clockMode);
if (LOGGING_ENABLED) {
  casio.enableLogging();
} else {
  casio.disableLogging();
}
let clockInterval = setInterval(() => {updateClock();}, 1000);

// Initial rendering on turning on LCD
Bangle.on('lcdPower',on =>{
  if (on) {
    clockInterval = setInterval(() => {updateClock();}, 1000);
  } else {
    // Save energy
    clearInterval(clockInterval);
  }
});
