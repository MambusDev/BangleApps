(function(){
  let settings;
  const s = require('Storage');
  const SETTINGS_FILE = 'setting.json';
  var img_bt = E.toArrayBuffer(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="));

  function draw() {
    g.reset();
    g.clearRect(this.x, this.y, this.x+24, this.y+24);

    if (setting("ble")) {
      g.setColor(0,0.5,1); //blue
      if (NRF.getSecurityStatus().connected) {
        g.setColor(0,0.5,1); //blue
        g.fillRect(this.x+3, this.y+11, this.x+4, this.y+12);
        g.fillRect(this.x+16, this.y+11, this.x+17, this.y+12);
      }
    } else {
      g.setColor(0.3,0.3,0.3); //grey
    }

    g.drawImage(img_bt,5+this.x,2+this.y);
  }

  function changed() {
    WIDGETS["bluetooth"].draw();
    g.flip();// turns screen on
  }

  //load settings
  function loadSettings() {
    settings = s.readJSON(SETTINGS_FILE, 1) || {};
  }

  //return setting
  function setting(key) {
    //define default settings
    const DEFAULTS = {
      'ble' : false,
    };
    if (!settings) { loadSettings(); }
    return (key in settings) ? settings[key] : DEFAULTS[key];
  }

  NRF.on('connect',changed);
  NRF.on('disconnect',changed);
  WIDGETS["bluetooth"]={area:"tr",width:24,draw:draw};
})()
