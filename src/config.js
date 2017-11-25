import DAT from 'dat-gui';

Config.prototype.setUpGUI = function() {

  this.gui.add(this, 'pause').name("Pause Scene").onChange(function(value) {

    if (value) {
      this.pause = value;
    } else {
      this.pause = value;
    }
  });
}

export default function Config() {

  this.gui = new DAT.GUI();
  this.pause = false;
}