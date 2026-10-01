const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const gameOverScreen = document.getElementById("gameOver");

const startButton = document.getElementById("start");
const restartButton = document.getElementById("restart");

const lifeText = document.getElementById("life");
const scoreText = document.getElementById("score");
const highScoreText = document.getElementById("highScore");
const finalScoreText = document.getElementById("finalScore");

let width;
let height;

let playing = false;

let score = 0;
let lives = 3;

let highScore =
    Number(localStorage.getItem("naveRecorde")) || 0;

highScoreText.textContent = highScore;

const keys = {};

let bullets = [];
let meteors = [];
let particles = [];
let stars = [];

const player = {

    x: 0,
    y: 0,

    width: 45,
    height: 55,

    speed: 7,

    cooldown: 0

};


/* =========================
   TAMANHO DA TELA
========================= */

function resize() {

    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    player.x = width / 2;
    player.y = height - 100;
}

window.addEventListener("resize", resize);

resize();


/* =========================
   CONTROLES
========================= */

document.addEventListener("keydown", event => {

    keys[event.key.toLowerCase()] = true;

    if (
        event.code === "Space" ||
        event.key.startsWith("Arrow")
    ) {

        event.preventDefault();
    }
});

document.addEventListener("keyup", event => {

    keys[event.key.toLowerCase()] = false;
});


/* =========================
   ESTRELAS
========================= */

function createStars() {

    stars = [];

    for (let i = 0; i < 180; i++) {

        stars.push({

            x: Math.random() * width,

            y: Math.random() * height,

            size: Math.random() * 2 + 1,

            speed: Math.random() * 2 + 0.5

        });
    }
}


/* =========================
   METEORO
========================= */

function createMeteor() {

    const size =
        Math.random() * 35 + 25;

    meteors.push({

        x: Math.random() * width,

        y: -size,

        size: size,

        speed:
            Math.random() * 3 + 2 + score / 500,

        rotation:
            Math.random() * Math.PI,

        rotationSpeed:
            Math.random() * 0.05 - 0.025

    });
}


/* =========================
   TIRO
========================= */

function shoot() {

    if (player.cooldown > 0)
        return;

    bullets.push({

        x: player.x,

        y: player.y - 25,

        width: 5,

        height: 20,

        speed: 12

    });

    player.cooldown = 10;
}


/* =========================
   PARTÍCULAS
========================= */

function explosion(x, y, color) {

    for (let i = 0; i < 25; i++) {

        particles.push({

            x: x,

            y: y,

            vx:
                Math.random() * 8 - 4,

            vy:
                Math.random() * 8 - 4,

            life: 30,

            color: color

        });
    }
}


/* =========================
   JOGADOR
========================= */

function updatePlayer() {

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        player.x -= player.speed;
    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        player.x += player.speed;
    }

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        player.y -= player.speed;
    }

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        player.y += player.speed;
    }

    player.x = Math.max(
        30,
        Math.min(width - 30, player.x)
    );

    player.y = Math.max(
        60,
        Math.min(height - 40, player.y)
    );

    if (keys[" "] || keys["space"]) {

        shoot();
    }

    if (player.cooldown > 0) {

        player.cooldown--;
    }
}


/* =========================
   BALAS
========================= */

function updateBullets() {

    for (let i = bullets.length - 1; i >= 0; i--) {

        const bullet = bullets[i];

        bullet.y -= bullet.speed;

        if (bullet.y < -30) {

            bullets.splice(i, 1);
        }
    }
}


/* =========================
   METEOROS
========================= */

function updateMeteors() {

    for (
        let i = meteors.length - 1;
        i >= 0;
        i--
    ) {

        const meteor = meteors[i];

        meteor.y += meteor.speed;

        meteor.rotation += meteor.rotationSpeed;

        if (
            meteor.y >
            height + meteor.size
        ) {

            meteors.splice(i, 1);

            score += 5;

            continue;
        }

        /* colisão com jogador */

        const distance = Math.hypot(

            meteor.x - player.x,

            meteor.y - player.y

        );

        if (
            distance <
            meteor.size + 25
        ) {

            explosion(
                meteor.x,
                meteor.y,
                "#ef4444"
            );

            meteors.splice(i, 1);

            lives--;

            lifeText.textContent = lives;

            if (lives <= 0) {

                endGame();
            }

            continue;
        }


        /* colisão com balas */

        for (
            let j = bullets.length - 1;
            j >= 0;
            j--
        ) {

            const bullet = bullets[j];

            const distance = Math.hypot(

                meteor.x - bullet.x,

                meteor.y - bullet.y

            );

            if (
                distance <
                meteor.size
            ) {

                explosion(
                    meteor.x,
                    meteor.y,
                    "#f97316"
                );

                meteors.splice(i, 1);

                bullets.splice(j, 1);

                score += 20;

                break;
            }
        }
    }
}


/* =========================
   PARTÍCULAS
========================= */

function updateParticles() {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle = particles[i];

        particle.x += particle.vx;

        particle.y += particle.vy;

        particle.vy += 0.1;

        particle.life--;

        if (particle.life <= 0) {

            particles.splice(i, 1);
        }
    }
}


/* =========================
   DESENHAR FUNDO
========================= */

function drawBackground() {

    ctx.fillStyle = "#020617";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

    for (const star of stars) {

        ctx.fillStyle = "white";

        ctx.globalAlpha =
            Math.random() * 0.6 + 0.4;

        ctx.fillRect(
            star.x,
            star.y,
            star.size,
            star.size
        );

        star.y += star.speed;

        if (star.y > height) {

            star.y = 0;

            star.x =
                Math.random() * width;
        }
    }

    ctx.globalAlpha = 1;
}


/* =========================
   DESENHAR NAVE
========================= */

function drawPlayer() {

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );

    /* chama */

    ctx.fillStyle = "#f97316";

    ctx.beginPath();

    ctx.moveTo(-10, 25);

    ctx.lineTo(0, 45);

    ctx.lineTo(10, 25);

    ctx.fill();

    /* nave */

    ctx.fillStyle = "#e2e8f0";

    ctx.beginPath();

    ctx.moveTo(0, -30);

    ctx.lineTo(25, 25);

    ctx.lineTo(0, 15);

    ctx.lineTo(-25, 25);

    ctx.closePath();

    ctx.fill();

    /* janela */

    ctx.fillStyle = "#38bdf8";

    ctx.beginPath();

    ctx.arc(
        0,
        -8,
        8,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* detalhes */

    ctx.strokeStyle = "#475569";

    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.moveTo(-15, 18);

    ctx.lineTo(-25, 28);

    ctx.moveTo(15, 18);

    ctx.lineTo(25, 28);

    ctx.stroke();

    ctx.restore();
}


/* =========================
   DESENHAR METEOROS
========================= */

function drawMeteors() {

    for (const meteor of meteors) {

        ctx.save();

        ctx.translate(
            meteor.x,
            meteor.y
        );

        ctx.rotate(
            meteor.rotation
        );

        ctx.fillStyle = "#78716c";

        ctx.beginPath();

        for (let i = 0; i < 9; i++) {

            const angle =
                i * Math.PI * 2 / 9;

            const radius =
                meteor.size *
                (0.75 + Math.random() * 0.25);

            const x =
                Math.cos(angle) * radius;

            const y =
                Math.sin(angle) * radius;

            if (i === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        ctx.closePath();

        ctx.fill();

        ctx.restore();
    }
}


/* =========================
   DESENHAR BALAS
========================= */

function drawBullets() {

    ctx.fillStyle = "#22d3ee";

    for (const bullet of bullets) {

        ctx.fillRect(

            bullet.x - 2,

            bullet.y,

            bullet.width,

            bullet.height

        );
    }
}


/* =========================
   DESENHAR PARTÍCULAS
========================= */

function drawParticles() {

    for (const particle of particles) {

        ctx.globalAlpha =
            particle.life / 30;

        ctx.fillStyle =
            particle.color;

        ctx.fillRect(
            particle.x,
            particle.y,
            5,
            5
        );
    }

    ctx.globalAlpha = 1;
}


/* =========================
   ATUALIZAR
========================= */

function update() {

    updatePlayer();

    updateBullets();

    updateMeteors();

    updateParticles();

    scoreText.textContent =
        Math.floor(score);
}


/* =========================
   DESENHAR
========================= */

function draw() {

    drawBackground();

    drawBullets();

    drawMeteors();

    drawParticles();

    drawPlayer();
}


/* =========================
   LOOP
========================= */

function gameLoop() {

    if (!playing)
        return;

    update();

    draw();

    requestAnimationFrame(gameLoop);
}


/* =========================
   COMEÇAR
========================= */

function startGame() {

    score = 0;

    lives = 3;

    bullets = [];

    meteors = [];

    particles = [];

    player.x = width / 2;

    player.y = height - 100;

    lifeText.textContent = lives;

    scoreText.textContent = score;

    gameOverScreen.style.display = "none";

    menu.style.display = "none";

    playing = true;

    createStars();

    gameLoop();
}


/* =========================
   GAME OVER
========================= */

function endGame() {

    playing = false;

    finalScoreText.textContent =
        Math.floor(score);

    if (score > highScore) {

        highScore = Math.floor(score);

        localStorage.setItem(
            "naveRecorde",
            highScore
        );

        highScoreText.textContent =
            highScore;
    }

    gameOverScreen.style.display =
        "flex";
}


/* =========================
   BOTÕES
========================= */

startButton.addEventListener(
    "click",
    startGame
);

restartButton.addEventListener(
    "click",
    startGame
);


/* =========================
   CRIAR METEOROS
========================= */

setInterval(() => {

    if (playing) {

        createMeteor();

        if (Math.random() < 0.3) {

            createMeteor();
        }
    }

}, 700);
