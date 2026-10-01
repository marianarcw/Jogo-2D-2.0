const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");

startBtn.addEventListener("click", () => {
    menu.style.display = "none";
    canvas.style.display = "block";
    gameLoop();
});

const gravity = 0.7;

const keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

class Player {

    constructor(x, y, color, controls){

        this.x = x;
        this.y = y;

        this.width = 35;
        this.height = 50;

        this.color = color;

        this.vx = 0;
        this.vy = 0;

        this.speed = 4;
        this.jumpForce = -12;

        this.onGround = false;

        this.controls = controls;
    }

    update(){

        this.vx = 0;

        if(keys[this.controls.left]){
            this.vx = -this.speed;
        }

        if(keys[this.controls.right]){
            this.vx = this.speed;
        }

        if(keys[this.controls.jump] && this.onGround){
            this.vy = this.jumpForce;
            this.onGround = false;
        }

        this.vy += gravity;

        this.x += this.vx;
        this.y += this.vy;

        this.onGround = false;

        for(const platform of platforms){

            if(
                this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y
            ){

                if(this.vy > 0){

                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;

                }

            }

        }

        if(this.x < 0) this.x = 0;
        if(this.x + this.width > canvas.width)
            this.x = canvas.width - this.width;

        if(this.y > canvas.height){

            this.x = 100;
            this.y = 100;
            this.vy = 0;

        }

    }

    draw(){

        ctx.fillStyle = this.color;

        ctx.fillRect(
            this.x,
            this.y,
            this.width,
            this.height
        );

    }

}

const fire = new Player(
    100,
    100,
    "red",
    {
        left:"a",
        right:"d",
        jump:"w"
    }
);

const water = new Player(
    200,
    100,
    "deepskyblue",
    {
        left:"ArrowLeft",
        right:"ArrowRight",
        jump:"ArrowUp"
    }
);

const platforms = [

    {
        x:0,
        y:560,
        width:1000,
        height:40
    },

    {
        x:150,
        y:450,
        width:180,
        height:20
    },

    {
        x:450,
        y:370,
        width:180,
        height:20
    },

    {
        x:700,
        y:280,
        width:180,
        height:20
    }

];

function drawPlatforms(){

    ctx.fillStyle="#654321";

    for(const p of platforms){

        ctx.fillRect(
            p.x,
            p.y,
            p.width,
            p.height
        );

    }

}

function gameLoop(){

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawPlatforms();

    fire.update();
    water.update();

    fire.draw();
    water.draw();

    requestAnimationFrame(gameLoop);

}
