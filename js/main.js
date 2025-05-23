document.addEventListener('DOMContentLoaded', () => {
    const gameListContainer = document.getElementById('game-list-container');

    // Define the list of available games
    const gamesData = [
        {
            id: 'sample_game',
            title: 'Shape Clicker',
            description: 'Click the colorful shapes as they appear. Test your speed and accuracy!',
            // Using a vibrant, abstract image that suggests fun and colors
            imageUrl: 'https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGFic3RyYWN0JTIwY29sb3JmdWx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=300&q=80',
            icon: '🎨', // Unicode icon, used as a fallback or supplementary visual
            pageUrl: 'game.html' // The page that hosts the game environment
        },
        // Example of how another game could be added in the future:
        // {
        //     id: 'color_match',
        //     title: 'Color Match Challenge',
        //     description: 'Match the falling blocks with the correct color. How long can you last?',
        //     imageUrl: 'https://images.unsplash.com/photo-1558470598-59bf607a5f44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29sb3JmdWwlMjBibG9ja3N8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=300&q=80',
        //     icon: '🧱',
        //     pageUrl: 'game.html'
        // }
    ];

    if (!gameListContainer) {
        console.error('Critical Error: Game list container (div#game-list-container) not found in index.html.');
        // Display a user-friendly message if the container is missing
        const body = document.querySelector('body');
        if (body) {
            const errorMsg = document.createElement('p');
            errorMsg.textContent = 'Oops! We couldn\'t load the games right now. Please try again later.';
            errorMsg.style.color = 'red';
            errorMsg.style.textAlign = 'center';
            errorMsg.style.fontSize = '1.2em';
            body.insertBefore(errorMsg, body.firstChild);
        }
        return;
    }

    // Function to load games into the list container
    function loadGames() {
        gameListContainer.innerHTML = ''; // Clear any existing content (e.g., placeholders)

        if (gamesData.length === 0) {
            gameListContainer.innerHTML = '<p style="text-align:center; font-size: 1.2em; color: #555;">No games available at the moment. Please check back soon!</p>';
            return;
        }

        gamesData.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.setAttribute('aria-label', `Game card for ${game.title}`);

            // Game Image (or Icon as fallback)
            if (game.imageUrl) {
                const img = document.createElement('img');
                img.src = game.imageUrl;
                img.alt = game.title + ' game preview'; // Descriptive alt text
                gameCard.appendChild(img);
            } else if (game.icon) {
                // Fallback to icon if no image URL is provided
                const iconSpan = document.createElement('span');
                iconSpan.className = 'icon';
                iconSpan.textContent = game.icon;
                iconSpan.setAttribute('aria-hidden', 'true'); // Icon is decorative if title is present
                gameCard.appendChild(iconSpan);
            }
            
            // Game Title
            const title = document.createElement('h3');
            title.textContent = game.title;
            gameCard.appendChild(title);

            // Game Description
            const description = document.createElement('p');
            description.textContent = game.description;
            gameCard.appendChild(description);

            // Play Button
            const playButton = document.createElement('button');
            playButton.textContent = 'Play Now!';
            playButton.setAttribute('aria-label', `Play ${game.title}`);
            playButton.onclick = () => {
                // Navigate to the game page, passing the game ID as a query parameter
                window.location.href = `${game.pageUrl}?game=${game.id}`;
            };
            gameCard.appendChild(playButton);

            gameListContainer.appendChild(gameCard);
        });
    }

    // Load the games when the DOM is fully parsed and ready
    loadGames();
});
