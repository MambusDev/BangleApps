// http://forum.espruino.com/conversations/345155/#comment15172813
const locale = require('locale');

// Circle constants
const p = Math.PI / 2;
const pRad = Math.PI / 180;
const kDegreePerSecond = 6;
const kMaxSeconds = 60;
const kMaxMinutes = 60;
const kMaxHours = 24;
const kMaxHoursUs = 12;
const kHalfTurnDegrees = 180;
const kFullTurnDegrees = 360;
const kMillisecondsPerSecond = 1000;

// watch face radius (240/2 - 24px for widget area)
const kFaceWidth = 100;
const kWidgetHeight=24+1;

// Center of watch
const kCenter = {x:g.getWidth() / 2, y:(g.getWidth() / 2) + kWidgetHeight/2};

// Color definitions
const kColorBlack = 0x0000;
const kColorWhite = 0xFFFF;
const kColorGreen = 0x07E0;
const kColorRed = 0xF800;
const kColorBlue = 0x001F;
const kColorYellow = 0xFFE0;
const kColorLightGray = 0xC618;
const kColorDarkYellow = 0x5AE3;

// Color schemes

// Optical setting
const kSecondsHandWidth = 2;
const kHandWidth = 10;
const kHandNutWidth = {inner: 4, outer: 16};
const kSecondsMarkerWidth = {normal: 1, thick: 20};

let gTimer = null;
let gCurrentDate = new Date();
let gCurrentBattery = E.getBattery();
let gCurrentHrm = 0;
let gCurrentSteps = 0;
let gHrmState = false;

function FillCenteredCircle(angle, r1, radius, color) {
  const a = angle * pRad;
  
  var vec_dir = {x:Math.sin(a), y:Math.cos(a)};
  
  // Center of the circle
  var p1 = {x: kCenter.x + r1*vec_dir.x, y:kCenter.y - r1*vec_dir.y};
  
  // save color
  const color_buffer = g.getColor();
  g.setColor(color);
  
  // draw circle
  g.fillCircle(p1.x, p1.y, radius);
  
  // restore color
  g.setColor(color_buffer);
}

function FillCenteredRectangle(angle, r1, r2, width, color) {
  const a = angle * pRad;
  const vec_dir = {x:Math.sin(a), y:Math.cos(a)};
  const vec_orth = {x:vec_dir.y, y:(-1 * vec_dir.x)};
  
  // Use vector calculations to get rectangles corners
  var p1 = {x: kCenter.x + r1*vec_dir.x + (width / 2) * vec_orth.x, y: kCenter.y - (r1*vec_dir.y + (width / 2) * vec_orth.y)};
  var p2 = {x: kCenter.x + r1*vec_dir.x - (width / 2) * vec_orth.x, y: kCenter.y - (r1*vec_dir.y - (width / 2) * vec_orth.y)};
  var p4 = {x: kCenter.x + r2*vec_dir.x - (width / 2) * vec_orth.x, y: kCenter.y - (r2*vec_dir.y - (width / 2) * vec_orth.y)};
  var p3 = {x: kCenter.x + r2*vec_dir.x + (width / 2) * vec_orth.x, y: kCenter.y - (r2*vec_dir.y + (width / 2) * vec_orth.y)};
  
  // Save current color
  const color_buffer = g.getColor();
  g.setColor(color);
  
  // Draw rectangle
  g.fillPoly([
    Math.round(p1.x),
    Math.round(p1.y),
    Math.round(p2.x),
    Math.round(p2.y),
    Math.round(p4.x),
    Math.round(p4.y),
    Math.round(p3.x),
    Math.round(p3.y),
  ]);
  
  // Restore color
  g.setColor(color_buffer);
}

function DrawSecondsMarker(angle, width, color) {
  FillCenteredRectangle(angle, kFaceWidth - 8, kFaceWidth, width, color);
}

function DrawSecondsHand(angle, color) {
  // Thin, long part
  var r1 = kHandNutWidth.outer + 5;
  var r2 = kFaceWidth - 12;
  
  // Thick, short part
  var r3 = -kHandNutWidth.outer - 5;
  var r4 = -40;
  
  var width = kSecondsHandWidth;
  
  FillCenteredRectangle(angle, r1, r2, width, color);
  FillCenteredRectangle(angle, r3, r4, width * 2, color);
}

function DrawHand(angle, r1, r2, color) {
  var width = kHandWidth;
  
  FillCenteredCircle(angle, r2, width / 2 - 1, color);
  FillCenteredRectangle(angle, r1, r2, width, color);
}

function DrawMinutesHand(angle, color) {
  DrawHand(angle, kHandNutWidth.outer + 5, kFaceWidth - 20, color);
}

function DrawHoursHand(angle, color) {
  DrawHand(angle, kHandNutWidth.outer + 5, kFaceWidth - 40, color);
}

function DrawHandNut(r1, r2, c1, c2) {
  // Outer circle
  FillCenteredCircle(0, 0, r2, c2);
  // Inner circle
  FillCenteredCircle(0, 0, r1, c1);
}

