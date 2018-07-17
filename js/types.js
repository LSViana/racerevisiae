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
    this.height = height;
    this.active = true;
    this.lastTick = new Date();
    /**
     * @type {Number[]}
     */
    this.keys = [];
    /**
     * @type {GameMap[]}
     */
    this.maps = [];
    /**
     * @type {GameMap[]}
     */
    this.activeMaps = [];
    /**
     * @type {Movable[]}
     */
    this.activePlayers = [];
  }

  /**
   * @param {GameMap} map 
   */
  addActiveMap(map) {
    map.active = true;
    this.activeMaps.push(map);
  }

  /**
   * @param {GameMap} map 
   */
  deactivateMap(map) {
    let mapIndex = this.activeMaps.indexOf(map);
    if (mapIndex != -1) {
      map.active = false;
      this.activeMaps.splice(mapIndex, 1);
    }
  }

  tick(elapsed) {
    if (this.active) {
      for (let map of this.activeMaps)
        map.tick(elapsed);
      // Drawing after all
      redraw(this);
    }
  }

}

class Movable extends Drawable {
  constructor(userControlled = false, x, y, width, height, speed = 0, movingKeys) {
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
    this.movingKeys = movingKeys;
  }

  tick(elapsed) {
    if (this.userControlled) {
      let offsetX = 0;
      let offsetY = 0;
      if (gameController.keys[this.movingKeys.left] === true)
        offsetX -= this.speed;
      if (gameController.keys[this.movingKeys.right] === true)
        offsetX += this.speed;
      if (gameController.keys[this.movingKeys.top] === true)
        offsetY -= this.speed;
      if (gameController.keys[this.movingKeys.down] === true)
        offsetY += this.speed;
      this.accelerate(elapsed, offsetX, offsetY);
    }
    this.reduceAcceleration();
  }

  accelerate(elapsed, x, y) {
    this.accX += (x + (x - this.accX)) * this.dragX;
    this.accY += (y + (y - this.accY)) * this.dragY;
    if (Math.abs(this.accX) > this.maxAccX) {
      this.accX = this.accX > 0 ? this.maxAccX : -this.maxAccX;
    }
    if (Math.abs(this.accY) > this.maxAccY) {
      this.accY = this.accY > 0 ? this.maxAccY : -this.maxAccY;
    }
    this.spdX = this.accX * elapsed;
    this.spdY = this.accY * elapsed;
    this.x += this.spdX;
    this.y += this.spdY;
  }

  verifyCollision(other) {
    throw 'This method must be overridden';
  }

  reduceAcceleration() {
    if (Math.abs(this.accX) < 10e-3)
      this.accX = 0;
    else {
      this.accX *= this.accMultX;
    }
    //
    if (Math.abs(this.accY) < 10e-3)
      this.accY = 0;
    else
      this.accY *= this.accMultY;
  }

