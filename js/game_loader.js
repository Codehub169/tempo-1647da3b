document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');

    const gameTitleElement = document.getElementById('game-title');
    const gameCanvas = document.getElementById('game-canvas');
    const scoreValueElement = document.getElementById('score-value');
    const levelValueElement = document.getElementById('level-value');
    const gameAreaElement = document.getElementById('game-area'); // Used for displaying errors

    function displayError(message) {
        if (gameTitleElement) gameTitleElement.textContent = 'Error!';
        
        // Clear canvas if it exists, or hide it
        if (gameCanvas) {
            const ctx = gameCanvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
            }
            gameCanvas.style.display = 'none'; // Hide canvas on error
        }
        
        if (gameAreaElement) {
            gameAreaElement.innerHTML = ''; // Clear previous content (like canvas)

            const messageParagraph = document.createElement('p');
            messageParagraph.style.textAlign = 'center';
            messageParagraph.style.color = 'red';
            messageParagraph.style.fontSize = '1.2em';
            messageParagraph.textContent = message; 

            const linkParagraph = document.createElement('p');
            linkParagraph.style.textAlign = 'center';
            linkParagraph.style.marginTop = '1em';

            const errorLink = document.createElement('a');
            errorLink.href = 'index.html';
            // Using classes from style.css if possible, or fallback inline styles
            errorLink.className = 'back-button'; // Match style of header back button
            errorLink.textContent = 'Back to Menu';
            // Fallback styles if .back-button class isn't sufficient or available
            if (!document.styleSheets.length || !Array.from(document.styleSheets).some(s => s.cssRules && Array.from(s.cssRules).some(r => r.selectorText === '.back-button'))) {
                errorLink.style.padding = '10px 20px';
                errorLink.style.backgroundColor = '#FFD700'; // Gold
                errorLink.style.color = '#333';
                errorLink.style.textDecoration = 'none';
                errorLink.style.borderRadius = '20px';
                errorLink.style.fontWeight = 'bold';
            }
            
            linkParagraph.appendChild(errorLink);

            gameAreaElement.appendChild(messageParagraph);
            gameAreaElement.appendChild(linkParagraph);
        } else {
            // Fallback if gameAreaElement is also missing
            alert("Error loading game: " + message + "\nPlease return to the menu.");
        }
        console.error(message);
    }

    if (!gameId) {
        displayError('No game selected. Please return to the menu and choose a game.');
        return;
    }

    // Check for essential HTML elements for game operation
    if (!gameCanvas || !scoreValueElement || !levelValueElement || !gameTitleElement || !gameAreaElement) {
        displayError('The game page is missing essential HTML components. Cannot load the game.');
        return;
    }
    
    function updateScoreDisplay(newScore) {
        if (scoreValueElement) scoreValueElement.textContent = String(newScore);
    }

    function updateLevelDisplay(newLevel) {
        if (levelValueElement) levelValueElement.textContent = String(newLevel);
    }

    const gameRegistry = {
        'sample_game': {
            displayName: 'Shape Clicker',
            objectName: 'SampleGame',
            scriptPath: 'js/games/sample_game.js'
        },
        'memory_match': {
            displayName: 'Memory Match',
            objectName: 'MemoryMatch',
            scriptPath: 'js/games/memory_match.js'
        },
        'falling_fun': {
            displayName: 'Falling Fun',
            objectName: 'FallingFunGame',
            scriptPath: 'js/games/falling_fun.js'
        }
    };

    const selectedGameConfig = gameRegistry[gameId];

    if (!selectedGameConfig) {
        displayError(`The game ('${gameId}') is not recognized. Please choose a different game from the menu.`);
        return;
    }

    if (gameTitleElement) gameTitleElement.textContent = selectedGameConfig.displayName;
    document.title = `${selectedGameConfig.displayName} - Kids Fun Games`; // Update page title
    
    const script = document.createElement('script');
    script.src = selectedGameConfig.scriptPath;
    script.async = true; 
    
    script.onload = () => {
        const gameModule = window[selectedGameConfig.objectName];
        if (gameModule && typeof gameModule.init === 'function') {
            try {
                // Ensure canvas is visible before initializing game
                if(gameCanvas) gameCanvas.style.display = 'block'; 
                gameModule.init(gameCanvas, updateScoreDisplay, updateLevelDisplay);
                console.log(`Game '${selectedGameConfig.displayName}' initialized successfully.`);
            } catch (error) {
                console.error(`Error during ${selectedGameConfig.displayName} initialization:`, error);
                displayError(`An error occurred while starting ${selectedGameConfig.displayName}: ${error.message}`);
            }
        } else {
            displayError(`Failed to initialize '${selectedGameConfig.displayName}'. The game script might be corrupted, not loaded correctly, or missing the 'init' function.`);
        }
    };
    
    script.onerror = (e) => {
        console.error(`Error loading script ${selectedGameConfig.scriptPath}:`, e);
        displayError(`Failed to load the script for '${selectedGameConfig.displayName}'. Please check the file path, network connection, or browser console for more details.`);
    };
    
    document.body.appendChild(script);
});
