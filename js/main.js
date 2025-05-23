document.addEventListener('DOMContentLoaded', () => {
    const gameListContainer = document.getElementById('game-list-container');

    // Define the list of available games
    const gamesData = [
        {
            id: 'sample_game',
            title: 'Shape Clicker',
            description: 'Click the colorful shapes as they appear. Test your speed and accuracy!',
            imageUrl: 'https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGFic3RyYWN0JTIwY29sb3JmdWx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=300&q=80',
            icon: '\ud83c\udfa8', // Artist Palette emoji
            pageUrl: 'game.html'
        },
        {
            id: 'memory_match',
            title: 'Memory Match',
            description: 'Flip cards and find matching pairs! Test your memory.',
            imageUrl: 'https://images.unsplash.com/photo-1604145490944-166090027c65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bWVtb3J5JTIwZ2FtZSUyMGtpZHN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=300&q=80',
            icon: '\ud83e\udde0', // Brain emoji
            pageUrl: 'game.html'
        }
        // Example of how another game could be added in the future:
        // {
        //     id: 'color_match',
        //     title: 'Color Match Challenge',
        //     description: 'Match the falling blocks with the correct color. How long can you last?',
        //     imageUrl: 'https://images.unsplash.com/photo-1558470598-59bf607a5f44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29sb3JmdWwlMjBibG9ja3N8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=300&q=80',
        //     icon: '\ud83e\uddf1', // Bricks emoji
        //     pageUrl: 'game.html'
        // }
    ];

    if (!gameListContainer) {
        console.error('Critical Error: Game list container (div#game-list-container) not found in index.html.');
        const body = document.querySelector('body');
        if (body) {
            const errorMsg = document.createElement('p');
            errorMsg.textContent = 'Oops! We couldn\'t load the games right now. Please try again later.';
            errorMsg.style.color = 'red';
            errorMsg.style.textAlign = 'center';
            errorMsg.style.fontSize = '1.2em';
            errorMsg.style.padding = '20px';
            body.insertBefore(errorMsg, body.firstChild);
        }
        return;
    }

    function loadGames() {
        gameListContainer.innerHTML = ''; // Clear placeholders or old content

        if (gamesData.length === 0) {
            const noGamesMsg = document.createElement('p');
            noGamesMsg.textContent = 'No games available at the moment. Please check back soon!';
            noGamesMsg.style.textAlign = 'center';
            noGamesMsg.style.fontSize = '1.2em';
            noGamesMsg.style.color = '#555';
            gameListContainer.appendChild(noGamesMsg);
            return;
        }

        const fragment = document.createDocumentFragment();
        gamesData.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.setAttribute('aria-label', `Game card for ${game.title}`);

            if (game.imageUrl) {
                const img = document.createElement('img');
                img.src = game.imageUrl;
                img.alt = `${game.title} game preview`;
                img.onerror = () => { // Fallback if image fails to load
                    img.remove();
                    if (game.icon) {
                        const iconSpan = document.createElement('span');
                        iconSpan.className = 'icon';
                        iconSpan.textContent = game.icon;
                        iconSpan.setAttribute('aria-hidden', 'true');
                        gameCard.insertBefore(iconSpan, gameCard.firstChild); // Insert icon at the beginning
                    }
                };
                gameCard.appendChild(img);
            } else if (game.icon) {
                const iconSpan = document.createElement('span');
                iconSpan.className = 'icon';
                iconSpan.textContent = game.icon;
                iconSpan.setAttribute('aria-hidden', 'true');
                gameCard.appendChild(iconSpan);
            }
            
            const titleElement = document.createElement('h3');
            titleElement.textContent = game.title;
            gameCard.appendChild(titleElement);

            const descriptionElement = document.createElement('p');
            descriptionElement.textContent = game.description;
            gameCard.appendChild(descriptionElement);

            const playButton = document.createElement('button');
            playButton.textContent = 'Play Now!';
            playButton.setAttribute('aria-label', `Play ${game.title}`);
            playButton.addEventListener('click', () => {
                window.location.href = `${game.pageUrl}?game=${encodeURIComponent(game.id)}`;
            });
            gameCard.appendChild(playButton);

            fragment.appendChild(gameCard);
        });
        gameListContainer.appendChild(fragment);
    }

    loadGames();
});
