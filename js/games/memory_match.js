// js/games/memory_match.js

window.MemoryMatch = (() => {
    let canvas, ctx;
    let score = 0;
    let level = 1;
    let updateScoreCallback;
    let updateLevelCallback;

    const gameConfig = {
        cardWidth: 80,
        cardHeight: 100,
        cardPadding: 10,
        cardColor: '#FFD700', // Gold
        cardBackColor: '#1E90FF', // Dodger Blue
        cardBorderColor: '#333',
        symbols: ['\ud83c\udf4e', '\ud83c\udf4c', '\ud83c\udf53', '\ud83c\udf4a', '\ud83c\udf52', '\ud83c\udf51', '\ud83c\udf4d', '\ud83e\udd5d'], // Apple, Banana, Strawberry, Orange, Cherry, Peach, Pineapple, Kiwi
        font: '30px Comic Sans MS',
        matchBonus: 10,
        levelUpScoreThreshold: 50, // Score needed per level to advance
        maxLevel: 3, 
        cardsPerRow: 4,
        backgroundColor: '#F0F8FF' // Alice Blue
    };

    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let canFlip = true;
    let eventListenerAttached = false;

    function getSymbolsForLevel(currentLevel) {
        // Level 1: 4 pairs, Level 2: 6 pairs, Level 3: 8 pairs
        // Based on cardsPerRow = 4, this means 8, 12, 16 cards respectively.
        let numPairs = gameConfig.cardsPerRow + (currentLevel - 1) * 2;
        numPairs = Math.min(numPairs, gameConfig.symbols.length); // Ensure we don't request more symbols than available
        return gameConfig.symbols.slice(0, numPairs);
    }

    function init(canvasElement, fnScoreUpdate, fnLevelUpdate) {
        if (!canvasElement || typeof canvasElement.getContext !== 'function') {
            console.error("MemoryMatch.init: Invalid canvas element provided.");
            // game_loader.js should prevent this, but as a safeguard:
            if (fnLevelUpdate) fnLevelUpdate("Err"); 
            if (fnScoreUpdate) fnScoreUpdate("Err");
            return;
        }
        canvas = canvasElement;
        ctx = canvas.getContext('2d');
        updateScoreCallback = fnScoreUpdate;
        updateLevelCallback = fnLevelUpdate;

        level = 1;
        score = 0;
        
        setupGameForLevel();
        setupEventListeners();

        console.log("Memory Match Game Initialized");
    }

    function setupGameForLevel() {
        matchedPairs = 0;
        flippedCards = [];
        canFlip = true;
        const currentSymbols = getSymbolsForLevel(level);
        
        if (currentSymbols.length === 0) {
            console.error("Memory Match: No symbols available for level " + level);
            if(ctx && canvas) {
                ctx.fillStyle = gameConfig.backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'red';
                ctx.font = '16px Arial'; // Using a widely available font for error message
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Error: Could not load symbols for this level.', canvas.width / 2, canvas.height / 2);
            }
            canFlip = false;
            return;
        }

        let tempCards = [];
        currentSymbols.forEach(symbol => {
            tempCards.push({ symbol: symbol, isFlipped: false, isMatched: false });
            tempCards.push({ symbol: symbol, isFlipped: false, isMatched: false });
        });

        // Fisher-Yates Shuffle for better randomness
        for (let i = tempCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tempCards[i], tempCards[j]] = [tempCards[j], tempCards[i]];
        }
        cards = tempCards;

        const numRows = Math.ceil(cards.length / gameConfig.cardsPerRow);
        canvas.width = gameConfig.cardsPerRow * (gameConfig.cardWidth + gameConfig.cardPadding) + gameConfig.cardPadding;
        canvas.height = numRows * (gameConfig.cardHeight + gameConfig.cardPadding) + gameConfig.cardPadding;
        
        if (typeof ctx.roundRect !== 'function') {
            console.warn("CanvasRenderingContext2D.roundRect() is not supported. Using basic fillRect.");
        }

        cards.forEach((card, index) => {
            card.id = index; // Unique ID for each card
            card.x = (index % gameConfig.cardsPerRow) * (gameConfig.cardWidth + gameConfig.cardPadding) + gameConfig.cardPadding;
            card.y = Math.floor(index / gameConfig.cardsPerRow) * (gameConfig.cardHeight + gameConfig.cardPadding) + gameConfig.cardPadding;
        });
        
        if(updateScoreCallback) updateScoreCallback(score);
        if(updateLevelCallback) updateLevelCallback(level);
        draw();
    }

    function setupEventListeners() {
        if (!canvas) return;
        if (eventListenerAttached) {
            canvas.removeEventListener('click', handleCanvasClick);
        }
        canvas.addEventListener('click', handleCanvasClick);
        eventListenerAttached = true;
    }

    function handleCanvasClick(event) {
        if (!canFlip || flippedCards.length >= 2 || !canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        for (let card of cards) {
            if (!card.isFlipped && !card.isMatched &&
                clickX >= card.x && clickX <= card.x + gameConfig.cardWidth &&
                clickY >= card.y && clickY <= card.y + gameConfig.cardHeight) {
                flipCard(card);
                break;
            }
        }
    }

    function flipCard(card) {
        if (card.isFlipped) return; // Do not flip already flipped card in current turn

        card.isFlipped = true;
        flippedCards.push(card);
        draw();

        if (flippedCards.length === 2) {
            canFlip = false;
            setTimeout(checkForMatch, 1000); // Delay to let player see the second card
        }
    }

    function checkForMatch() {
        const [card1, card2] = flippedCards;
        let gameResettingDueToLevelChange = false;

        if (card1.symbol === card2.symbol && card1.id !== card2.id) {
            card1.isMatched = true;
            card2.isMatched = true;
            matchedPairs++;
            score += gameConfig.matchBonus;
            if(updateScoreCallback) updateScoreCallback(score);

            if (matchedPairs * 2 === cards.length) { // All pairs on current level found
                gameResettingDueToLevelChange = true;
                if (level < gameConfig.maxLevel) {
                    if (score >= gameConfig.levelUpScoreThreshold * level) { // Score threshold might scale with level or be cumulative
                                                                        // Original: gameConfig.levelUpScoreThreshold (score for current level attempt)
                        level++;
                        alert(`Level Up! Moving to Level ${level}.`);
                        score = 0; // Reset score for the new level
                    } else {
                        alert(`Great job! You found all pairs! You need ${gameConfig.levelUpScoreThreshold} points on this level to advance. Try this level again!`);
                        score = 0; // Reset score to retry current level with 0 points
                    }
                } else {
                    alert('Congratulations! You completed all levels! Play again?');
                    level = 1; 
                    score = 0; 
                }
                setupGameForLevel(); // This will handle UI updates for score/level and redraw
            }
        } else {
            // Not a match, or same card clicked (though logic should prevent latter)
            card1.isFlipped = false;
            card2.isFlipped = false;
        }

        flippedCards = [];
        canFlip = true;

        if (!gameResettingDueToLevelChange) {
             draw(); // Redraw to flip cards back or show newly matched pair if not all pairs are found yet
        }
    }

    function draw() {
        if (!ctx || !canvas) return;
        ctx.fillStyle = gameConfig.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        cards.forEach(card => {
            ctx.fillStyle = card.isFlipped || card.isMatched ? gameConfig.cardColor : gameConfig.cardBackColor;
            ctx.strokeStyle = gameConfig.cardBorderColor;
            ctx.lineWidth = 2;

            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(card.x, card.y, gameConfig.cardWidth, gameConfig.cardHeight, [10]); // 10 is radius
            } else {
                // Fallback for browsers not supporting roundRect
                ctx.rect(card.x, card.y, gameConfig.cardWidth, gameConfig.cardHeight);
            }
            ctx.fill();
            ctx.stroke();

            if (card.isFlipped || card.isMatched) {
                ctx.fillStyle = '#000'; // Symbol color
                ctx.font = gameConfig.font;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(card.symbol, card.x + gameConfig.cardWidth / 2, card.y + gameConfig.cardHeight / 2 + 5); // Small offset for better vertical centering of emojis
            }
        });
    }

    return {
        init: init
    };
})();
