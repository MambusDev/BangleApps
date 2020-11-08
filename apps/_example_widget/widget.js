/* run widgets in their own function scope so they don't interfere with
currently-running apps */
(() => {
  const s = require('Storage');
  const SETTINGS_FILE = 'widget.settings.json';
  const WIDGET_WIDTH = 28;
  let settings;

  function draw() {
    // Draw only, if user wants the widget to be drawn
    if (setting('showWidget') == false) {
      this.width = 0;
      return;
    }

    this.width = WIDGET_WIDTH;

    // reset the graphics context to defaults (color/font/etc)
    g.reset();
    
    // add your code
    g.drawString("X", this.x, this.y);
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
  WIDGETS["mywidget"]={
    area:setting('widgetArea'), // area as selected in settings
    width: WIDGET_WIDTH, // how wide is the widget? You can change this and call Bangle.drawWidgets() to re-layout
    draw:draw // called to draw the widget
  };
})()
