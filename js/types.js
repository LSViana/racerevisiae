class Rectangle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

class GameObject {
  /**
   * @param {Number} elapsed Amount of milisseconds elapsed since last tick
   */
  tick(elapsed) {
    throw Error("This method must be overridden");
    // This method must be overriden
  }
}

class Drawable extends GameObject {
  draw() {
    throw Error("This method must be overridden");
    // Must be overridden at children classes
  }
}

class GameController extends GameObject {
  /**
   * Standard constructor
   * @param {CanvasRenderingContext2D} ctx2D 
   * @param {Number} width 
   * @param {Number} height 
   */
  constructor(ctx2D, width, height) {
    super();
    this.ctx2D = ctx2D;
    this.width = width;
    this.height = width;
    this.lastTick = new Date();
    /**
     * @type {Player[]}
     */
    this.leftUserPlayers = [];
    /**
     * @type {Number[]}
     */
    this.keys = [];
    /**
     * @type {GameMap[]}
     */
    this.maps = [];
    /**
     * @type {GameMap}
     */
    this.activeMap = null;
  }

  /**
   * @param {Movable} player 
   */
  addLeftPlayer(player) {
    this.leftUserPlayers.push(player);
    this.activeMap.players.push(new MovableAtMap(this.activeMap, player));
  }

  tick(elapsed) {
    this.activeMap.tick(elapsed);
    for(let player of this.leftUserPlayers)
      player.tick(elapsed);
    // Drawing after all
    redraw(this);
  }

}

class Movable extends Drawable {
  constructor(userControlled = false, x, y, width, height, speed = 0) {
    super();
    this.userControlled = userControlled;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.accX = 0;
    this.accY = 0;
    this.maxAccX = 1;
    this.maxAccY = 1;
    this.dragX = .01;
    this.dragY = .01;
    this.accMultX = .97;
    this.accMultY = .97;
    this.spdX = 0;
    this.spdY = 0;
  }

  tick(elapsed) {
    let offsetX = 0;
    let offsetY = 0;
    if(gameController.keys[65] === true)
      offsetX -= this.speed;
    if(gameController.keys[68] === true)
      offsetX += this.speed;
    if(gameController.keys[87] === true)
      offsetY -= this.speed;
    if(gameController.keys[83] === true)
      offsetY += this.speed;
    this.reduceAcceleration();
    this.accelerate(elapsed, offsetX, offsetY);
  }

  accelerate(elapsed, x, y) {
    this.accX += (x + (x - this.accX)) * this.dragX;
    this.accY += (y + (y - this.accY)) * this.dragY;
    if(Math.abs(this.accX) > this.maxAccX) {
      this.accX = this.accX > 0 ? this.maxAccX : -this.maxAccX;
    }
    if(Math.abs(this.accY) > this.maxAccY) {
      this.accY = this.accY > 0 ? this.maxAccY : -this.maxAccY;
    }
    this.spdX = this.accX * elapsed;
    this.spdY = this.accY * elapsed;
    this.x += this.spdX;
    this.y += this.spdY;
  }

  reduceAcceleration() {
    if(Math.abs(this.accX) < 10e-3)
      this.accX = 0;
    else {
      this.accX *= this.accMultX;
    }
    //
    if(Math.abs(this.accY) < 10e-3)
      this.accY = 0;
    else
      this.accY *= this.accMultY;
  }

}

class SCerevisiae extends Movable {
  /**
   * 
   * @param {Boolean} userControlled 
   * @param {Number} x 
   * @param {Number} y 
   * @param {Number} width 
   * @param {Number} height 
   */
  constructor(userControlled = false, x, y, width, height, speed = 1) {
    super(userControlled);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
  }

  draw() {
    let ctx = gameController.ctx2D;
    //
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI);
    ctx.fill();
  }

  tick(elapsed) {
    super.tick(elapsed);
  }

}

class MovableAtMap {
  /**
   * @param {Map} map 
   * @param {Movable} movable 
   * @param {Boolean} allowedToCrossBorders 
   */
  constructor(map, movable, allowedToCrossBorders = false) {
    this.map = map;
    this.movable = movable;
    this.allowedToCrossBorders = allowedToCrossBorders;
  }
}

class GameMap extends Drawable {

