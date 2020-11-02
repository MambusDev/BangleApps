var storage = require('Storage');

const settings = storage.readJSON('setting.json',1) || { HID: false };

var sendHid, next, prev, playpause, stop, up, down, profile;

if (settings.HID=="kbmedia") {
  profile = 'Music';
  sendHid = function (code, cb) {
    try {
      NRF.sendHIDReport([1,code], () => {
        NRF.sendHIDReport([1,0], () => {
          if (cb) cb();
        });
      });
    } catch(e) {
      print(e);
    }
  };
  next = function (cb) { sendHid(0x01, cb); };
  prev = function (cb) { sendHid(0x02, cb); };
  playpause = function (cb) { sendHid(0x10, cb); };
  stop = function (cb) { sendHid(0x04, cb); };
  up = function (cb) {sendHid(0x40, cb); };
  down = function (cb) { sendHid(0x80, cb); };
} else {
  E.showPrompt("Enable HID?",{title:"HID disabled"}).then(function(enable) {
    if (enable) {
      settings.HID = "kbmedia";
      require("Storage").write('setting.json', settings);
      setTimeout(load, 1000, "hidmsic.app.js");
    } else setTimeout(load, 1000);
  });
}

function drawLeftArrow(x, y, height, length, color, filled) {
  g.setColor(color);
  if (filled) {
    g.fillPoly([
      x, y + (height / 2),
      x + length, y,
      x + length, y + height
    ]);
  } else {
    g.drawPoly([
      x, y + (height / 2),
      x + length, y,
      x + length, y + height
    ]);
  }
}

function drawRightArrow(x, y, height, length, color, filled) {
  g.setColor(color);
  if (filled) {
    g.fillPoly([
      x, y + height,
      x, y,
      x + length, y + (height / 2)
    ]);
  } else {
    g.drawPoly([
      x, y + height,
      x, y,
      x + length, y + (height / 2)
    ]);
  }
}

function drawNext() {
  var white = '#ffffff';
  var size = 15;

  // draw next
  drawRightArrow(g.getWidth() - size, (g.getHeight() / 2) - (size / 2), size, size, white, true);
  drawRightArrow(g.getWidth() - 2 * size, (g.getHeight() / 2) - (size / 2), size, size, white, true);
}

function drawPrevious() {
  var white = '#ffffff';
  var size = 15;

  // draw previous
  drawLeftArrow(0, (g.getHeight() / 2) - (size / 2), size, size, white, true);
  drawLeftArrow(0 + size, (g.getHeight() / 2) - (size / 2), size, size, white, true);
}

function drawPlay() {
  var white = '#ffffff';
  var size = 50;

  // draw play
  drawRightArrow((g.getWidth() / 2) - (size / 2), (g.getHeight() / 2) - (size / 2), size, size, white, true);
}

function drawPause() {
  var green = '#40e020';
  var size = 50;

  g.setColor(green);
  // Left rectangle
  g.drawRect(g.getWidth() / 2 - size / 2, g.getHeight() / 2 + size / 2, g.getWidth() / 2 - size / 4, g.getHeight() / 2 - size / 2);

  // Right rectangle
  g.drawRect(g.getWidth() / 2 + size / 4, g.getHeight() / 2 + size / 2, g.getWidth() / 2 + size / 2, g.getHeight() / 2 - size / 2);
  }

function drawUp() {
  var green = '#40e020';

  g.setColor(green);
  g.setFont("6x8",4);
  g.setFontAlign(0,0);
  g.drawString("+", g.getWidth() - 15, g.getHeight() * 1/6 );
}

function drawDown() {
  var green = '#40e020';

  g.setColor(green);
  g.setFont("6x8",4);
  g.setFontAlign(0,0);
  g.drawString("-", g.getWidth() - 15, g.getHeight() * 5/6 );
}

function drawApp() {
  g.clear();
  const d = g.getWidth() - 18;

  drawUp();
  drawDown();
  drawNext();
  drawPrevious();
  drawPlay();
  drawPause();
  Bangle.drawWidgets();


  

  function c(a) {
    return {
      width: 8,
      height: a.length,
      bpp: 1,
      buffer: (new Uint8Array(a)).buffer
    };
  }
}

Bangle.on('swipe', dir => {
  if (next) {
    if(dir == 1) {
      prev();
    } else {
      next();
    }
  }
});

Bangle.on('touch', button => {
  if (next) {
    if (button == 1) {
      prev();
    } else if (button == 2) {
      next();
    } else if (button == 3) {
      playpause();
    }
    setTimeout(drawApp, 1000);
  }
});

// Load and draw widgets
Bangle.loadWidgets();

if (next) {
  setWatch(function(e) {
      up();
      setTimeout(drawApp, 1000);
  }, BTN1, { edge:"falling",repeat:true,debounce:50});

  setWatch(function(e) {
      setTimeout(drawApp, 1000);
      down(() => {});
  }, BTN3, { edge:"falling",repeat:true,debounce:50});

  // Show launcher when middle button pressed
  setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling", debounce:50});

  drawApp();
}
