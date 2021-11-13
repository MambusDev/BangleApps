var WeekDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

var locale = require("locale");
var cli = require("clistyle");
cli.setFontSize(3);

function drawAll(){
  updateTime();
  updateDate(new Date());
}

function updateDate(now){
  let date = locale.date(now,false);
  cli.printLine(WeekDays[now.getDay()], cli.textColor.green, 1, false);
  cli.printLine(date, cli.textColor.green, 2, false);
  cli.printLine("CW"+getWeekNumber(now).toString(),cli.textColor.green, 3, false);
}

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

function getWeekNumber(d) {
  return ISO8601_week_no(d);
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

g.clear();
Bangle.loadWidgets();  
Bangle.drawWidgets();
drawAll();

Bangle.on('lcdPower',function(on) {
  if (on)
    drawAll();
});

setWatch(Bangle.showLauncher, BTN2, {repeat:false, edge:"falling"});
