let tilesz = 20;
let GP;





// return a random int
function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// GameBoard code below

function GamePanel(ctx, game, width, height, random) {
    this.GE = game;
    this.GE.pause = true;
    this.random = random;
    this.tilesz = 800 / width;
    this.ctx = ctx;
    Entity.call(this);

    this.gridFlag = true;
    this.width = width;
    this.height = width;
    this.grid = createGrid(random, this.width, this.height);

    // game of life stuff
    this.counter = 0;
    this.maxCounter = 0.2;
    this.speed = 5;
    this.underPop = 2;
    this.overPop = 3;
    this.reproduction = 3;
}

GamePanel.prototype.draw = function (ctx) {
    for (var i = 0; i < this.height; i++) {
        for (var j = 0; j < this.width; j++) {
            if (this.gridFlag) {
                ctx.strokeStyle = "gray";
                ctx.strokeRect(j * this.tilesz, i * this.tilesz, this.tilesz, this.tilesz);
            }
            if (this.grid[i][j] === 1) {
                ctx.fillStyle = "black";
                ctx.fillRect(j * this.tilesz, i * this.tilesz, this.tilesz, this.tilesz);
            } else {
                ctx.fillStyle = "white";
                ctx.fillRect(j * this.tilesz, i * this.tilesz, this.tilesz, this.tilesz);
            }
        }   
    }
}



GamePanel.prototype.update = function () {
    if (this.counter > this.maxCounter && !this.GE.pause) {
        this.updateState();
        this.counter = 0;
    } else {
        this.counter += this.GE.clockTick;
    }
}

GamePanel.prototype.updateState = function () {
    let  newGrid = [];
    for (let del = 0; del < this.width; del++) {
        newGrid[del] = this.grid[del].slice();
    }
    for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {
            let neighbors = 0;
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (x + i >= 0 && x + i < this.width && y + j >= 0 && y + j < this.height) {
                        let num = this.grid[parseInt(x + i)][parseInt(y + j)];
                        neighbors += num;
                    }
                }
            }
            neighbors -= this.grid[i][j];
            if (this.grid[i][j] === 1 && neighbors < this.underPop) {
                newGrid[i][j] = 0;
            } else if (this.grid[i][j] === 1 && neighbors > this.overPop) {
                newGrid[i][j] = 0;
            } else if ((this.grid[i][j] === 0 && neighbors === this.reproduction)) {
                newGrid[i][j] = 1;
            } else {
                newGrid[i][j] = this.grid[i][j];
            }
        }
    }
    this.grid = newGrid;
}

function setKeyListeners(gamepanel) {
    gamepanel.GE.ctx.canvas.addEventListener("keydown", function (e) {
        e.preventDefault();
        alert("test");
        if (e.code === "KeyP") {
            gamepanel.GE.pause = !gamepanel.GE.pause;
        }
    }, false);
}

function setDrawingListeners(gamepanel) {

}

function setBoardSizeListener(gamepanel) {
    document.getElementById("sizeOfBoardButton").addEventListener("click", function () {
        var sizeOfBoard = parseInt(document.getElementById("sizeOfBoard").value, 10);
        if (sizeOfBoard > 0) {
            gamepanel.width = sizeOfBoard;
            gamepanel.height = sizeOfBoard;
            gamepanel.tilesz = 800 / gamepanel.width;
            gamepanel.grid = createGrid(gamepanel.random, gamepanel.width, gamepanel.width);
        }
        else {
            alert("invalid value!")
        }
        sizeOfBoard.value = "";
    });
}

function setstateIDListener(gamepanel) {
    document.getElementById("stateidBut").addEventListener("click", function () {
        var stateid_temp = document.getElementById("stateid").value
        if (stateid_temp === "") {
            return;
        }
        else {
            stateid = stateid_temp;
            console.log(stateid);
        }
    });
}

function setGridToggle(gamepanel) {
    document.getElementById("gridToggle").addEventListener("click", function () {
        var gridToggle = document.getElementById("gridToggle");
        gamepanel.gridFlag = gridToggle.checked;
    });
}

function setRandomBoardListener(gamepanel) {
    document.getElementById("randomToggle").addEventListener("click", function () {
        var randomToggle = document.getElementById("randomToggle");
        if (randomToggle.checked == true) {
            gamepanel.random = true;
            console.log("hi");
            gamepanel.grid = createGrid(gamepanel.random, gamepanel.width, gamepanel.width);
        } else {
            console.log("bye");
            gamepanel.random = false;
            gamepanel.grid = createGrid(gamepanel.random, gamepanel.width, gamepanel.width);
        }

    })
}

// random param is a boolean flag to determine if we want a random array or not.
function createGrid(random, width, height) {
    var grid = [];
    for (var i = 0; i < width; i++) {
        var row = [];
        for (var j = 0; j < height; j++) {
            if (random) {
                row[j] = randomInt(0, 2);
            } else {
                row[j] = 0;
            }
        }
        grid[i] = row;
    }
    return grid;
}


function Circle(game) {
    this.player = 1;
    this.radius = 20;
    this.visualRadius = 500;
    this.colors = ["Red", "Green", "Blue", "White"];
    this.setNotIt();
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;
            if (this.it) {
                this.setNotIt();
                ent.setIt();
            }
            else if (ent.it) {
                this.setIt();
                ent.setNotIt();
            }
        }

        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (this.it && dist > this.radius + ent.radius + 10) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (ent.it && dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }
    }


    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};


let ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("hello there");
    let canvas = document.getElementById('gameWorld');
    let ctx = canvas.getContext('2d');
    let gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();
    GP = new GamePanel(ctx, gameEngine, 50, 50, true);
    var sound = document.getElementById('music');
    sound.autoplay = true;
    sound.loop = true;
    sound.volume = 0.2;
    gameEngine.addEntity(GP);
    setBoardSizeListener(GP);
    setRandomBoardListener(GP);
    setGridToggle(GP);
    setstateIDListener(GP)
});
