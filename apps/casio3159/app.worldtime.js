////////////////////////////////////////////////////////////////////////////////////////////
// Global constants
////////////////////////////////////////////////////////////////////////////////////////////
const casio = require("casiostyle");

const language = casio.LANGUAGES.GERMAN;

// Memory logging
const LOGGING_ENABLED = false;


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

  let timestamp = Math.floor(now / 1000);

  return {hours: hours, minutes: minutes, seconds: seconds, timestamp: timestamp};
}

// State to be rendered
let worldClockWatchState = {
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


// Update for world clock mode
function updateWorldTime(tz) {
  let utcTime = getUtcTimeStrings(tz.offset);

  worldClockWatchState.cw = false;
  worldClockWatchState.dividers.colon = true;
  worldClockWatchState.dividers.dot = false;
  worldClockWatchState.dividers.smallDot = false;
  worldClockWatchState.upperDigits.value = utcTime.hours;
  worldClockWatchState.middleDigits.value = utcTime.minutes;
  worldClockWatchState.lowerDigits.value = utcTime.seconds;
  worldClockWatchState.textField.text = "WT";
  worldClockWatchState.textBox.text = tz.shortName;
  worldClockWatchState.textBanner.text = "Unix Time: " + utcTime.timestamp;
  // Submit for rendering
  casio.submitWatchStateToRender(worldClockWatchState);
}


function initializeLoadedValues() {
  let data = casio.loadSavedValues();

  if ("currentTimeZone" in data) {
    currentTimeZone = data.currentTimeZone;
    if (currentTimeZone >= TIMEZONES.length) {
      // Corrupt data
      currentTimeZone = 0;
    }
  }
}

let currentTimeZone = 0; // UTC

function nextTimeZone() {
  currentTimeZone = (currentTimeZone + 1) % TIMEZONES.length;
}

let worldTimeMode =
{
  src: "casio/modes/worldtime.js",
  modeName: "worldTime",
  defaultState: "running",
  update: () => updateWorldTime(TIMEZONES[currentTimeZone]),
  callbacks: {
    running: {
      BTN1_short: () => {nextTimeZone(); updateWorldTime(TIMEZONES[currentTimeZone]); casio.saveValue("currentTimeZone", currentTimeZone);},
      BTN1_long: () => {},
      BTN2_short: () => {},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => casio.loadNextMode(),
      BTN3_long: () => {}
    }
  }
};

////////////////////////////////////////////////////////////////////////////////////////////
// App Script
////////////////////////////////////////////////////////////////////////////////////////////
initializeLoadedValues();
casio.initCasio(worldTimeMode);
if (LOGGING_ENABLED) {
  casio.enableLogging();
} else {
  casio.disableLogging();
}
let worldClockInterval = setInterval(() => {updateWorldTime(TIMEZONES[currentTimeZone]);}, 1000);

// Initial rendering on turning on LCD
Bangle.on('lcdPower',on =>{
  if (on) {
    worldClockInterval = setInterval(() => {updateWorldTime(TIMEZONES[currentTimeZone]);}, 1000);
  } else {
    // Save energy
    clearInterval(worldClockInterval);
  }
});
