// Get HTML elements
const searchBtn = document.getElementById('searchBtn');
const pokemonInput = document.getElementById('pokemonInput');
const pokemonCard = document.getElementById('pokemonCard');
const pokemonModal = document.getElementById('pokemonModal');
const closeModal = document.getElementById('closeModal');
const modalDetails = document.getElementById('modalDetails');

let searchHistory = []; // Array to store history

// 1. Function to fetch a Pokemon from the API
async function fetchPokemon(nameOrId) {
    try {
        // Convert input to lowercase as the API requires it
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId.toLowerCase()}`);
        
        if (!response.ok) {
            throw new Error("Pokemon not found"); // Error message translated [cite: 11]
        }

        const pokemon = await response.json();
        displayPokemon(pokemon); 
    } catch (error) {
        pokemonCard.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

// 2. Function to display the Pokemon on the main page
function displayPokemon(pokemon) {
    addToHistory(pokemon.name); // Add to the history list [cite: 15]
    pokemonCard.innerHTML = `
        <h2>${pokemon.name.toUpperCase()}</h2>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p>Type: ${pokemon.types.map(t => t.type.name).join(', ')}</p>
        <button onclick="showDetails(${pokemon.id})">View Details</button>
    `;
}

// 3. Search button click event
searchBtn.addEventListener('click', () => {
    const value = pokemonInput.value;
    if (value) {
        fetchPokemon(value); // Search by name or ID [cite: 9]
    }
});

// 4. Function to display the MODAL with detailed info [cite: 13]
async function showDetails(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const p = await response.json();

        // Fill the modal with weight, height, and stats [cite: 13]
        modalDetails.innerHTML = `
            <h2>${p.name.toUpperCase()}</h2>
            <img src="${p.sprites.other['official-artwork'].front_default}" width="150">
            <p><strong>Weight:</strong> ${p.weight / 10} kg</p>
            <p><strong>Height:</strong> ${p.height / 10} m</p>
            <div>
                <strong>Statistics:</strong>
                <ul style="text-align:left; display:inline-block;">
                    ${p.stats.map(s => `<li>${s.stat.name}: ${s.base_stat}</li>`).join('')}
                </ul>
            </div>
        `;
        pokemonModal.style.display = "block"; // Show the modal
    } catch (error) {
        console.error("Modal error:", error);
    }
}

// 5. Close modal when clicking the "X"
closeModal.onclick = () => pokemonModal.style.display = "none";

// 6. Manage search history (limit to 5) [cite: 15]
function addToHistory(name) {
    // Remove if already exists to move it to the top
    searchHistory = searchHistory.filter(item => item !== name);
    
    // Add new name to the beginning
    searchHistory.unshift(name);

    // Keep only the last 5 [cite: 15]
    if (searchHistory.length > 5) {
        searchHistory.pop();
    }

    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = searchHistory.map(name => 
        `<li onclick="fetchPokemon('${name}')">${name}</li>`
    ).join('');
}

// 7. Function to generate 5 random Pokemon recommendations [cite: 18]
async function generateRecommendations() {
    const randomList = document.getElementById('randomList');
    randomList.innerHTML = ""; 

    for (let i = 0; i < 5; i++) {
        const randomId = Math.floor(Math.random() * 1010) + 1;
        
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
            const p = await response.json();

            const pokemonDiv = document.createElement('div');
            pokemonDiv.className = "recommendation-item"; // Useful for CSS
            pokemonDiv.style.display = "inline-block";
            pokemonDiv.style.margin = "10px";
            pokemonDiv.style.cursor = "pointer";
            
            pokemonDiv.innerHTML = `
                <img src="${p.sprites.front_default}" alt="${p.name}" width="80">
                <p style="font-size: 12px;">${p.name}</p>
            `;

            // Click to show details in modal [cite: 18]
            pokemonDiv.onclick = () => showDetails(p.id);
            
            randomList.appendChild(pokemonDiv);
        } catch (error) {
            console.error("Recommendation error:", error);
        }
    }
}

// INITIALIZATION: Run recommendations on page load [cite: 17]
generateRecommendations();