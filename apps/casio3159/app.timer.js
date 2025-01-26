const casio = require("casiostyle");
const storage = require("Storage");

const language = casio.LANGUAGES.GERMAN;

// Alarm sounds
const ALARM_BUZZ_COUNT = 2;
const ALARM_BUZZ_TIME_MS = 250;
const ALARM_BUZZ_PAUSE_MS = 1000;
const ALARM_BEEP_FREQ_HZ = 4000;

// Timer Mode
const MAX_TIMER_START_VALUE = (100 * 60 * 60) - 1;

const LOGGING_ENABLED = false;

const SETTINGS_FILE = 'setting.json';
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
// State to be rendered
let timerWatchState = {
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

// Update for timer mode
function updateTimer(timeLeft) {
  let seconds = (timeLeft % 60).toString().padStart(2, '0');
  let minutes = (Math.floor(timeLeft / 60) % 60).toString().padStart(2, '0');
  let hours = (Math.floor(timeLeft / 3600) % 100).toString().padStart(2, '0');
  let time = getTimeStrings();

  timerWatchState.cw = false;
  timerWatchState.dividers.colon = true;
  timerWatchState.dividers.dot = false;
  timerWatchState.dividers.smallDot = false;
  timerWatchState.lowerDigits.value = seconds;
  timerWatchState.middleDigits.value = minutes;
  timerWatchState.upperDigits.value = hours;
  timerWatchState.textField.text = "TR";
  timerWatchState.textBox.text = time.hours + ":" + time.minutes;

  casio.submitWatchStateToRender(timerWatchState);
}

function initializeLoadedValues() {
  let data = casio.loadSavedValues();

  // Check if the key exists before initializing
  if ("timerStartValue" in data) {
    timerStartValue = data.timerStartValue;
    timerValue = timerStartValue;
  }
}

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

function addBigTimerStartValue(factor) {
  let steps = Math.floor(timerStartValue / Math.abs(factor));

  let add = 0;
  if (factor < 0) {
    add = (steps % 10) * factor;
  } else {
    add = (10 - (steps % 10)) * factor;
  }

  timerStartValue = timerStartValue + add;
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
  src: "casio/modes/timer.js",
  modeName: "timer",
  defaultState: "idle",
  update: () => updateTimer(timerValue),
  callbacks: {
    idle: {
      BTN1_short: () => {timerValue = timerStartValue; updateTimer(timerValue);},
      BTN1_long: () => {casio.changeState("chg_hours"); timerWatchState.upperDigits.highlighted = true; timerWatchState.middleDigits.highlighted = false; timerWatchState.lowerDigits.highlighted = false;},
      BTN2_short: () => {casio.changeState("running"); timerTimer = setInterval(() => handleTimer(), 1000);},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => casio.loadNextMode(),
      BTN3_long: () => {}
    },
    running: {
      BTN1_short: () => {},
      BTN1_long: () => {},
      BTN2_short: () => {casio.changeState("paused"); clearInterval(timerTimer);},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => casio.loadNextMode(),
      BTN3_long: () => {}
    },
    paused: {
      BTN1_short: () => {timerValue = timerStartValue; casio.changeState("idle"); updateTimer(timerValue);},
      BTN1_long: () => {},
      BTN2_short: () => {casio.changeState("running"); timerTimer = setInterval(() => handleTimer(), 1000);},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => casio.loadNextMode(),
      BTN3_long: () => {}
    },
    chg_hours: {
      BTN1_short: () => {addTimerStartValue(3600); timerValue=timerStartValue; updateTimer(timerValue);},
      BTN1_long: () => {addBigTimerStartValue(3600); timerValue=timerStartValue; updateTimer(timerValue);},
      BTN2_short: () => {casio.changeState("chg_minutes"); timerWatchState.upperDigits.highlighted = false; timerWatchState.middleDigits.highlighted = true; timerWatchState.lowerDigits.highlighted = false;},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => {addTimerStartValue(-3600); timerValue=timerStartValue; updateTimer(timerValue);},
      BTN3_long: () => {addBigTimerStartValue(-3600); timerValue=timerStartValue; updateTimer(timerValue);}
    },
    chg_minutes: {
      BTN1_short: () => {addTimerStartValue(60); timerValue=timerStartValue; updateTimer(timerValue);},
      BTN1_long: () => {addBigTimerStartValue(60); timerValue=timerStartValue; updateTimer(timerValue);},
      BTN2_short: () => {casio.changeState("chg_seconds"); timerWatchState.upperDigits.highlighted = false; timerWatchState.middleDigits.highlighted = false; timerWatchState.lowerDigits.highlighted = true;},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => {addTimerStartValue(-60); timerValue=timerStartValue; updateTimer(timerValue);},
      BTN3_long: () => {addBigTimerStartValue(-60); timerValue=timerStartValue; updateTimer(timerValue);}
    },
    chg_seconds: {
      BTN1_short: () => {addTimerStartValue(1); timerValue=timerStartValue; updateTimer(timerValue);},
      BTN1_long: () => {addBigTimerStartValue(1); timerValue=timerStartValue; updateTimer(timerValue);},
      BTN2_short: () => {casio.saveValue("timerStartValue", timerStartValue); casio.changeState("idle"); timerWatchState.upperDigits.highlighted = false; timerWatchState.middleDigits.highlighted = false; timerWatchState.lowerDigits.highlighted = false;},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => {addTimerStartValue(-1); timerValue=timerStartValue; updateTimer(timerValue);},
      BTN3_long: () => {addBigTimerStartValue(-1); timerValue=timerStartValue; updateTimer(timerValue);}
    }
  }
};

function handleTimer() {
  decTimerValue();
  if (timerValue <= 0) {
    casio.changeState("idle");
    timerValue = timerStartValue;
    clearInterval(timerTimer);
    alarm();
  }

  updateTimer(timerValue);
}

////////////////////////////////////////////////////////////////////////////////////////////
// App Script
////////////////////////////////////////////////////////////////////////////////////////////
initializeLoadedValues();
casio.initCasio(timerMode);
if (LOGGING_ENABLED) {
  casio.enableLogging();
} else {
  casio.disableLogging();
}

setInterval(() => updateTimer(timerValue), 1000);
let timerTimer;