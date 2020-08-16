debug = function() { console.debug(...arguments); };

const Illusion = (function() {
  if (this instanceof Window)
    throw new Error("This isn't function, is constructor");
  
  const self = this;
  
  // Static 
  SIZE  = 25;
  HEXAS = 18;

  self.element = document.querySelector('#canvas');

  // Canvas
  self.canvas = self.element.querySelector('canvas');
  self.X      = self.canvas.width;
  self.Y      = self.canvas.height;
  
  // Center coords
  self.x = self.X / 2;
  self.y = self.Y / 2;

  // Direction coords
  self.coords = [0, 0];
  
  // Array with all offset and edge
  self.position = Array(HEXAS).fill(0);
  self.edge = 0;

  self.colors = ['#FFF','rgb(140, 84, 41)', 'rgb(84, 51, 26)'];

  self._context = function() {
    return this.ctx = this.canvas.getContext('2d');
  };

  // Get context
  const ctx = self._context();

  ctx.save();

  ctx.init = function() {
    this.base();
    this.draw();
  };

  ctx.base = function() {
    this.make(self.x, self.y, 176, 1, null, self.colors[1]);
    this.make(self.x, self.y, 170, 1, null, self.colors[2]);
  };

  ctx.draw = function() {
    for (let index=0, size=SIZE; index<HEXAS; index++, size+=8) {      
      if (self.edge === index && self.position[index] && !(self.position[index]%5) && self.edge < HEXAS) {
        self.edge++;
      }

      if (self.edge >= index)
        self.position[index]++;

      let [x, y] = self._computed(index);
      let strokeStyle = self.colors[0];
      let fillStyle = index === 0 ? self.colors[0]: null;
      
      this.make(x, y, size, 2.4, strokeStyle, fillStyle); 
    }
  };

  ctx.make = function(x, y, size, lineWidth=10, strokeStyle=null, fillStyle=null) {
    this.beginPath();
    this.lineWidth = lineWidth;
    this.moveTo(x + size * Math.cos(0), y + size * Math.sin(0));
    
    for (let side=0; side < 7; side++) {
      const sx = x + size * Math.cos(side * 2 * Math.PI / 6),
            sy = y + size * Math.sin(side * 2 * Math.PI / 6);
      
      this.lineTo(sx, sy);
    }

    if (strokeStyle) {
      this.strokeStyle = strokeStyle;
      this.stroke();
    }

    if (fillStyle) {
      this.fillStyle = fillStyle;
      this.fill();    
    }
  };

  self._computed = function(index) {
    let x = this.x;
    let y = this.y;
    let offset = this.position[index];

    let [cx, cy] = this.coords;

    if (!cx && !cy)
      return [x, y];

    // it move to left 
    if (cx > 0)
      x += offset;
    // it move to right
    if (cx < 0)
      x -= offset;
    // it move to up
    if (cy > 0)
      y += offset;
    // it move to down
    if (cy < 0)
      y -= offset;

    return [x, y];
  };

  self.init = () => ctx.init();

  self._animate = function() {
    ctx.init();
    
    if (this.edge === HEXAS) {
      this.position = Array(HEXAS).fill(0);
      this.edge = 0;
      return cancelAnimationFrame(this.rid);
    }

    this.rid = requestAnimationFrame(this._animate.bind(this));
  }

  self.moveTo = function(coords) {
    this.coords = coords;

    this._animate();
  };

  self.rotate = function(degrade) {

  };


});

const illusion = new Illusion();
illusion.init();


// document.querySelector('#canvas > canvas').addEventListener('mousemove', debug)

window.addEventListener('keyup', (e) => {
  if ([40,38,39,37].indexOf(e.which) < 0)
    return;
  
  switch(e.which) {
    case 40: // key up
      illusion.moveTo([0, 1]);
      break;
    case 38: // key down
      illusion.moveTo([0, -1]);
      break;
    case 39: // key left
      illusion.moveTo([1, 0]);
      break;
    case 37: // key right
      illusion.moveTo([-1, 0]);
      break;
  }
});



