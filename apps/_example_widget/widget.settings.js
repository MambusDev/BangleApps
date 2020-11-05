// This file should contain exactly one function, which shows the app's settings
/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const SETTINGS_FILE = 'widget.settings.json';
  const AREAS = ['tl', 'tr', 'bl', 'br'];

  // initialize with default settings...
  let s = {
    'showWidget': false,
    'widgetArea': "tl",
  };
  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage');
  const saved = storage.readJSON(SETTINGS_FILE, 1) || {};
  for (const key in saved) {
    s[key] = saved[key];
  }

  // creates a function to safe a specific setting, e.g.  save('color')(1)
  function save(key) {
    return function (value) {
      s[key] = value;
      storage.write(SETTINGS_FILE, s);
      //WIDGETS["activepedom"].draw();
    };
  }

  const menu = {
    '': { 'title': 'My example Widget' },
    '< Back': back,
    'Show widget': {
      value: s.showWidget,
      format : v => v?"On":"Off",
      onchange: save('showWidget'),
    },
    'Widget area': {
      format: () => s.widgetArea,
      onchange:  function () {
        // cycles through options
        const oldIndex = AREAS.indexOf(s.widgetArea);
        const newIndex = (oldIndex + 1) % AREAS.length;
        s.widgetArea = AREAS[newIndex];
        save('widgetArea')(s.widgetArea);
      },
    },
  };
  E.showMenu(menu);
});