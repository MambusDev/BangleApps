const casio = require("casiostyle");

const language = casio.LANGUAGES.GERMAN;
const LOGGING_ENABLED = false;

// State to be rendered
let calendarWatchState = {
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
  }
};

// Update for calendar mode
function updateCalendar() {
  let time = getTimeStrings();
  let now = new Date();

  calendarWatchState.cw = true;
  calendarWatchState.dividers.colon = false;
  calendarWatchState.dividers.dot = true;
  calendarWatchState.dividers.smallDot = false;
  calendarWatchState.lowerDigits.value = getWeekNumber(now).toString().padStart(2, '0');
  calendarWatchState.upperDigits.value = time.day;
  calendarWatchState.middleDigits.value = time.month.padStart(2, '0');
  calendarWatchState.textField.text = time.weekday;
  calendarWatchState.textBox.text = time.year;
  casio.submitWatchStateToRender(calendarWatchState);
}

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
  src: "casio/modes/calendar.js",
  modeName: "calendar",
  defaultState: "running",
  update: () => updateCalendar(),
  callbacks: {
    running: {
      BTN1_short: () => {},
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
casio.initCasio(calendarMode);
if (LOGGING_ENABLED) {
  casio.enableLogging();
} else {
  casio.disableLogging();
}
let clockInterval = setInterval(() => {updateCalendar();}, 10000);