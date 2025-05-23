document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');

    const gameTitleElement = document.getElementById('game-title');
    const gameCanvas = document.getElementById('game-canvas');
    const scoreValueElement = document.getElementById('score-value');
    const levelValueElement = document.getElementById('level-value');
    const gameAreaElement = document.getElementById('game-area');

    function displayError(message) {
        if (gameTitleElement) gameTitleElement.textContent = 'Error!';
        if (gameAreaElement) {
            gameAreaElement.innerHTML = ''; // Clear existing content

            const messageParagraph = document.createElement('p');
            messageParagraph.style.textAlign = 'center';
            messageParagraph.style.color = 'red';
            messageParagraph.style.fontSize = '1.2em';
            messageParagraph.textContent = message; // Safely set the message text

            const linkParagraph = document.createElement('p');
            linkParagraph.style.textAlign = 'center';
            linkParagraph.style.marginTop = '1em';

            const errorLink = document.createElement('a');
            errorLink.href = 'index.html';
            errorLink.className = 'button-like'; 
            errorLink.textContent = 'Back to Menu';
            // Apply styles consistent with game.html or style.css for .button-like if defined
            errorLink.style.padding = '10px 15px';
            errorLink.style.backgroundColor = '#FF69B4'; // Hot Pink
            errorLink.style.color = 'white';
            errorLink.style.textDecoration = 'none';
            errorLink.style.borderRadius = '5px';
            
            linkParagraph.appendChild(errorLink);

            gameAreaElement.appendChild(messageParagraph);
            gameAreaElement.appendChild(linkParagraph);
        } else {
            alert("Error loading game: " + message);
        }
        console.error(message);
    }

    if (!gameId) {
        displayError('No game selected. Please return to the menu and choose a game.');
        return;
    }

    if (!gameCanvas || !scoreValueElement || !levelValueElement || !gameTitleElement || !gameAreaElement) {
        displayError('The game page is missing essential HTML components. Cannot load the game.');
        return;
    }
    
    function updateScoreDisplay(newScore) {
        if (scoreValueElement) scoreValueElement.textContent = newScore;
    }

    function updateLevelDisplay(newLevel) {
        if (levelValueElement) levelValueElement.textContent = newLevel;
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
        }
        // Future games can be added here
    };

    const selectedGameConfig = gameRegistry[gameId];

    if (!selectedGameConfig) {
        displayError(`The game you selected ('${gameId}') is not recognized. Please choose a different game from the menu.`);
        return;
    }

    gameTitleElement.textContent = selectedGameConfig.displayName;
    
    const script = document.createElement('script');
    script.src = selectedGameConfig.scriptPath;
    script.async = true; // Load script asynchronously
    
    script.onload = () => {
        const gameModule = window[selectedGameConfig.objectName];
        if (gameModule && typeof gameModule.init === 'function') {
            try {
                gameModule.init(gameCanvas, updateScoreDisplay, updateLevelDisplay);
                console.log(`Game '${selectedGameConfig.displayName}' initialized successfully.`);
            } catch (error) {
                console.error(`Error during ${selectedGameConfig.displayName} initialization:`, error);
                displayError(`An error occurred while starting ${selectedGameConfig.displayName}: ${error.message}`);
            }
        } else {
            displayError(`Failed to initialize '${selectedGameConfig.displayName}'. The game script might be corrupted or missing the correct init function.`);
        }
    };
    
    script.onerror = () => {
        displayError(`Failed to load the script for '${selectedGameConfig.displayName}'. Please check the file path and network connection.`);
    };
    
    document.body.appendChild(script);
});