  constructor(x, y, width, height, wallBounce = .1) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.wallBounce = wallBounce;
    /**
     * @type {GameItem[]}
     */
    this.items = [];
    /**
     * @type {MovableAtMap[]}
     */
    this.players = [];
  }

  adjustSize(width, height) {
    throw Error("This method must be overridden");
  }

  tick(elapsed) {
    for(let item of this.items) {
      item.tick(elapsed);
    }
    for(let player of this.players) {
      if(!player.allowedToCrossBorders) {
        if(player.movable.x - player.movable.width < this.x) {
          player.movable.accX += player.movable.speed * this.wallBounce;
        } else if(player.movable.x + player.movable.width > this.x + this.width) {
          player.movable.accX -= player.movable.speed * this.wallBounce;
        } else if(player.movable.y - player.movable.height < this.y) {
          player.movable.accY += player.movable.speed * this.wallBounce;
        } else if(player.movable.y + player.movable.height > this.y + this.height) {
          player.movable.accY -= player.movable.speed * this.wallBounce;
        }
      }
    }
  }

}

class SliderMap extends GameMap {

  constructor(x, y, width, height, color1 = '#FF0F0F', color2 = '#0FFF0F', slideSpeed = 2, spawnRate = 1, itemTypes = [GameSugar]) {
    super(x, y, width, height);
    this.color1 = color1;
    this.color2 = color2;
    this.spawnRate = spawnRate;
    this.itemTypes = itemTypes;
    this.slideSpeed = slideSpeed;
    this.accumulatedMilisseconds = 0;
    this.initializeRects();
  }

  initializeRects() {
    this.firstRect = new Rectangle();
    this.firstRect.width = this.width;
    this.firstRect.height = this.height;
    this.firstRect.y = 0;
    this.firstRect.x = 0;
    //
    this.secondRect = new Rectangle();
    this.secondRect.width = this.width;
    this.secondRect.height = this.height;
    this.secondRect.y = -this.height;
    this.secondRect.x = 0;
  }

  tick(elapsed) {
    super.tick(elapsed);
    this.accumulatedMilisseconds += elapsed;
    this.firstRect.y += this.slideSpeed;
    this.secondRect.y += this.slideSpeed;
    // Rearranging map blocks
    if(this.firstRect.y > this.height) {
      this.firstRect.y = this.secondRect.y - this.secondRect.height;
    } else if(this.secondRect.y > this.height) {
      this.secondRect.y = this.firstRect.y - this.firstRect.height;
    }
    // Verifying if there's any need to spawn an item
    // 1000 => a second, in ms
    if(this.accumulatedMilisseconds > 1000 / this.spawnRate) {
      // Should spawn an item
      let typeIndex = Math.round(Math.random() * (this.itemTypes.length - 1));
      let type = this.itemTypes[typeIndex];
      /**
       * @type {GameItem}
       */
      let item = type.getDefaultInstance();
      let x = Math.random() * (this.width - item.width * 2) + this.width;
      let y = -item.height * 2;
      this.accumulatedMilisseconds = 0;
    }
  }

  draw() {
    let ctx = gameController.ctx2D;
    let _fillStyle = ctx.fillStyle;
    ctx.fillStyle = this.color1;
    ctx.fillRect(this.firstRect.x, this.firstRect.y, this.firstRect.width, this.firstRect.height);
    ctx.fillStyle = this.color2;
    ctx.fillRect(this.secondRect.x, this.secondRect.y, this.secondRect.width, this.secondRect.height);
    ctx.fillStyle = _fillStyle;
  }

  adjustSize(width, height) {
    this.width = width / 2;
    this.height = height;
  }

}

class GameItem extends Movable {
  constructor(x, y, width, height, speed) {
    super(false, x, y, width, height, speed);
  }

  static getDefaultInstance() {
    return new GameItem(0, 0, 0, 0, 0);
  }
}

class GameSugar extends GameItem {
  constructor(x, y, width, height, speed) {
    super(x, y, width, height, speed);
  }

  draw() {
    let ctx = gameController.ctx2D;
    //
    ctx.beginPath();
    ctx.moveTo(this.x - this.width / 2, this.y - this.height / 2);
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    ctx.fill();
  }

  static getDefaultInstance() {
    return new GameSugar(0, 0, 50, 50, 1);
  }

}