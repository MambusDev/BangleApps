const casio = require("casiostyle");
const storage = require("Storage");

const language = casio.LANGUAGES.GERMAN;

// Notify sounds
const NOTIFY_BUZZ_TIME_MS = 500;

const LOGGING_ENABLED = false;

const MAX_STEPS_TARGET = 99999;

const HRM_CONFIDENCE_LVL = 85;

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

function isMidnight() {
  let now = new Date();

  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  if ((hours == 0) && (minutes == 0) && (seconds == 0)) {
    return true;
  }

  return false;
}

// State to be rendered
let sportWatchState = {
  heart: {
    show: true,
    highlighted: false
  },
  feet: {
    show: true,
    highlighted: false
  },
  circle: {
    startValue: 0,
    endValue: 220,
    show: true,
    highlighted: false
  },
  cw: false,
  dividers: {
    colon: false,
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
    text: "SP",
    highlighted: false
  },
  textBox: {
    text: "00:00",
    highlighted: false
  },
  textBanner: {
    text: "",
    highlighted: false
  }
};

// Update for timer mode
function updateSport() {
  let time = getTimeStrings();
  if (casio.getState() == "running") {
    let hrmString = heartRate? heartRate.toString() : "---";
    sportWatchState.heart.show = true;
    sportWatchState.feet.show = true;
    sportWatchState.feet.highlighted = false;
    sportWatchState.lowerDigits.value = hrmString.padStart(3, ' ');
    sportWatchState.middleDigits.value = "  ";
    sportWatchState.upperDigits.value = "  ";
  } else {
    sportWatchState.heart.show = false;
    sportWatchState.feet.show = true;
    sportWatchState.feet.highlighted = true;
    sportWatchState.lowerDigits.value = (stepsTarget % 1000).toString().padStart(3, '0');
    sportWatchState.middleDigits.value = Math.floor(stepsTarget / 1000).toString().padStart(2, '0');
    sportWatchState.upperDigits.value = "  ";
  }
  sportWatchState.circle.startValue = 0;
  sportWatchState.circle.endValue = Math.min(1, stepsToday / stepsTarget) * 360;
  sportWatchState.textBox.text = time.hours + ":" + time.minutes;
  sportWatchState.textBanner.text = `Steps: ${stepsToday}/${stepsTarget}`;

  casio.submitWatchStateToRender(sportWatchState);
}

function initializeLoadedValues() {
  let data = casio.loadSavedValues();

  // Check if the key exists before initializing
  if ("stepsToday" in data) {
    stepsToday = data.stepsToday;
  }
  if ("stepsTarget" in data) {
    stepsTarget = data.stepsTarget;
  }
}

function sanitizeStepsTarget() {
  stepsTarget = Math.min(MAX_STEPS_TARGET, stepsTarget);
  stepsTarget = Math.max(0, stepsTarget);
}

function tenThousandSteps(positive) {
  stepsTarget = stepsTarget - (stepsTarget % 10000);
  if (positive) stepsTarget += 10000;
}

let sportMode =
{
  src: "casio/modes/sport.js",
  modeName: "sport",
  defaultState: "running",
  update: () => updateSport(),
  callbacks: {
    running: {
      BTN1_short: () => {},
      BTN1_long: () => {sportWatchState.middleDigits.highlighted = true; sportWatchState.lowerDigits.highlighted = false; casio.changeState("changeBig"); updateSport(); },
      BTN2_short: () => {},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => {sportWatchState.circle.endValue = 0; Bangle.setHRMPower(0); casio.loadNextMode();},
      BTN3_long: () => {}
    },
    changeBig: {
      BTN1_short: () => {stepsTarget += 1000; sanitizeStepsTarget(); updateSport(); },
      BTN1_long: () => {tenThousandSteps(true); sanitizeStepsTarget(); updateSport(); },
      BTN2_short: () => {sportWatchState.middleDigits.highlighted = false; sportWatchState.lowerDigits.highlighted = true; casio.saveValue("stepsTarget", stepsTarget); casio.changeState("changeSmall"); updateSport(); },
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => {stepsTarget -= 1000; sanitizeStepsTarget(); updateSport(); },
      BTN3_long: () => {tenThousandSteps(false); sanitizeStepsTarget(); updateSport();}
    },
    changeSmall: {
      BTN1_short: () => {stepsTarget += 100; sanitizeStepsTarget(); updateSport(); },
      BTN1_long: () => {},
      BTN2_short: () => {sportWatchState.middleDigits.highlighted = false; sportWatchState.lowerDigits.highlighted = false; casio.saveValue("stepsTarget", stepsTarget); casio.changeState("running"); updateSport(); },
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => {stepsTarget -= 100; sanitizeStepsTarget(); updateSport(); },
      BTN3_long: () => {}
    }
  }
};

////////////////////////////////////////////////////////////////////////////////////////////
// App Script
////////////////////////////////////////////////////////////////////////////////////////////
let heartRate;
let stepsToday = 0;
let stepsTarget = 10000;

Bangle.setHRMPower(1); // Enable HRM
initializeLoadedValues();
casio.initCasio(sportMode);
if (LOGGING_ENABLED) {
  casio.enableLogging();
} else {
  casio.disableLogging();
}

// Event listener for heart rate measurement
Bangle.on('HRM', function(hrm) {
  if (hrm.confidence > HRM_CONFIDENCE_LVL) {
    heartRate = hrm.bpm;
    updateSport();
  }
});

// Event listener for step counting
Bangle.on('step', function(count) {
  stepsToday++;
  casio.saveValue("stepsToday", stepsToday);
  if (stepsToday == stepsTarget) {
    Bangle.buzz(NOTIFY_BUZZ_TIME_MS); 
  }
  updateSport();
});

let sportTimer = setInterval(() => { if (isMidnight()) stepsToday = 0;}, 1000);

