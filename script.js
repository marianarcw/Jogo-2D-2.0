const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const keys = {};

document.addEventListener("keydown", e=>{
    keys[e.key]=true;
});

document.addEventListener("keyup", e=>{
    keys[e.key]=false;
});

const paddleWidth=15;
const paddleHeight=100;

const player1={
    x:20,
    y:200,
    score:0
};

const player2={
    x:865,
    y:200,
    score:0
};

const ball={
    x:450,
    y:250,
    radius:10,
    speedX:5,
    speedY:4
};

function drawRect(x,y,w,h,color){
    ctx.fillStyle=color;
    ctx.fillRect(x,y,w,h);
}

function drawBall(){
    ctx.beginPath();
    ctx.arc(ball.x,ball.y,ball.radius,0,Math.PI*2);
    ctx.fillStyle="white";
    ctx.fill();
}

function movePlayers(){

    if(keys["w"])
        player1.y-=7;

    if(keys["s"])
        player1.y+=7;

    if(keys["ArrowUp"])
        player2.y-=7;

    if(keys["ArrowDown"])
        player2.y+=7;

    player1.y=Math.max(0,Math.min(canvas.height-paddleHeight,player1.y));
    player2.y=Math.max(0,Math.min(canvas.height-paddleHeight,player2.y));

}

function moveBall(){

    ball.x+=ball.speedX;
    ball.y+=ball.speedY;

    if(ball.y<10 || ball.y>490)
        ball.speedY*=-1;

    if(
        ball.x<player1.x+paddleWidth &&
        ball.y>player1.y &&
        ball.y<player1.y+paddleHeight
    ){
        ball.speedX*=-1;
    }

    if(
        ball.x>player2.x &&
        ball.y>player2.y &&
        ball.y<player2.y+paddleHeight
    ){
        ball.speedX*=-1;
    }

    if(ball.x<0){
        player2.score++;
        resetBall();
    }

    if(ball.x>900){
        player1.score++;
        resetBall();
    }

}

function resetBall(){

    ball.x=450;
    ball.y=250;

    ball.speedX*=-1;

    document.getElementById("score1").textContent=player1.score;
    document.getElementById("score2").textContent=player2.score;

}

function draw(){

    ctx.clearRect(0,0,900,500);

    drawRect(player1.x,player1.y,paddleWidth,paddleHeight,"red");

    drawRect(player2.x,player2.y,paddleWidth,paddleHeight,"deepskyblue");

    drawBall();

}

function game(){

    movePlayers();

    moveBall();

    draw();

    requestAnimationFrame(game);

}

game();
