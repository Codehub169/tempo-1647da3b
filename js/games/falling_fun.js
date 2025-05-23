window.FallingFunGame = (() => {
    let canvas, ctx;
    let score, level;
    let updateScoreCallback, updateLevelCallback;

    let player;
    let fallingObjects;
    let keysPressed = {};

    let animationFrameId;
    let gameOver;
    let lastTime;
    let spawnTimer;
    let currentSpawnInterval;
    let currentObjectSpeed;

    const gameConfig = {
        playerWidth: 70,
        playerHeight: 50, // Basket image/shape is wider
        playerSpeed: 5, // Pixels per frame update
        playerColor: '#28a745', // Darker Lime Green for basket
        // Player symbol/emoji could be drawn if a complex shape is too much
        // playerSymbol: '\ud83e\uddfa', 
        // playerSymbolFont: '40px sans-serif',

        objectSize: 25, // For square-like objects (stars, hearts)
        objectTypes: [
            { type: 'star', symbol: '⭐', color: '#FFD700', points: 10 },
            { type: 'heart', symbol: '💖', color: '#FF69B4', points: 20 }
        ],
        objectSymbolFont: '20px sans-serif',
        
        baseObjectSpeed: 1.5, // Pixels per frame update
        speedIncrementPerLevel: 0.25,
        
        initialSpawnIntervalMs: 1800,
        spawnIntervalDecrementPerLevelMs: 150,
        minSpawnIntervalMs: 400,

        levelUpScoreThreshold: 100,
        maxLevel: 10,

        canvasBackgroundColor: '#F0F8FF', // Alice Blue
    };

    function init(canvasElement, fnScoreUpdate, fnLevelUpdate) {
        canvas = canvasElement;
        if (!canvas || typeof canvas.getContext !== 'function') {
            console.error("FallingFunGame: Invalid canvas element provided.");
            if(fnLevelUpdate) fnLevelUpdate("Err"); 
            if(fnScoreUpdate) fnScoreUpdate("Err");
            return;
        }
        ctx = canvas.getContext('2d');
        updateScoreCallback = fnScoreUpdate;
        updateLevelCallback = fnLevelUpdate;

        // Use canvas dimensions from HTML/CSS, or default if not set
        if (canvas.width === 0 || canvas.height === 0) { // HTML default for canvas is 300x150
            // If game.html has <canvas id="game-canvas" width="600" height="400">
            // these will be 600 and 400 respectively unless overridden by CSS.
            // For safety, we can check if they are too small or 0.
            // console.warn("FallingFunGame: Canvas dimensions are zero, using defaults.");
            // canvas.width = 600;
            // canvas.height = 400;
        }

        resetGame();
        setupEventListeners();
        
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        lastTime = performance.now(); // Initialize lastTime before first gameLoop call
        gameLoop(lastTime);
        console.log("Falling Fun Game Initialized");
    }

    function resetGame() {
        score = 0;
        level = 1;
        gameOver = false;
        fallingObjects = [];
        keysPressed = {};

        player = {
            x: canvas.width / 2 - gameConfig.playerWidth / 2,
            y: canvas.height - gameConfig.playerHeight - 10, // 10px margin from bottom
            width: gameConfig.playerWidth,
            height: gameConfig.playerHeight,
            color: gameConfig.playerColor
        };

        updateScoreCallback(score);
        updateLevelCallback(level);
        configureLevelParameters();
        spawnTimer = 0; // Reset spawn timer for the new game/level
    }

    function configureLevelParameters() {
        currentObjectSpeed = gameConfig.baseObjectSpeed + (level - 1) * gameConfig.speedIncrementPerLevel;
        currentSpawnInterval = Math.max(
            gameConfig.minSpawnIntervalMs,
            gameConfig.initialSpawnIntervalMs - (level - 1) * gameConfig.spawnIntervalDecrementPerLevelMs
        );
    }

    function setupEventListeners() {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    }

    function handleKeyDown(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Left' || e.key === 'Right') {
            e.preventDefault();
        }
        keysPressed[e.key] = true;
    }

    function handleKeyUp(e) {
        keysPressed[e.key] = false;
    }

    function updatePlayer() {
        if (keysPressed['ArrowLeft'] || keysPressed['Left']) {
            player.x -= gameConfig.playerSpeed;
        }
        if (keysPressed['ArrowRight'] || keysPressed['Right']) {
            player.x += gameConfig.playerSpeed;
        }
        player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
    }

    function spawnFallingObject() {
        const typeIndex = Math.floor(Math.random() * gameConfig.objectTypes.length);
        const typeInfo = gameConfig.objectTypes[typeIndex];
        
        const object = {
            x: Math.random() * (canvas.width - gameConfig.objectSize),
            y: -gameConfig.objectSize, // Start just above the canvas
            width: gameConfig.objectSize,
            height: gameConfig.objectSize,
            speed: currentObjectSpeed,
            type: typeInfo.type,
            symbol: typeInfo.symbol,
            color: typeInfo.color,
            points: typeInfo.points
        };
        fallingObjects.push(object);
    }

    function updateFallingObjects() {
        for (let i = fallingObjects.length - 1; i >= 0; i--) {
            const obj = fallingObjects[i];
            obj.y += obj.speed;

            if (checkCollision(player, obj)) {
                score += obj.points;
                updateScoreCallback(score);
                fallingObjects.splice(i, 1);

                if (score >= gameConfig.levelUpScoreThreshold * level && level < gameConfig.maxLevel) {
                    level++;
                    updateLevelCallback(level);
                    configureLevelParameters();
                }
                continue;
            }

            if (obj.y > canvas.height) {
                fallingObjects.splice(i, 1);
            }
        }
    }

    function checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    function drawPlayer() {
        ctx.fillStyle = player.color;
        // Main body of the basket (a bit shorter to allow for a rim)
        ctx.fillRect(player.x, player.y + player.height * 0.20, player.width, player.height * 0.80);
        // Rim of the basket (slightly wider and on top)
        const rimHeight = player.height * 0.25;
        const rimWidthOffset = player.width * 0.1; // How much wider the rim is on each side
        ctx.fillRect(player.x - rimWidthOffset, player.y, player.width + (2 * rimWidthOffset), rimHeight);
    }

    function drawFallingObjects() {
        ctx.font = gameConfig.objectSymbolFont;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        fallingObjects.forEach(obj => {
            ctx.fillText(obj.symbol, obj.x + obj.width / 2, obj.y + obj.height / 2);
        });
    }

    function draw() {
        ctx.fillStyle = gameConfig.canvasBackgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawPlayer();
        drawFallingObjects();
    }

    function gameLoop(timestamp) {
        if (gameOver) {
            // Can add Game Over display logic here if needed
            cancelAnimationFrame(animationFrameId);
            return;
        }

        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        updatePlayer();
        updateFallingObjects();

        spawnTimer += deltaTime;
        if (spawnTimer >= currentSpawnInterval) {
            spawnFallingObject();
            spawnTimer = 0;
        }

        draw();
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    return {
        init: init
    };
})();