function HoursAngle(hour, minute) {
  let us_hour = hour % kMaxHoursUs; 
  return (kFullTurnDegrees * ((us_hour + minute / kMaxMinutes) / kMaxHoursUs));
}

function MinutesAngle(minute) {
  return (kFullTurnDegrees * minute) / kMaxMinutes;
}

function SecondsAngle(second) {
  return (kFullTurnDegrees * second) / kMaxSeconds;
}

function BatteryAngle(percentage) {
  return (percentage / 100) * kFullTurnDegrees;
}

/// margin in degree
function IsInRange(a1, a2, margin) {
  let anglediff = (a1 - a2 + kHalfTurnDegrees + kFullTurnDegrees) % kFullTurnDegrees - kHalfTurnDegrees;

  if (anglediff <= margin && anglediff >= (-1 * margin)) {
    return true;
  }
  return false;
}

function SecondsHandOverlaps(sec_angle, angle, margin) {
  let sec_angle_inv = (sec_angle + kHalfTurnDegrees) % kFullTurnDegrees;
  if (IsInRange(sec_angle, angle, margin) || IsInRange(sec_angle_inv, angle, margin)) {
    return true;
  }
  return false;
}

function DrawBatteryDifference(battery_old, battery_new, c1, c2) {
  var battery_angle_old = BatteryAngle(battery_old);
  var battery_angle_new = BatteryAngle(battery_new);
  
  battery_angle_second_new = Math.floor(battery_angle_new / kDegreePerSecond);
  battery_angle_second_old = Math.floor(battery_angle_old / kDegreePerSecond);
  
  if(battery_new > battery_old) {
      // Draw new power
    for (let s = battery_angle_second_old; s <= battery_angle_second_new; s+=5) {
      let angle = (kFullTurnDegrees * s) / kMaxSeconds;
      DrawSecondsMarker(angle, ((angle % 15) == 0) ? kSecondsMarkerWidth.thick : kSecondsMarkerWidth.normal, c1);
    }
  } else if(battery_new < battery_old) {
    // Draw used power
    for (let s = battery_angle_second_old; s > battery_angle_second_new; s-=5) {
      let angle = (kFullTurnDegrees * s) / kMaxSeconds;
      DrawSecondsMarker(angle, ((angle % 15) == 0) ? kSecondsMarkerWidth.thick : kSecondsMarkerWidth.normal, ((angle % 15) == 0) ? c1 : c2);
    }
  }
}

function DrawInitialClock(hour, min, sec, day, bpm, battery) {
  var sec_angle = SecondsAngle(sec);
  var min_angle = MinutesAngle(min);
  var hour_angle = HoursAngle(hour, min);
  
  DrawBatteryDifference(0, battery, kColorYellow, kColorDarkYellow);
  DrawBatteryDifference(100, battery, kColorYellow, kColorDarkYellow);
  DrawDay(day, kColorWhite, kColorBlack);
  DrawBPM(bpm, kColorYellow, kColorWhite);
  
  DrawHoursHand(hour_angle, kColorWhite);
  DrawMinutesHand(min_angle, kColorWhite);
  //DrawSecondsHand(sec_angle, kColorLightGray);
  
  DrawHandNut(kHandNutWidth.inner, kHandNutWidth.outer, kColorBlack, kColorYellow);
}

const DrawAll = () => {
  g.clear();
  gCurrentDate = new Date();
  DrawInitialClock(gCurrentDate.getHours(), gCurrentDate.getMinutes(), gCurrentDate.getSeconds(), gCurrentDate.getDate(), 0, gCurrentBattery);

};

function DrawDay(day, c1, c2) {
  const pos = {x:kCenter.x - (kFaceWidth * (2 / 3)), y:kCenter.y - 10};
  
  const pos_ten = {x:pos.x, y:pos.y};
  const pos_one = {x:pos.x + 20, y:pos.y};
  
  const color_buffer = g.getColor();
  
  // Draw background
  g.setColor(c1);
  g.fillRect(pos_ten.x, pos_ten.y, pos_ten.x + 16, pos_ten.y + 20);
  g.fillRect(pos_one.x, pos_one.y, pos_one.x + 16, pos_one.y + 20);
   
  // Draw date
  g.setFontAlign(-1, -1, 0);
  g.setFont('Vector', 24);
  g.setColor(c2);
  g.drawString(Math.floor(day / 10), pos_ten.x + 2, pos_ten.y, false);
  g.drawString(day % 10, pos_one.x + 2, pos_one.y, false);
  
  // Restore color
  g.setColor(color_buffer);
}

function DrawSteps(steps, c1, c2) {
  const pos = {x:kCenter.x, y:kCenter.y + kFaceWidth / 4 + 18};
  const color_buffer = g.getColor();
  
  // Center the text
  g.setFontAlign(0, 0, 0);
  
  // Draw 'STEPS' string
  g.setFont('Vector', 16);
  g.setColor(c2);
  g.drawString("STEPS", pos.x, pos.y, true);
  
  // Draw STEPS value
  g.setFont('Vector', 20);
  g.setColor(c1);
  g.drawString(steps, pos.x, pos.y + 24, true);
  
  // Restore color
  g.setColor(color_buffer);
}