  /**
   * @param {GameMap} map
   * @param {Movable} other 
   */
  collideWithMovable(map, other) {
    if (this instanceof SCerevisiae) {
      if (other instanceof GameSugar) {
        let indexOfOther = map.items.indexOf(other);
        if (indexOfOther != -1) {
          map.items.splice(indexOfOther, 1);
        }
      }
    }
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
   * @param {Number} speed
   */
  constructor(userControlled = false, x, y, width, height, speed = 1, movingKeys) {
    super(userControlled, x, y, width, height, speed, movingKeys);
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

  /**
   * @param {Movable} other 
   */
  verifyCollision(other) {
    return (
        // From Left
        this.x + this.width >= other.x - other.width / 2 &&
        // From Top
        this.y + this.height >= other.y - other.height / 2 &&
        // From Right
        this.x - this.width <= other.x + other.width / 2 &&
        // From Bottom
        this.y - this.height <= other.y + other.height / 2
      );
  }

}

class MovableAtMap {
  /**
   * @param {GameMap} map 
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

  constructor(x, y, width, height, wallBounce = .1, active = false) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.wallBounce = wallBounce;
    this.active = active;
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

  addPlayer(player, allowedToCrossBorders = false) {
    if (this.active) {
      gameController.activePlayers.push(player);
    }
    let movableAtMap = new MovableAtMap(this, player, allowedToCrossBorders);
    this.players.push(movableAtMap);
  }

  removePlayer(player) {
    let indexOfMovable = -1;
    let movableAtMap = this.players.filter((a, index) => {
      let result = a.movable == player;
      if (result)
        indexOfMovable = index;
      return result;
    });
    if (indexOfMovable != -1) {
      this.players.splice(indexOfMovable, 1);
    }
    // Removing from active players
    if (this.active) {
      let indexOfPlayer = gameController.activePlayers.indexOf(player);
      if (indexOfPlayer != -1) {
        gameController.activePlayers.splice(indexOfPlayer, 1);
      }
    }
  }

  tick(elapsed) {
    for (let item of this.items) {
      item.tick(elapsed);
    }
    for (let player of this.players) {
      player.movable.tick(elapsed);
      if (!player.allowedToCrossBorders) {
        if (player.movable.x - player.movable.width < this.x) {
          player.movable.accX += player.movable.speed * this.wallBounce;
        } else if (player.movable.x + player.movable.width > this.x + this.width) {
          player.movable.accX -= player.movable.speed * this.wallBounce;
        } else if (player.movable.y - player.movable.height < this.y) {
          player.movable.accY += player.movable.speed * this.wallBounce;
        } else if (player.movable.y + player.movable.height > this.y + this.height) {
          player.movable.accY -= player.movable.speed * this.wallBounce;
        }
      }
    }
  }

}

class SliderMap extends GameMap {

  constructor(x, y, width, height, color1 = '#FF0F0F', color2 = '#0FFF0F', slideSpeed = 2, spawnRate = 1, itemTypes = [GameSugar], wallBounce = .1, active = false) {
    super(x, y, width, height, wallBounce, active);
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
    this.firstRect.y = this.y;
    this.firstRect.x = this.x;
    //
    this.secondRect = new Rectangle();
    this.secondRect.width = this.width;
    this.secondRect.height = this.height;
    this.secondRect.y = -this.height;
    this.secondRect.x = this.x;
  }

  tick(elapsed) {
    super.tick(elapsed);
    this.accumulatedMilisseconds += elapsed;
    this.firstRect.y += this.slideSpeed;
    this.secondRect.y += this.slideSpeed;
    // Rearranging map blocks
    if (this.firstRect.y > this.height) {
      this.firstRect.y = this.secondRect.y - this.secondRect.height;
    } else if (this.secondRect.y > this.height) {
      this.secondRect.y = this.firstRect.y - this.firstRect.height;
    }
    // Tick at items
    for (let item of this.items)
      item.tick(elapsed);
    // Verifying if there's any need to spawn an item
    // 1000 => a second, in ms
    if (Math.random() > .5) {
      if (this.accumulatedMilisseconds > 1000 / this.spawnRate) {
        // Should spawn an item
        let typeIndex = Math.round(Math.random() * (this.itemTypes.length - 1));
        let type = this.itemTypes[typeIndex];
        /**
         * @type {GameItem}
         */
        let item = type.getDefaultInstance();
        let x = Math.random() * (this.width - item.width * 2) + this.x;
        let y = -item.height * 2;
        item.x = x;
        item.y = y;
        item.speed = this.slideSpeed;
        this.items.push(item);
        this.accumulatedMilisseconds = 0;
      }
    }
    //
    this.verifyCollisions();
  }

  verifyCollisions() {
    for (let player of this.players) {
      for (let item of this.items) {
        if (player.movable.verifyCollision(item)) {
          player.movable.collideWithMovable(this, item);
          item.collideWithMovable(this, player.movable);
        }
      }
    }
  }

  draw() {
    let ctx = gameController.ctx2D;
    let _fillStyle = ctx.fillStyle;
    ctx.fillStyle = this.color1;
    ctx.fillRect(this.firstRect.x, this.firstRect.y, this.firstRect.width, this.firstRect.height);
    ctx.fillStyle = this.color2;
    ctx.fillRect(this.secondRect.x, this.secondRect.y, this.secondRect.width, this.secondRect.height);
    // Drawing items
    for (let item of this.items) {
      ctx.fillStyle = item.color;
      item.draw();
    }
    ctx.fillStyle = _fillStyle;
  }

  adjustSize(width, height) {
    this.width = width / 2;
    this.height = height;
  }

}

class GameItem extends Movable {
  constructor(x, y, width, height, speed, color) {
    super(false, x, y, width, height, speed);
    this.color = color;
  }

  static getDefaultInstance() {
    let color = "#" + getHexRandom() + getHexRandom() + getHexRandom();
    return new GameItem(0, 0, 0, 0, 0, color);
  }
}

class GameSugar extends GameItem {
  constructor(x, y, width, height, speed, color) {
    super(x, y, width, height, speed, color);
  }

  draw() {
    let ctx = gameController.ctx2D;
    //
    ctx.beginPath();
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    ctx.fill();
  }

  tick(elapsed) {
    this.y += this.speed;
  }

  static getDefaultInstance() {
    let color = "#f44242";
    return new GameSugar(0, 0, 50, 50, 1, color);
  }

}