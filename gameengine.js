// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011
let name = "Charles Jackson"
let stateid = "data1";
let socket = io.connect("http://24.16.255.56:8888");

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();


function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function GameEngine() {
    this.entities = [];
    this.showOutlines = false;
    this.ctx = null;
    this.mouseDown = false;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.pause = false;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();
}

GameEngine.prototype.start = function () {
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    var that = this;

    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        return { x: x, y: y };
    }

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        //console.log(getXandY(e));


    }, false);

    this.ctx.canvas.addEventListener("keydown", function (e) {
        console.log(e.code);
        if (e.code == "KeyP") {
            that.pause = !that.pause;
        }

        // clear the grid
        if (e.code == "KeyC") {
            GP.grid = createGrid(false, GP.width, GP.height);
        }

        if (e.code == "KeyM") {
            var mu = document.getElementById("music");
            mu.muted = !mu.muted;
        }

        if (e.code == "ArrowRight") {
            GP.updateState();
        }

        let d = new Date();

        // save
        if (e.code == "KeyS") {
            socket.emit('save', {
                studentname: name,
                statename: stateid,
                pause: GP.GE.pause,
                random: GP.random,
                tilesz: GP.tilesz,
                width: GP.width,
                height: GP.height,
                grid: GP.grid
            });
        }
        // load
        if (e.code == "KeyL") {

            socket.emit('load', {
                studentname: name,
                statename: stateid
            });

            socket.on("load", function (data) {
                
                GP.GE.pause = data.pause;
                GP.random = data.random;
                GP.tilesz = data.tilesz;
                GP.width = data.width;
                GP.height = data.height;
                GP.grid = data.grid;
            });
        };

    }, false);

    this.ctx.canvas.addEventListener("click", function (e) {
        that.pause = true;
        this.mouseDown = true;
        let mouseXY = getXandY(e);
        let x = mouseXY.x;
        let y = mouseXY.y;
        let xGrid = Math.ceil((x - (x % GP.tilesz)) / GP.tilesz);
        let yGrid = Math.ceil((y - (y % GP.tilesz)) / GP.tilesz);
        if (GP.grid[yGrid][xGrid] == 1) {
            GP.grid[yGrid][xGrid] = 0;
        } else {
            GP.grid[yGrid][xGrid] = 1;
        }
        console.log("x grid: " + xGrid);
        console.log("y grid: " + yGrid);
    }, false);

    this.ctx.canvas.addEventListener("mousedown", function (e) {

    }, false);

    this.ctx.canvas.addEventListener("mouseup", function (e) {
        that.mouseDown = false;
    }, false);

    this.ctx.canvas.addEventListener("wheel", function (e) {
        //console.log(getXandY(e));
        that.wheel = e;
        //       console.log(e.wheelDelta);
        e.preventDefault();
    }, false);

    this.ctx.canvas.addEventListener("contextmenu", function (e) {
        //console.log(getXandY(e));
        that.rightclick = getXandY(e);
        e.preventDefault();
    }, false);

    console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
    this.entities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.click = null;
    this.rightclick = null;
    this.wheel = null;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}


socket.on("connect", function () {
    console.log("Socket connected.")
});
socket.on("disconnect", function () {
    console.log("Socket disconnected.")
});
socket.on("reconnect", function () {
    console.log("Socket reconnected.")
});