var WeekDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

var Commands = ["","set time","gps enable","gps disable","change tz"];
var currentCommand = Commands[0];

var locale = require("locale");
var cli = require("clistyle");
cli.setFontSize(3);

function drawAll(){
  updateTime();
  updateDate(new Date());
  updateCmd(currentCommand);
}

function updateCmd(cmd){
  cli.printLine(cmd, cli.textColor.green, 4, true);
}

function updateDate(now){
  let date = locale.date(now,false);
  cli.printLine(WeekDays[now.getDay()], cli.textColor.green, 1, false);
  cli.printLine(date, cli.textColor.green, 2, false);
  cli.printLine("CW"+getWeekNumber(now).toString(),cli.textColor.green, 3, false);
}

function getWeekNumber(d) {
  let now = d;
  let onejan = new Date(now.getFullYear(), 0, 1);
  let week = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
  return week;
}

function updateTime(){
  if (!Bangle.isLCDOn()) return;
  let now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  h = h>=10?h:"0"+h;
  m = m>=10?m:"0"+m;
  cli.printLine(h+":"+m,cli.textColor.green, 0, false);
  if(now.getMinutes() == 0)
    updateDate(now);
}

function searchStringInArray (str, strArray) {
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return -1;
}

function nextCommand(){
  let max = Commands.length - 1;
  let index = searchStringInArray(currentCommand, Commands);
  
  // Default state:
  currentCommand = Commands[0];
  
  if (index != -1) {
    if (index == max) {
      currentCommand = Commands[0];
    } else {
      currentCommand = Commands[index + 1];
    }
  }
  updateCmd(currentCommand);
}

function previousCommand(){
  let max = Commands.length - 1;
  let index = searchStringInArray(currentCommand, Commands);
  
  // Default state:
  currentCommand = Commands[0];
  
  if (index != -1) {
    if (index == 0) {
      currentCommand = Commands[max];
    } else {
      currentCommand = Commands[index - 1];
    }
  }
  updateCmd(currentCommand);
}

function enter() {
  if (currentCommand == "") {
    Bangle.showLauncher();
  } else {
    // run command
  }
}

g.clear();
Bangle.loadWidgets();  
Bangle.drawWidgets();
drawAll();
Bangle.on('lcdPower',function(on) {
  if (on)
    drawAll();
});

setWatch(enter, BTN2, {repeat:true,edge:"falling"});
setWatch(previousCommand, BTN1, {repeat:true,edge:"falling"});
setWatch(nextCommand, BTN3, {repeat:true,edge:"falling"});
