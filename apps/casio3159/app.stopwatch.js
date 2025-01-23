const casio = require("casiostyle");

// Stopwatch Mode
const MAX_STOPWATCH_TICK = (9 * 60 * 60 * 100) - 1;
const STOPWATCH_INTERVAL_MS = 80;
const MS_PER_TICK = 10;

const LOGGING_ENABLED = false;


// State to be rendered
let stopwatchWatchState = {
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

// Update for stopwatch mode
function updateStopwatch(elapsedTenMilliseconds) {
  let tenmilliseconds = (elapsedTenMilliseconds % 100).toString().padStart(2, '0');
  let seconds = (Math.floor(elapsedTenMilliseconds / 100) % 60).toString().padStart(2, '0');
  let minutes = (Math.floor(elapsedTenMilliseconds / 6000) % 60).toString().padStart(2, '0');
  let hours = (Math.floor(elapsedTenMilliseconds / 360000) % 24).toString(); // Not padded on purpose

  stopwatchWatchState.cw = false;
  stopwatchWatchState.dividers.colon = true;
  stopwatchWatchState.dividers.dot = false;
  stopwatchWatchState.dividers.smallDot = true;
  stopwatchWatchState.lowerDigits.value = tenmilliseconds;
  stopwatchWatchState.middleDigits.value = seconds;
  stopwatchWatchState.upperDigits.value = minutes;
  stopwatchWatchState.textField.text = "ST";
  stopwatchWatchState.textBox.text = hours + "H";
  casio.submitWatchStateToRender(stopwatchWatchState);
}

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
  src: "casio/modes/stopwatch.js",
  modeName: "stopwatch",
  defaultState: "idle",
  update: () => updateStopwatch(stopwatchTicks),
  callbacks: {
    idle: {
      BTN1_short: () => {stopwatchTicks = 0; updateStopwatch(stopwatchTicks);},
      BTN1_long: () => {},
      BTN2_short: () => {casio.changeState("running"); stopwatchTimer = setInterval(() => { incStopwatchTicks(); updateStopwatch(stopwatchTicks);}, STOPWATCH_INTERVAL_MS);},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => casio.loadNextMode(),
      BTN3_long: () => {}
    },
    running: {
      BTN1_short: () => {},
      BTN1_long: () => {},
      BTN2_short: () => {casio.changeState("paused"); clearInterval(stopwatchTimer);},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => {clearInterval(stopwatchTimer); casio.loadNextMode();},
      BTN3_long: () => {}
    },
    paused: {
      BTN1_short: () => {stopwatchTicks = 0; currentModeState = "idle"; updateStopwatch(stopwatchTicks);},
      BTN1_long: () => {},
      BTN2_short: () => {casio.changeState("running"); stopwatchTimer = setInterval(() => { incStopwatchTicks(); updateStopwatch(stopwatchTicks);}, STOPWATCH_INTERVAL_MS);},
      BTN2_long: () => Bangle.showLauncher(),
      BTN3_short: () => casio.loadNextMode(),
      BTN3_long: () => {}
    }
  }
};

////////////////////////////////////////////////////////////////////////////////////////////
// App Script
////////////////////////////////////////////////////////////////////////////////////////////
casio.initCasio(stopwatchMode);
if (LOGGING_ENABLED) {
  casio.enableLogging();
} else {
  casio.disableLogging();
}
