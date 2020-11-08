(() => {
  const s = require('Storage');
  const SETTINGS_FILE = 'verticalface.settings.json';
  const WIDGET_WIDTH = 75;
  let settings;
  require("Font7x11Numeric7Seg").add(Graphics);

  function draw() {
    // Draw only, if user wants the widget to be drawn
    if (setting('showWidget') == false) {
      this.width=0;
      return;
    }

    this.width = WIDGET_WIDTH;

    var d = new Date();
    var h = d.getHours(), m = d.getMinutes();

    if (h < 10) {
        h = "0" + h;
    }
    
    if (m < 10) {
        m = "0" + m;
    }

    var hours = (" "+h).substr(-2);
    var mins= ("0"+m).substr(-2);

    g.reset(); // reset the graphics context to defaults (color/font/etc)
    g.setFont("7x11Numeric7Seg",2);
    g.setColor('#202020');
    g.drawString(88 + ":" + 88, this.x + 5, this.y);
  
    g.setColor('#2ecc71');
    g.drawString(hours + ":" + mins, this.x + 5, this.y);
  }

  //load settings
  function loadSettings() {
    settings = s.readJSON(SETTINGS_FILE, 1) || {};
  }

  //return setting
  function setting(key) {
    //define default settings
    const DEFAULTS = {
      'showWidget' : false,
      'widgetArea' : "tl",
    };
    if (!settings) { loadSettings(); }
    return (key in settings) ? settings[key] : DEFAULTS[key];
  }

  // add your widget
  WIDGETS["verticalface"]={
    area:setting('widgetArea'),
    width: WIDGET_WIDTH, // how wide is the widget? You can change this and call Bangle.drawWidgets() to re-layout
    draw:draw // called to draw the widget
  };
})()