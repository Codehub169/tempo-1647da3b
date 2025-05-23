// js/games/sample_game.js

const SampleGame = (() => {
    // Module-scoped variables for game state and configuration
    let canvas, ctx;
    let score = 0;
    let level = 1;
    let updateScoreCallback; // Function to call when score changes
    let updateLevelCallback; // Function to call when level changes

    // Game-specific configuration
    const gameConfig = {
        targetBaseRadius: 30,     // Initial radius of the target
        targetColor: '#FF69B4',   // Hot Pink
        targetBorderColor: '#FFD700', // Gold
        levelUpScoreThreshold: 5, // Number of points to reach next level
        maxLevel: 10,             // Maximum game level
        initialSpawnDelay: 2000,  // Time (ms) for the first target to appear or reappear if missed
        minSpawnDelay: 500,       // Minimum spawn delay at max level
        radiusReductionPerLevel: 2, // How much smaller the target gets per level
        spawnDelayReductionPerLevel: 150 // How much faster targets spawn per level
    };

    let currentTarget = {
        x: 0,
        y: 0,
        radius: gameConfig.targetBaseRadius,
        active: false // Is there currently a target menunggu to be clicked?
    };

    let spawnTimeoutId = null; // To manage the setTimeout for spawning targets
    let currentSpawnDelay = gameConfig.initialSpawnDelay;

    // Initialize the game environment
    function init(canvasElement, fnScoreUpdate, fnLevelUpdate) {
        canvas = canvasElement;
        ctx = canvas.getContext('2d');
        updateScoreCallback = fnScoreUpdate;
        updateLevelCallback = fnLevelUpdate;

        // Ensure canvas has a size if not set by CSS or HTML attributes
        if (canvas.width === 0) canvas.width = 500; 
        if (canvas.height === 0) canvas.height = 300;

        resetGame();
        setupEventListeners();
        
        // Initial UI update
        updateScoreCallback(score);
        updateLevelCallback(level);
        
        spawnNewTarget(); // Spawn the first target
        console.log("Sample Game: Shape Clicker Initialized");
    }

    // Reset game to its initial state
    function resetGame() {
        score = 0;
        level = 1;
        currentTarget.radius = gameConfig.targetBaseRadius;
        currentSpawnDelay = gameConfig.initialSpawnDelay;
        currentTarget.active = false;

        if (updateScoreCallback) updateScoreCallback(score);
        if (updateLevelCallback) updateLevelCallback(level);
        
        clearTimeout(spawnTimeoutId); // Stop any pending spawns
    }

    // Set up event listeners for player input
    function setupEventListeners() {
        canvas.addEventListener('click', handleCanvasClick);
    }

    // Handle clicks on the canvas
    function handleCanvasClick(event) {
        if (!currentTarget.active) return; // No active target to click

        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        // Calculate distance from click to target's center
        const distance = Math.sqrt(
            (clickX - currentTarget.x) ** 2 + (clickY - currentTarget.y) ** 2
        );

        if (distance < currentTarget.radius) {
            // Successful click on the target
            score++;
            updateScoreCallback(score);
            currentTarget.active = false; // Target is now hit
            clearTimeout(spawnTimeoutId); // Stop the miss timer

            // Check for level up
            if (score > 0 && score % gameConfig.levelUpScoreThreshold === 0 && level < gameConfig.maxLevel) {
                level++;
                updateLevelCallback(level);
                
                // Adjust difficulty: make target smaller and spawn faster
                currentTarget.radius = Math.max(10, gameConfig.targetBaseRadius - (level - 1) * gameConfig.radiusReductionPerLevel);
                currentSpawnDelay = Math.max(gameConfig.minSpawnDelay, gameConfig.initialSpawnDelay - (level - 1) * gameConfig.spawnDelayReductionPerLevel);
            }
            
            spawnNewTarget(); // Spawn a new target immediately
        }
    }

    // Spawn a new target on the canvas
    function spawnNewTarget() {
        // Ensure canvas dimensions are valid
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
            console.warn("Sample Game: Canvas not ready for spawning target. Retrying...");
            spawnTimeoutId = setTimeout(spawnNewTarget, 100); // Retry shortly
            return;
        }
        
        // Calculate random position, ensuring it's fully within canvas bounds
        const R = currentTarget.radius;
        currentTarget.x = Math.random() * (canvas.width - 2 * R) + R;
        currentTarget.y = Math.random() * (canvas.height - 2 * R) + R;
        currentTarget.active = true;
        
        draw(); // Draw the new target

        // Set a timer: if target isn't clicked in time, it disappears and a new one spawns
        clearTimeout(spawnTimeoutId);
        spawnTimeoutId = setTimeout(() => {
            if (currentTarget.active) { // If target was still active (not clicked)
                console.log("Sample Game: Target missed (timeout).");
                currentTarget.active = false; // Mark as inactive/missed
                spawnNewTarget(); // Spawn another one
            }
        }, currentSpawnDelay);
    }

    // Main drawing function
    function draw() {
        if (!ctx || !canvas) return;
        
        // Clear canvas with a background color
        ctx.fillStyle = '#F0F8FF'; // Alice Blue, to match page background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (currentTarget.active) {
            // Draw the target (a circle)
            ctx.beginPath();
            ctx.arc(currentTarget.x, currentTarget.y, currentTarget.radius, 0, Math.PI * 2);
            ctx.fillStyle = gameConfig.targetColor;
            ctx.fill();
            ctx.strokeStyle = gameConfig.targetBorderColor;
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.closePath();
        }
    }
    
    // Expose the public init function for this game module
    return {
        init: init
        // Could expose other methods like resetGame, pauseGame if needed by game_loader
    };
})();

// The SampleGame object is now available on the global scope (window.SampleGame)
// game_loader.js will find and call SampleGame.init().
