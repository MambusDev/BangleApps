var tg = Graphics.createArrayBuffer(120,20,1,{msb:true});
var timg = {
  width:tg.getWidth(),
  height:tg.getHeight(),
  bpp:1,
  buffer:tg.buffer
};

var ag = Graphics.createArrayBuffer(160,160,2,{msb:true});
var aimg = {
  width:ag.getWidth(),
  height:ag.getHeight(),
  bpp:2,
  buffer:ag.buffer,
  palette:new Uint16Array([0,0x3D22,0x3D22,0xDFF9])
};
ag.setColor(1);
ag.fillCircle(80,80,79,79);
ag.setColor(0);
ag.fillCircle(80,80,69,69);

function arrow(r,c) {
  var arr_width = 14;
  var arr_length = 60;
  r=r*Math.PI/180;
  var p = Math.PI/2;
  ag.setColor(c);
  ag.fillPoly([
    80+arr_length*Math.sin(r), 80-arr_length*Math.cos(r),
    80+arr_width*Math.sin(r+p), 80-arr_width*Math.cos(r+p),
    80+arr_width*Math.sin(r-p), 80-arr_width*Math.cos(r-p),
  ]);
}

var oldHeading = 0;
Bangle.on('mag', function(m) {
  if (!Bangle.isLCDOn()) return;
  tg.clear();
  tg.setFont("6x8",1);
  tg.setColor(1);
  if (isNaN(m.heading)) {
    tg.setFontAlign(0,-1);
    tg.setFont("6x8",1);
    tg.drawString("Uncalibrated",60,4);
    tg.drawString("turn 360° around",60,12);
  }
  else {
    var msg = Math.round(m.heading).toString() + "°";

    tg.setFontAlign(0,0);
    tg.setFont("6x8",1);
    tg.drawString(msg,60,12);
  }
  g.drawImage(timg,0,0,{scale:2});

  ag.setColor(0);
  arrow(oldHeading,0);
  arrow(oldHeading+180,0);
  arrow(m.heading,2);
  arrow(m.heading+180,3);
  g.drawImage(aimg,40,50);
  oldHeading = m.heading;
});
Bangle.setCompassPower(1);