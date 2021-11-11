const cli = require("clistyle");
const Storage = require("Storage");

const STATE = {
  index: 0
};

function getApps(){
  const exit_app = {
    name: 'Exit',
    special: true
  };
  const shutdown_app = {
    name: 'Shutdown',
    special: true
  };
  const raw_apps = Storage.list(/\.info$/).filter(app => app.endsWith('.info')).map(app => Storage.readJSON(app,1) || { name: "DEAD: "+app.substr(1) })
    .filter(app=>app.type=="app" || app.type=="clock" || !app.type)
    .sort((a,b)=>{
      var n=(0|a.sortorder)-(0|b.sortorder);
      if (n) return n; // do sortorder first
      if (a.name<b.name) return -1;
      if (a.name>b.name) return 1;
      return 0;
    }).map(raw => ({
      name: raw.name,
      src: raw.src,
      icon: raw.icon,
      version: raw.version
    }));

  const apps = [Object.assign({}, exit_app)].concat(raw_apps);
  apps.push(shutdown_app);
  return apps;
}

function render(){
  const app = APPS[STATE.index];

  cli.setFontSize(2);
  cli.clear(false);
  cli.printLine(app.name, cli.textColor.green, 2, true);
  if (app.version !== undefined) {
    cli.printLine("(v" + app.version + ")", cli.textColor.green, 3, false);
  }
}

function jumpTo(index){
  STATE.index = index;
  render();
}

function prev(){
  if(STATE.index == 0) {
    jumpTo(APPS.length-1);
  } else {
    jumpTo(STATE.index-1);
  }
}

function next(){
  if(STATE.index == APPS.length-1) {
    jumpTo(0);
  } else {
    jumpTo(STATE.index+1);
  }
}

function run(){
  const app = APPS[STATE.index];
  if(app.name == 'Exit') return load();
  if(app.name == 'Shutdown') {
    if (Bangle.softOff) {
      Bangle.softOff();
    }else {
      Bangle.off()
    }
  }
  if (Storage.read(app.src)===undefined) {
    E.showMessage("App Source\nNot found");
    setTimeout(render, 2000);
  } else {
    if (process.env.HWVERSION == 1) Bangle.setLCDMode();
    g.clear();
    g.flip();
    E.showMessage("Loading...");
    load(app.src);
  }

}

if (process.env.HWVERSION == 1) {
  // Screen event
  Bangle.on('touch', function(button){
    switch(button){
    case 1:
      prev();
      break;
    case 2:
      next();
      break;
    case 3:
      run();
      break;
    }
  });
}

if (process.env.HWVERSION == 2) {
  // tap at top 1/3 of screen to launch app
  Bangle.on('touch', function(button, xy) {
    if (xy.y < HEIGHT / 3)
      run();
  });
}

Bangle.on('swipe', dir => {
  if(dir == 1) prev();
  else next();
});

// close launcher when lcd is off
Bangle.on('lcdPower', on => {
  if(!on) return load();
});

if (process.env.HWVERSION == 1) {
  setWatch(prev, BTN1, { repeat: true });
  setWatch(next, BTN3, { repeat: true });
  setWatch(run, BTN2, { repeat:true });
} else {
  setWatch(run, BTN1, { repeat:true });
}

// Script:
const APPS = getApps();

g.clear();
g.flip();
Bangle.loadWidgets();
Bangle.drawWidgets();
jumpTo(1);
