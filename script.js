// Game variables
let currentPokemon = null;
let attempts = 0;
let hintsUsed = 0;
const maxHints = 5;
let hintsRevealed = {
    type: false,
    habitat: false,
    height: false,
    weight: false,
    generation: false
};

// DOM elements
const pokemonImage = document.getElementById('pokemon-image');
const guessInput = document.getElementById('guess-input');
const submitGuess = document.getElementById('submit-guess');
const hintTypeBtn = document.getElementById('hint-type');
const hintHabitatBtn = document.getElementById('hint-habitat');
const hintHeightBtn = document.getElementById('hint-height');
const hintWeightBtn = document.getElementById('hint-weight');
const hintGenBtn = document.getElementById('hint-gen');
const newGameBtn = document.getElementById('new-game');
const resultMessage = document.getElementById('result-message');
const revealName = document.getElementById('reveal-name');
const attemptsDisplay = document.getElementById('attempts');
const hintsUsedDisplay = document.getElementById('hints-used');

// Hint display elements
const hintTypes = document.querySelector('#hint-types .hint-value');
const hintHabitat = document.querySelector('#hint-habitat .hint-value');
const hintHeight = document.querySelector('#hint-height .hint-value');
const hintWeight = document.querySelector('#hint-weight .hint-value');
const hintGeneration = document.querySelector('#hint-generation .hint-value');

// Initialize game
async function initGame() {
    // Reset game state
    attempts = 0;
    hintsUsed = 0;
    hintsRevealed = {
        type: false,
        habitat: false,
        height: false,
        weight: false,
        generation: false
    };
    
    updateStats();
    resetHints();
    clearResultMessage();
    revealName.textContent = '';
    revealName.style.opacity = '0';
    guessInput.value = '';
    guessInput.disabled = false;
    submitGuess.disabled = false;
    
    // Enable all hint buttons
    document.querySelectorAll('.hint-buttons button').forEach(btn => {
        btn.disabled = false;
    });
    
    // Get a random Pokémon ID (1-1025 for all generations up to Scarlet/Violet)
    const randomId = Math.floor(Math.random() * 1025) + 1;
    
    try {
        // Fetch Pokémon data
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        const pokemonData = await pokemonResponse.json();
        
        // Fetch species data for habitat and generation info
        const speciesResponse = await fetch(pokemonData.species.url);
        const speciesData = await speciesResponse.json();
        
        currentPokemon = {
            id: pokemonData.id,
            name: pokemonData.name,
            types: pokemonData.types.map(t => t.type.name),
            height: pokemonData.height,
            weight: pokemonData.weight,
            sprite: pokemonData.sprites.other['official-artwork'].front_default || 
                   pokemonData.sprites.front_default,
            habitat: speciesData.habitat?.name || 'desconhecido',
            generation: getGenerationFromUrl(speciesData.generation.url)
        };
        
        pokemonImage.src = currentPokemon.sprite;
        pokemonImage.style.filter = 'brightness(0) contrast(0)';
        
        // Focus input field
        guessInput.focus();
    } catch (error) {
        console.error('Error fetching Pokémon:', error);
        showResultMessage('Erro ao carregar Pokémon. Tente novamente!', false);
    }
}

function getGenerationFromUrl(url) {
    const genNumber = url.split('/').slice(-2, -1)[0];
    return `Geração ${genNumber}`;
}

function resetHints() {
    hintTypes.textContent = '????';
    hintHabitat.textContent = '????';
    hintHeight.textContent = '????';
    hintWeight.textContent = '????';
    hintGeneration.textContent = '????';
}

function updateStats() {
    attemptsDisplay.textContent = `Tentativas: ${attempts}`;
    hintsUsedDisplay.textContent = `Dicas: ${hintsUsed}/${maxHints}`;
}

function showResultMessage(message, isCorrect) {
    resultMessage.textContent = message;
    resultMessage.className = isCorrect ? 'result-message correct-message' : 'result-message incorrect-message';
}

function clearResultMessage() {
    resultMessage.textContent = '';
    resultMessage.className = 'result-message';
}

function revealPokemon() {
    pokemonImage.style.filter = 'none';
    revealName.textContent = currentPokemon.name;
    revealName.style.opacity = '1';
    guessInput.disabled = true;
    submitGuess.disabled = true;
    
    // Disable all hint buttons
    document.querySelectorAll('.hint-buttons button').forEach(btn => {
        btn.disabled = true;
    });
}

function checkGuess() {
    if (!currentPokemon) return;
    
    const guess = guessInput.value.trim().toLowerCase();
    if (!guess) return;
    
    attempts++;
    updateStats();
    
    if (guess === currentPokemon.name.toLowerCase()) {
        // Correct guess
        showResultMessage(`Correto! É ${currentPokemon.name.charAt(0).toUpperCase() + currentPokemon.name.slice(1)}!`, true);
        revealPokemon();
    } else {
        // Incorrect guess
        showResultMessage('Incorreto! Tente novamente.', false);
        guessInput.value = '';
        guessInput.focus();
    }
}

function revealHint(hintType) {
    if (!currentPokemon || hintsUsed >= maxHints || hintsRevealed[hintType]) return;
    
    hintsUsed++;
    hintsRevealed[hintType] = true;
    updateStats();
    
    switch(hintType) {
        case 'type':
            hintTypes.textContent = currentPokemon.types.join(', ');
            hintTypeBtn.disabled = true;
            break;
        case 'habitat':
            hintHabitat.textContent = currentPokemon.habitat;
            hintHabitatBtn.disabled = true;
            break;
        case 'height':
            hintHeight.textContent = `${currentPokemon.height / 10}m`;
            hintHeightBtn.disabled = true;
            break;
        case 'weight':
            hintWeight.textContent = `${currentPokemon.weight / 10}kg`;
            hintWeightBtn.disabled = true;
            break;
        case 'generation':
            hintGeneration.textContent = currentPokemon.generation;
            hintGenBtn.disabled = true;
            break;
    }
}

// Event listeners
submitGuess.addEventListener('click', checkGuess);

guessInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkGuess();
    }
});

hintTypeBtn.addEventListener('click', () => revealHint('type'));
hintHabitatBtn.addEventListener('click', () => revealHint('habitat'));
hintHeightBtn.addEventListener('click', () => revealHint('height'));
hintWeightBtn.addEventListener('click', () => revealHint('weight'));
hintGenBtn.addEventListener('click', () => revealHint('generation'));

newGameBtn.addEventListener('click', initGame);

// Start the game
initGame();