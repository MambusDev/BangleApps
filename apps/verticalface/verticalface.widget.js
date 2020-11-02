(() => {
  require("Font7x11Numeric7Seg").add(Graphics);

  function draw() {
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

  // add your widget
  WIDGETS["verticalface"]={
    area:"tl", // tl (top left), tr (top right), bl (bottom left), br (bottom right)
    width: 50, // how wide is the widget? You can change this and call Bangle.drawWidgets() to re-layout
    draw:draw // called to draw the widget
  };
})()