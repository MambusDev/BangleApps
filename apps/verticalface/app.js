// Load fonts
require("Font8x12").add(Graphics);
require("Font7x11Numeric7Seg").add(Graphics);
let HRMstate = false;
let currentHRM = "CALC";


function drawTimeDate() {
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes(), day = d.getDate(), month = d.getMonth(), weekDay = d.getDay();
  
  if (h < 10) {
    h = "0" + h;
  }
  
  if (m < 10) {
    m = "0" + m;
  }

  var daysOfWeek = ["SUN", "MON", "TUE","WED","THU","FRI","SAT"];
  var hours = (" "+h).substr(-2);
  var mins= ("0"+m).substr(-2);
  var date = `${daysOfWeek[weekDay]}|${day}|${("0"+(month+1)).substr(-2)}`;

  // Reset the state of the graphics library
  g.reset();

  // draw the current time (4x size 7 segment)
  g.setFont("7x11Numeric7Seg",7);
  g.setFontAlign(-1,0); // align right bottom
  
  // Set color
  g.setColor('#202020');
  g.drawString(88, 25, 75, true /*not clear background*/);
  g.drawString(88, 25, 165, true /*not clear background*/);
  
  // Set color
  g.setColor('#2ecc71');
  g.drawString(hours, 25, 75, false /*not clear background*/);
  g.drawString(mins, 25, 165, false /*not clear background*/);

  // draw the date (2x size 7 segment)
  g.setFont("6x8",2);
  g.setFontAlign(-1,0); // align right bottom
  g.drawString(date, 20, 215, true /*clear background*/);
}


//We will create custom "Widgets" for our face.
var g_steps = 0;

const storage = require("Storage");

// Data is stored to this file by active pedometer
function getImportFileName() {
  now = new Date();
  // Add leading zero to month
  month = now.getMonth() + 1;
  if (month < 10) month = "0" + month;
  filename = "activepedom" + now.getFullYear() + month + now.getDate() + ".data";
  return filename;
}

var history = 86400000; // 28800000=8h 43200000=12h //86400000=24h

function getStepsFromCSV(file) {
  i = 0;
  column = 1; // column that holds steps
  array = [];
  now = new Date();
  while ((nextLine = file.readLine())) { //as long as there is a next line
    if(nextLine) {
      dataSplitted = nextLine.split(','); //split line, 
      diff = now - dataSplitted[0]; //calculate difference between now and stored time
      if (diff <= history) { //only entries from the last x ms
        array.push(dataSplitted[column]);
      }
    }
    i++;
  }

  // Return 0 if file was empty / missing
  if (array.length > 0) {
    return array[array.length-1];
  }

  return null;
}

function importSteps() {
    filename = getImportFileName();
    csv_file = storage.open(filename, "r");
    csv_steps = getStepsFromCSV(csv_file);

    if(csv_steps != null) {
      g_steps = csv_steps;
    } else {
      g_steps = 0;
    }
}


function drawSteps() {
  //Reset to defaults.
  g.reset();
  // draw the date (2x size 7 segment)
  g.setColor('#7f8c8d');
  g.setFont("8x12",2);
  g.setFontAlign(-1,0); // align right bottom
  g.drawString("STEPS", 145, 40, true /*clear background*/);
  g.setColor('#bdc3c7');
  g.drawString(g_steps.toString(), 145, 65, true /*clear background*/);
}

function drawBPM(on) {
  //Reset to defaults.
  g.reset();
  g.setColor('#7f8c8d');
  g.setFont("8x12",2);
  g.setFontAlign(-1,0);
  var heartRate = 0;

  if(on){
    g.drawString("BPM", 145, 105, true);
    g.setColor('#e74c3c');
    g.drawString("*", 190, 105, false);
    g.setColor('#bdc3c7');
    //Showing current heartrate reading.
    heartRate = currentHRM.toString() + "    ";
    return g.drawString(heartRate, 145, 130, true /*clear background*/);
  } else {
    g.drawString("BPM  ", 145, 105, true /*clear background*/);
    g.setColor('#bdc3c7');
    return g.drawString("-    ", 145, 130, true); //Padding
  }
}

function drawBattery() {
  let charge = E.getBattery();
  //Reset to defaults.
  g.reset();
  // draw the date (2x size 7 segment)
  g.setColor('#7f8c8d');
  g.setFont("8x12",2);
  g.setFontAlign(-1,0); // align right bottom
  g.drawString("CHARGE", 145, 170, true /*clear background*/);
  g.setColor('#bdc3c7');
  // This clears complete battery charge field:
  g.drawString("    ", 145, 195, true /*clear background*/);
  g.drawString(`${charge}%`, 145, 195, true /*clear background*/);
}


// Clear the screen once, at startup
g.clear();

// Load and draw widgets
Bangle.loadWidgets();

// Remove own widget
delete WIDGETS['verticalface'];

Bangle.drawWidgets();

// draw immediately at first
drawTimeDate();
importSteps();
drawSteps();
drawBPM();
drawBattery();

var secondInterval = setInterval(()=>{
  drawTimeDate();
}, 15000);

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    secondInterval = setInterval(()=>{
      drawTimeDate();
    }, 15000);
    //Screen on
    drawBPM(HRMstate);
    drawTimeDate();
    drawBattery();
    importSteps();
    drawSteps();
  } else {
    //Screen off
    clearInterval(secondInterval);
  }
});

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });

//HRM Controller.
setWatch(function(){
  if(!HRMstate){
    console.log("Toggled HRM");
    //Turn on.
    Bangle.buzz();
    Bangle.setHRMPower(1);
    currentHRM = "CALC";
    HRMstate = true;
  } else if(HRMstate){
    console.log("Toggled HRM");
    //Turn off.
    Bangle.buzz();
    Bangle.setHRMPower(0);
    HRMstate = false;
    currentHRM = [];
  }
  drawBPM(HRMstate);
}, BTN1, { repeat: true, edge: "falling" });

Bangle.on('HRM', function(hrm) {
  if(hrm.confidence > 90){
    /*Do more research to determine effect algorithm for heartrate average.*/
    console.log(hrm.bpm);
    currentHRM = hrm.bpm;
    drawBPM(HRMstate);
  }
});
