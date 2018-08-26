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
  constructor(userControlled = false, x, y, width, height, speed = 0, movingKeys, backgroundImage) {
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
    this.backgroundImage = backgroundImage;
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
  constructor(userControlled = false, x, y, width, height, speed = 1, movingKeys, backgroundImage, rotationFactor = 1) {
    super(userControlled, x, y, width, height, speed, movingKeys, backgroundImage);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.rotationFactor = rotationFactor;
    //
    this.initializeMovable();
  }

  initializeMovable() {
    if(this.backgroundImage) {
      let id = guid();
      let img = document.createElement("img");
      document.body.appendChild(img);
      img.id = id;
      img.setAttribute("src", this.backgroundImage);
      img.style.display = "none";
      this.backgroundImageElement = img;
    }
  }

  draw() {
    let ctx = gameController.ctx2D;
    if(this.backgroundImage) {
      let rotation = this.accX;
      ctx.translate(this.x, this.y);
      ctx.rotate(rotation * this.rotationFactor);
      ctx.translate(-this.x, -this.y);
      ctx.drawImage(this.backgroundImageElement, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
      ctx.translate(this.x, this.y);
      ctx.rotate(-rotation * this.rotationFactor);
      ctx.translate(-this.x, -this.y);
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI);
      ctx.fill();
    }
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

  constructor(x, y, width, height, wallBounce = .1, active = false, backgroundAmount = 2, backgroundImages = null) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.wallBounce = wallBounce;
    this.active = active;
    this.backgroundAmount = backgroundAmount;
    this.backgroundImages = backgroundImages;
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
        if (player.movable.x - player.movable.width / 2 < this.x) {
          player.movable.accX += player.movable.speed * this.wallBounce;
        } else if (player.movable.x + player.movable.width / 2 > this.x + this.width) {
          player.movable.accX -= player.movable.speed * this.wallBounce;
        } else if (player.movable.y - player.movable.height / 2 < this.y) {
          player.movable.accY += player.movable.speed * this.wallBounce;
        } else if (player.movable.y + player.movable.height / 2 > this.y + this.height) {
          player.movable.accY -= player.movable.speed * this.wallBounce;
        }
      }
    }
  }

}

class SliderMap extends GameMap {

  constructor(x, y, width, height, colors = [ '#FF0F0F', '#0FFF0F' ], slideSpeed = 2, spawnRate = 1, itemTypes = [GameSugar], wallBounce = .1, active = false, backgroundAmount = 2, backgroundImages) {
    super(x, y, width, height, wallBounce, active, backgroundAmount, backgroundImages);
    this.colors = colors;
    this.spawnRate = spawnRate;
    this.itemTypes = itemTypes;
    this.slideSpeed = slideSpeed;
    this.accumulatedMilisseconds = 0;
    this.initializeMap();
  }

  initializeMap() {
    //#region Rectangles
    this.rects = [];
    for(let i = 0; i < this.backgroundAmount; i++) {
      let rect = new Rectangle();
      rect.width = this.width;
      rect.height = this.height;
      rect.y = this.y - (this.height * i);
      rect.x = this.x;
      this.rects.push(rect);
    }
    this.nextRectNumber = this.rects.length - 1;
    //#endregion
    //#region Background Images
    if(this.backgroundImages) {
      this.backgroundDictionary = [];
      for(let backgroundImage of this.backgroundImages) {
        let id = guid();
        let img = document.createElement("img");
        img.id = id;
        img.setAttribute("src", backgroundImage);
        this.backgroundDictionary.push({
          backgroundImageURI: backgroundImage,
          backgroundImageElement: img
        });
        img.style.display = "none";
        document.body.appendChild(img);
      }
    }
    //#endregion
  }
  
  tick(elapsed) {
    super.tick(elapsed);
    this.accumulatedMilisseconds += elapsed;
    for(let rect of this.rects) {
      rect.y += this.slideSpeed;
    }
    // Rearranging map blocks
    for(let i = 0; i < this.rects.length; i++) {
      let rect = this.rects[i];
      if(rect.y > this.height) {
        let nextRect = this.rects[this.nextRectNumber];
        rect.y = nextRect.y - nextRect.height;
        this.nextRectNumber++;
        if(this.nextRectNumber == this.rects.length) {
          this.nextRectNumber = 0;
        }
      }
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
    if(this.backgroundImages) {
      for(let i = 0; i < this.backgroundDictionary.length; i++) {
        let rect = this.rects[i];
        ctx.drawImage(this.backgroundDictionary[i].backgroundImageElement, rect.x, rect.y, rect.width, rect.height);
      }
    } else {
      let currentColor;
      for(let i = 0; i < this.rects.length; i++) {
        let rect = this.rects[i];
        if(this.colors[i])
          currentColor = this.colors[i];
        ctx.fillStyle = currentColor;
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      }
    }
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