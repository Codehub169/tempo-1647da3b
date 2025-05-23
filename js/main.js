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
        },
        {
            id: 'falling_fun',
            title: 'Falling Fun',
            description: 'Catch the falling stars and hearts with your basket! How many can you get?',
            imageUrl: 'https://images.unsplash.com/photo-1609077502818-102719204697?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGZhbGxpbmclMjBzdGFyc3xlbnwwfHwwfHx8MA%3D&auto=format&fit=crop&w=300&q=80',
            icon: '\ud83e\uddfa', // Basket emoji U+1F9FA
            pageUrl: 'game.html'
        }
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
            // Attempt to insert before the first child of body, or append if no children
            body.insertBefore(errorMsg, body.firstChild || null);
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

            let imageOrIconAdded = false;
            if (game.imageUrl) {
                const img = document.createElement('img');
                img.src = game.imageUrl;
                img.alt = `${game.title} game preview`;
                img.onerror = () => { // Fallback if image fails to load
                    img.remove(); // Remove the broken image element
                    if (game.icon) {
                        const iconSpan = document.createElement('span');
                        iconSpan.className = 'icon'; // Ensure CSS for .icon is defined
                        iconSpan.textContent = game.icon;
                        iconSpan.setAttribute('aria-hidden', 'true');
                        // Insert icon where the image would have been, or at the start
                        if (gameCard.firstChild && gameCard.firstChild.nodeName !== 'H3') {
                            gameCard.insertBefore(iconSpan, gameCard.firstChild);
                        } else {
                            gameCard.prepend(iconSpan); // Add to the beginning if no image was there
                        }
                    }
                };
                gameCard.appendChild(img);
                imageOrIconAdded = true;
            } 
            
            if (!imageOrIconAdded && game.icon) {
                const iconSpan = document.createElement('span');
                iconSpan.className = 'icon';
                iconSpan.textContent = game.icon;
                iconSpan.setAttribute('aria-hidden', 'true');
                gameCard.prepend(iconSpan); // Add to the beginning of the card
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
                // Ensure game.pageUrl and game.id are valid before constructing URL
                if (typeof game.pageUrl === 'string' && typeof game.id === 'string') {
                    window.location.href = `${game.pageUrl}?game=${encodeURIComponent(game.id)}`;
                } else {
                    console.error('Invalid game data for navigation:', game);
                    alert('Cannot start this game due to an internal error.');
                }
            });
            gameCard.appendChild(playButton);

            fragment.appendChild(gameCard);
        });
        gameListContainer.appendChild(fragment);
    }

    loadGames();
});
