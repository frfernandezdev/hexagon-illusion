/* 
	by @frfernandez 
	https://github.com/frfernandezdev/hexagon-illusion
*/ 
debug = function() { console.debug(...arguments); };

const Illusion = (function() {
  if (this instanceof Window)
    throw new Error("This isn't function, is constructor");
  
  const self = this;
  
  // Static 
  SIZE  = 18;
  ITEM  = 18;
  STEP  = 8;
  LINE  = 2.5;
  GAP   = Math.floor(STEP - LINE);

  self.element = document.querySelector('#canvas');

  // Canvas
  self.canvas = self.element.querySelector('canvas');
  self.X      = self.canvas.width;
  self.Y      = self.canvas.height;
  
  // Center coords
  self.x = self.X / 2;
  self.y = self.Y / 2;

  // Direction coords
  self.coords = { x: self.x, y: self.y};

  // indicator animation rotate status
  self.active = false;

  // indicator direction of rotate increase/decrease
  self._rotateZ = false;

  // identifier of requestAnimationFrame
  self.rId = null;

  // Array with all offset and edge
  self.position = Array(ITEM)
  self.edge = 0;

  self.colors = ['#FFF','rgb(140, 84, 41)', 'rgb(84, 51, 26)'];

  self.busy = false;

  self._context = function() {
    return this.ctx = this.canvas.getContext('2d');
  };

  // Get context
  const ctx = self._context();

  ctx._base = function() {
    this._make(self.x, self.y, self.x, 1, null, self.colors[1]);
    this._make(self.x, self.y, (self.x - STEP - LINE), 1, null, self.colors[2]);
  };

  ctx._draw = function() {
    for (const {coords, size, line, stroke, fill, rotate} of self.position) {
      const {x, y} = coords;
      this._make(x, y, size, line, stroke, fill, rotate);
    }
  };

  ctx._make = function(x, y, size, lineWidth=10, strokeStyle=null, fillStyle=null, rotate=0) {
    this.beginPath();
    this.lineWidth = lineWidth;
    this.moveTo(x + size * Math.cos(rotate), y + size * Math.sin(rotate));
    
    for (let side=0; side < 7; side++) {
      const sx = x + size * Math.cos(rotate + (side * 2 * Math.PI / 6)),
            sy = y + size * Math.sin(rotate + (side * 2 * Math.PI / 6));
      
      // debug(x, y, sx, sy, side, size)
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

  self._init = function() {
    for (let index = 0; index < this.position.length; index++) {
      const b = this.position[index] = {};
      
      b.coords = {}
      b.coords.x = this.x, 
      b.coords.y = this.y;
      b.size = SIZE + STEP * index;
      b.line = LINE;
      b.stroke = this.colors[0];
      b.fill = index === 0 ? this.colors[0] : null;
      b.rotate = 0;
    }

    // this._makeCursor();
    ctx._base();
    ctx._draw();
  };

  self._computed = function() {
    for (let index=0; index < this.position.length; index++) {
      const current = this.position[index];
      const next = this.position[index +1];
      
      if (!next)
        continue; 

      if (this.coords.x < 251 && this.coords.x > 98) {
        if (current.coords.x >= next.coords.x + GAP)
          next.coords.x += 1;
      
        if (current.coords.x <= next.coords.x - GAP)  
          next.coords.x -= 1;
      }

      if (this.coords.y < 231 && this.coords.y > 80) {
        if (current.coords.y >= next.coords.y + GAP)
          next.coords.y += 1;
        
        if (current.coords.y <= next.coords.y - GAP)
          next.coords.y -= 1;
      }
    }
    ctx._base();
    ctx._draw();
  };

  self._clear = function() {
    ctx.clearRect(0,0, this.X, this.Y);
  }

  self._moveAt = function(e) {
    this.coords = {x: e.offsetX, y: e.offsetY};
    this._clear();
    this.position[0].coords = this.coords;
    requestAnimationFrame(this._computed.bind(this));
  };
	
	self._computedRotate = function() {
    for (let index=0; index < this.position.length; index++) {
      const current = this.position[index];
      const next = this.position[index +1];
      const limit = GAP * GAP/(index+GAP);

      if (!next)
        continue; 

      if (this._rotateZ && this.position[0].rotate === 0) {
        this.active = false;
        this._rotateZ = false;
      }

      if (!this._rotateZ && this.position[this.position.length -2].rotate === 2) {
        this.active = false;
        this._rotateZ = true;
        break;
      }
			
			if (!this._rotateZ && current.rotate >= next.rotate + limit)
        next.rotate += 1; 
      
      if (this._rotateZ && current.rotate !== 0 && current.rotate <= next.rotate)
        next.rotate -= 1; 
    }
    ctx._base();
    ctx._draw();
	}

  self._rotate = function() {
    if (this._rotateZ)
      this.position[0].rotate -= 1;
    else
      this.position[0].rotate += 1;
    
    if (!this.active) {
      cancelAnimationFrame(this.rId);
      return;
    }

    this._computedRotate();
    self.rId = requestAnimationFrame(this._rotate.bind(this));
  };

  self.onclick = function() {
    if (self.active)
      return;

    self.active = true;
    self._rotate();
  }

  self._init();

  window.onload = () => {
    self.canvas.onmousedown = () => {  
      self.canvas.onmousemove = (e) => self._moveAt(e);
      self.canvas.onmouseup = () => {
        self.canvas.onmousemove = null;
        self.canvas.onmouseup = null;
      };
    };

    const rect =  self.canvas.getBoundingClientRect();
    self.canvas.ontouchmove = (e) => {
      self._moveAt({offsetX: e.changedTouches[0].pageX - rect.x, offsetY: e.changedTouches[0].pageY - rect.y});
    };
    self.canvas.ondblclick = self.onclick.bind(self);
  };
  
});

const illusion = new Illusion();