/// Bug: Text is not overwritten properly
function DrawBPM(bpm, c1, c2) {
  const pos = {x:kCenter.x + (kFaceWidth * (1 / 2)), y:kCenter.y - 5};
  const color_buffer = g.getColor();
  
  // Center the text
  g.setFontAlign(0, 0, 0);
  
  // Draw 'BPM' string
  g.setFont('Vector', 16);
  g.setColor(c2);
  g.drawString("BPM", pos.x, pos.y, true);
  
  // Draw BPM value
  g.setFont('Vector', 20);
  g.setColor(c1);
  bpmString = "----";
  if (gHrmState == true) {
    bpmString = String(bpm);
  }
  
  g.drawString(bpmString, pos.x, pos.y + 18, true);
  
  // Restore color
  g.setColor(color_buffer);
}

// TODO: 
// * Add different color schemes (easy color change)
// * Get real BPM
// * Get real steps (maybe fix memory problem)
const onSecond = () => {
  let old_sec = gCurrentDate.getSeconds();
  let old_min = gCurrentDate.getMinutes();
  let old_hour = gCurrentDate.getHours();
  
  gCurrentDate = new Date();
  let sec = gCurrentDate.getSeconds();
  let min = gCurrentDate.getMinutes();
  let hour = gCurrentDate.getHours();
    
  // Clear old time
  //DrawSecondsHand(SecondsAngle(old_sec), kColorBlack);
  
  if (sec == 0) {
    // Draw Day
    DrawDay(gCurrentDate.getDate(), kColorWhite, kColorBlack);

    // Draw Steps
    DrawSteps(gCurrentSteps, kColorYellow, kColorWhite);

    // Draw BPM widget
    DrawBPM(gCurrentHrm, kColorYellow, kColorWhite);

    // Update Battery (only draws difference)
    DrawBatteryDifference(gCurrentBattery, E.getBattery(), kColorYellow, kColorDarkYellow);
    gCurrentBattery = E.getBattery();
  }
  
  // Redraw if minutes or hours overlaps with:
  // * BPM
  // * STEPS
  // * Day
  // * Seconds hand
  if (min == 0) {
    DrawHoursHand(HoursAngle(old_hour, old_min), kColorBlack);
    DrawHoursHand(HoursAngle(hour, min), kColorWhite);
  } else if (SecondsHandOverlaps(SecondsAngle(old_sec), HoursAngle(hour, min), 12)) {
    DrawHoursHand(HoursAngle(hour, min), kColorWhite);
  } else if (IsInRange(HoursAngle(hour, min), 90, 15)) {
    DrawHoursHand(HoursAngle(hour, min), kColorWhite);
  } else if (IsInRange(HoursAngle(hour, min), 180, 15)) {
    DrawHoursHand(HoursAngle(hour, min), kColorWhite);
  } else if (IsInRange(HoursAngle(hour, min), 270, 15)) {
    DrawHoursHand(HoursAngle(hour, min), kColorWhite);
  }
  
  if (sec == 0) {
    DrawMinutesHand(MinutesAngle(old_min), kColorBlack);
    DrawMinutesHand(MinutesAngle(min), kColorWhite);
  } else if (SecondsHandOverlaps(SecondsAngle(old_sec), MinutesAngle(min), 12)) {
    DrawMinutesHand(MinutesAngle(min), kColorWhite);
  } else if (IsInRange(MinutesAngle(min), 90, 15)) {
    DrawHoursHand(MinutesAngle(min), kColorWhite);
  } else if (IsInRange(MinutesAngle(min), 180, 15)) {
    DrawHoursHand(MinutesAngle(min), kColorWhite);
  } else if (IsInRange(MinutesAngle(min), 270, 15)) {
    DrawHoursHand(MinutesAngle(min), kColorWhite);
  }
  
  // Draw seconds hand
  //DrawSecondsHand(SecondsAngle(sec), kColorLightGray);
};

const startTimers = () => {
  gTimer = setInterval(onSecond, kMillisecondsPerSecond);
};

Bangle.on('lcdPower', (on) => {
  if (on) {
    DrawAll();
    startTimers();
    Bangle.drawWidgets();
  } else {
    if (gTimer) {
      clearInterval(gTimer);
    }
  }
});

g.clear();
startTimers();
DrawAll();
Bangle.loadWidgets();
Bangle.drawWidgets();

//HRM Controller.
setWatch(function(){
  if(!gHrmState){
    console.log("Toggled HRM");
    //Turn on.
    Bangle.buzz();
    Bangle.setHRMPower(1);
    gCurrentHrm = "    ";
    gHrmState = true;
  } else if(gHrmState){
    console.log("Toggled HRM");
    //Turn off.
    Bangle.buzz();
    Bangle.setHRMPower(0);
    gHrmState = false;
  }
}, BTN1, { repeat: true, edge: "falling" });

Bangle.on('HRM', function(hrm) {
  if(hrm.confidence > 90){
    /*Do more research to determine effect algorithm for heartrate average.*/
    console.log(hrm.bpm);
    gCurrentHrm = hrm.bpm;
  }
});


// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });