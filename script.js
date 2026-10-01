const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const gameOver = document.getElementById("gameOver");

const startButton = document.getElementById("start");
const restartButton = document.getElementById("restart");

const winnerText = document.getElementById("winner");

const keys = {};

let width;
let height;

let playing = false;

let meteors = [];
let bullets = [];
let particles = [];
let stars = [];

let spawnTimer = 0;


/* =========================
   TELA
========================= */

function resize() {

    width = canvas.width =
        window.innerWidth;

    height = canvas.height =
        window.innerHeight;
}

window.addEventListener(
    "resize",
    resize
);

resize();


/* =========================
   TECLADO
========================= */

document.addEventListener(
    "keydown",
    e => {

        keys[e.key] = true;

        if (
            e.code === "Space" ||
            e.key === "Enter" ||
            e.key.startsWith("Arrow")
        ) {
            e.preventDefault();
        }
    }
);

document.addEventListener(
    "keyup",
    e => {

        keys[e.key] = false;
    }
);


/* =========================
   PLAYER 1
========================= */

const player1 = {

    x: 200,
    y: 0,

    size: 25,

    speed: 6,

    color: "#ff3030",

    lives: 3,

    score: 0,

    cooldown: 0,

    alive: true,

    controls: {

        up: "w",
        down: "s",
        left: "a",
        right: "d",
        shoot: " "

    }
};


/* =========================
   PLAYER 2
========================= */

const player2 = {

    x: 600,
    y: 0,

    size: 25,

    speed: 6,

    color: "#38bdf8",

    lives: 3,

    score: 0,

    cooldown: 0,

    alive: true,

    controls: {

        up: "ArrowUp",
        down: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight",
        shoot: "Enter"

    }
};


const players = [
    player1,
    player2
];


/* =========================
   ESTRELAS
========================= */

function createStars() {

    stars = [];

    for (let i = 0; i < 150; i++) {

        stars.push({

            x: Math.random() * width,

            y: Math.random() * height,

            size: Math.random() * 2,

            speed:
                Math.random() * 2 + .5

        });
    }
}


/* =========================
   RESET
========================= */

function resetPlayers() {

    player1.x = width * .3;
    player1.y = height - 100;

    player2.x = width * .7;
    player2.y = height - 100;

    player1.lives = 3;
    player2.lives = 3;

    player1.score = 0;
    player2.score = 0;

    player1.alive = true;
    player2.alive = true;

    updateUI();
}


/* =========================
   METEORO
========================= */

function createMeteor() {

    const size =
        Math.random() * 25 + 20;

    meteors.push({

        x:
            Math.random() * width,

        y:
            -size,

        size: size,

        speed:
            Math.random() * 3 + 2,

        rotation:
            Math.random() * 6,

        rotationSpeed:
            Math.random() * .05 - .025
    });
}


/* =========================
   TIRO
========================= */

function shoot(player) {

    if (!player.alive)
        return;

    if (player.cooldown > 0)
        return;

    bullets.push({

        x: player.x,

        y: player.y - 30,

        owner: player,

        speed: 11

    });

    player.cooldown = 12;
}


/* =========================
   MOVIMENTO
========================= */

function updatePlayer(player) {

    if (!player.alive)
        return;

    if (keys[player.controls.up])
        player.y -= player.speed;

    if (keys[player.controls.down])
        player.y += player.speed;

    if (keys[player.controls.left])
        player.x -= player.speed;

    if (keys[player.controls.right])
        player.x += player.speed;

    if (keys[player.controls.shoot])
        shoot(player);

    player.x = Math.max(
        30,
        Math.min(
            width - 30,
            player.x
        )
    );

    player.y = Math.max(
        70,
        Math.min(
            height - 40,
            player.y
        )
    );

    if (player.cooldown > 0)
        player.cooldown--;
}


/* =========================
   BALAS
========================= */

function updateBullets() {

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

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

        meteor.rotation +=
            meteor.rotationSpeed;


        /* passou */

        if (
            meteor.y >
            height + meteor.size
        ) {

            meteors.splice(i, 1);

            continue;
        }


        /* bateu no jogador */

        for (const player of players) {

            if (!player.alive)
                continue;

            const distance =
                Math.hypot(
                    meteor.x - player.x,
                    meteor.y - player.y
                );

            if (
                distance <
                meteor.size + player.size
            ) {

                damagePlayer(player);

                explode(
                    meteor.x,
                    meteor.y,
                    "#ef4444"
                );

                meteors.splice(i, 1);

                break;
            }
        }
    }
}


/* =========================
   DANO
========================= */

function damagePlayer(player) {

    player.lives--;

    explode(
        player.x,
        player.y,
        player.color
    );

    if (player.lives <= 0) {

        player.alive = false;
    }

    updateUI();

    checkGameOver();
}


/* =========================
   COLISÃO BALAS
========================= */

function checkBulletCollisions() {

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet = bullets[i];

        for (
            let j = meteors.length - 1;
            j >= 0;
            j--
        ) {

            const meteor = meteors[j];

            const distance =
                Math.hypot(
                    bullet.x - meteor.x,
                    bullet.y - meteor.y
                );

            if (
                distance <
                meteor.size
            ) {

                bullet.owner.score += 10;

                explode(
                    meteor.x,
                    meteor.y,
                    "#f97316"
                );

                bullets.splice(i, 1);

                meteors.splice(j, 1);

                updateUI();

                break;
            }
        }
    }
}


/* =========================
   EXPLOSÃO
========================= */

function explode(
    x,
    y,
    color
) {

    for (let i = 0; i < 20; i++) {

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
   PARTÍCULAS
========================= */

function updateParticles() {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        p.life--;

        if (p.life <= 0)
            particles.splice(i, 1);
    }
}


/* =========================
   FUNDO
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
            .4 + Math.random() * .6;

        ctx.fillRect(
            star.x,
            star.y,
            star.size,
            star.size
        );

        star.y += star.speed;

        if (star.y > height)
            star.y = 0;
    }

    ctx.globalAlpha = 1;
}


/* =========================
   DESENHAR PLAYER
========================= */

function drawPlayer(player) {

    if (!player.alive)
        return;

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );


    /* chama */

    ctx.fillStyle =
        "#f97316";

    ctx.beginPath();

    ctx.moveTo(-8, 25);

    ctx.lineTo(0, 42);

    ctx.lineTo(8, 25);

    ctx.fill();


    /* nave */

    ctx.fillStyle =
        player.color;

    ctx.beginPath();

    ctx.moveTo(0, -30);

    ctx.lineTo(25, 25);

    ctx.lineTo(0, 15);

    ctx.lineTo(-25, 25);

    ctx.closePath();

    ctx.fill();


    /* janela */

    ctx.fillStyle =
        "#e0f2fe";

    ctx.beginPath();

    ctx.arc(
        0,
        -8,
        8,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.restore();
}


/* =========================
   METEOROS
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

        ctx.fillStyle =
            "#78716c";

        ctx.beginPath();

        for (let i = 0; i < 8; i++) {

            const angle =
                i * Math.PI * 2 / 8;

            const radius =
                meteor.size *
                (.7 + Math.random() * .3);

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
   BALAS
========================= */

function drawBullets() {

    for (const bullet of bullets) {

        ctx.fillStyle =
            bullet.owner.color;

        ctx.shadowBlur = 10;

        ctx.shadowColor =
            bullet.owner.color;

        ctx.fillRect(
            bullet.x - 3,
            bullet.y,
            6,
            20
        );

        ctx.shadowBlur = 0;
    }
}


/* =========================
   PARTÍCULAS
========================= */

function drawParticles() {

    for (const p of particles) {

        ctx.globalAlpha =
            p.life / 30;

        ctx.fillStyle =
            p.color;

        ctx.fillRect(
            p.x,
            p.y,
            5,
            5
        );
    }

    ctx.globalAlpha = 1;
}


/* =========================
   UI
========================= */

function updateUI() {

    document.getElementById(
        "life1"
    ).textContent =
        player1.lives;

    document.getElementById(
        "life2"
    ).textContent =
        player2.lives;

    document.getElementById(
        "score1"
    ).textContent =
        player1.score;

    document.getElementById(
        "score2"
    ).textContent =
        player2.score;
}


/* =========================
   GAME OVER
========================= */

function checkGameOver() {

    if (
        !player1.alive &&
        !player2.alive
    ) {

        playing = false;

        if (
            player1.score >
            player2.score
        ) {

            winnerText.textContent =
                "🏆 Player 1 venceu!";

        }
        else if (
            player2.score >
            player1.score
        ) {

            winnerText.textContent =
                "🏆 Player 2 venceu!";

        }
        else {

            winnerText.textContent =
                "🤝 Empate!";
        }

        gameOver.style.display =
            "flex";
    }
}


/* =========================
   LOOP
========================= */

function gameLoop() {

    if (!playing)
        return;

    spawnTimer++;

    if (spawnTimer > 35) {

        createMeteor();

        spawnTimer = 0;
    }

    updatePlayer(player1);
    updatePlayer(player2);

    updateBullets();

    updateMeteors();

    checkBulletCollisions();

    updateParticles();

    drawBackground();

    drawMeteors();

    drawBullets();

    drawParticles();

    drawPlayer(player1);
    drawPlayer(player2);

    requestAnimationFrame(gameLoop);
}


/* =========================
   INICIAR
========================= */

function startGame() {

    menu.style.display = "none";

    gameOver.style.display = "none";

    bullets = [];
    meteors = [];
    particles = [];

    spawnTimer = 0;

    resetPlayers();

    createStars();

    playing = true;

    gameLoop();
}


startButton.onclick =
    startGame;

restartButton.onclick =
    startGame;
