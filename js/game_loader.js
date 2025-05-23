document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');

    const gameTitleElement = document.getElementById('game-title');
    const gameCanvas = document.getElementById('game-canvas');
    const scoreValueElement = document.getElementById('score-value');
    const levelValueElement = document.getElementById('level-value');
    const gameAreaElement = document.getElementById('game-area');

    // Centralized error display function
    function displayError(message) {
        if (gameTitleElement) gameTitleElement.textContent = 'Error!';
        if (gameAreaElement) {
            gameAreaElement.innerHTML = `<p style="text-align:center; color: red; font-size:1.2em;">${message}</p>
                                       <p style="text-align:center; margin-top:1em;"><a href="index.html" class="button-like">Back to Menu</a></p>`;
            // Add basic styling for the button-like link if CSS isn't fully loaded or specific enough
            const errorLink = gameAreaElement.querySelector('a.button-like');
            if (errorLink) {
                errorLink.style.padding = '10px 15px';
                errorLink.style.backgroundColor = '#FF69B4';
                errorLink.style.color = 'white';
                errorLink.style.textDecoration = 'none';
                errorLink.style.borderRadius = '5px';
            }
        } else {
            // Fallback if gameAreaElement is also missing
            alert("Error loading game: " + message);
        }
        console.error(message);
    }

    if (!gameId) {
        displayError('No game selected. Please return to the menu and choose a game.');
        return;
    }

    if (!gameCanvas || !scoreValueElement || !levelValueElement || !gameTitleElement || !gameAreaElement) {
        displayError('The game page is missing essential components. Cannot load the game.');
        return;
    }
    
    // Function to update score display on the page
    function updateScoreDisplay(newScore) {
        if (scoreValueElement) scoreValueElement.textContent = newScore;
    }

    // Function to update level display on the page
    function updateLevelDisplay(newLevel) {
        if (levelValueElement) levelValueElement.textContent = newLevel;
    }

    // Load the specific game script based on gameId
    // For MVP, we only handle 'sample_game'. This can be extended with a switch or map for more games.
    if (gameId === 'sample_game') {
        gameTitleElement.textContent = 'Shape Clicker'; // Set game title
        
        const script = document.createElement('script');
        script.src = 'js/games/sample_game.js'; // Path to the game's logic file
        
        script.onload = () => {
            // Check if the game object and its init method are available globally
            if (typeof SampleGame !== 'undefined' && typeof SampleGame.init === 'function') {
                try {
                    SampleGame.init(gameCanvas, updateScoreDisplay, updateLevelDisplay);
                    console.log(`Game '${gameId}' initialized successfully.`);
                } catch (error) {
                    console.error(`Error during ${gameId} initialization:`, error);
                    displayError(`An error occurred while starting the game: ${error.message}`);
                }
            } else {
                displayError(`Failed to initialize '${gameId}'. The game script might be corrupted or not define 'SampleGame.init' correctly.`);
            }
        };
        
        script.onerror = () => {
            displayError(`Failed to load the script for '${gameId}'. Please check the file path and network connection.`);
        };
        
        document.body.appendChild(script); // Append script to body to load and execute it
    } else {
        displayError(`The game you selected ('${gameId}') is not recognized. Please choose a different game from the menu.`);
    }
});
