// Get HTML elements
const searchBtn = document.getElementById('searchBtn');
const pokemonInput = document.getElementById('pokemonInput');
const pokemonCard = document.getElementById('pokemonCard');
const pokemonModal = document.getElementById('pokemonModal');
const closeModal = document.getElementById('closeModal');
const modalDetails = document.getElementById('modalDetails');
const favoritesList = document.getElementById('favoritesList');

let searchHistory = []; 
let favorites = []; 

// 1. Function to fetch a Pokemon from the API
async function fetchPokemon(nameOrId) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId.toLowerCase()}`);
        if (!response.ok) {
            throw new Error("Pokemon not found");
        }
        const pokemon = await response.json();
        displayPokemon(pokemon); 
    } catch (error) {
        pokemonCard.style.display = "block";
        pokemonCard.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

// 2. Function to display the Pokemon on the main page (FULL INFO DIRECTLY)
function displayPokemon(pokemon) {
    addToHistory({
        name: pokemon.name,
        sprite: pokemon.sprites.front_default
    });

    // Make the card visible
    pokemonCard.style.display = "block";

    // Directly show all details in the main card
    pokemonCard.innerHTML = `
        <div class="pokemon-main-card">
            <h2>${pokemon.name.toUpperCase()}</h2>
            <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" style="width:180px;">
            
            <p><strong>Type:</strong> ${pokemon.types.map(t => t.type.name).join(', ')}</p>
            <p><strong>Weight:</strong> ${pokemon.weight / 10} kg | <strong>Height:</strong> ${pokemon.height / 10} m</p>

            <div class="stats-container">
                <strong>Statistics:</strong>
                <ul style="padding:0; list-style:none; display:flex; flex-wrap:wrap; justify-content:center; gap:5px;">
                    ${pokemon.stats.map(s => `<li style="background:#ef5350; color:white; padding:3px 8px; border-radius:10px; font-size:11px;">${s.stat.name}: ${s.base_stat}</li>`).join('')}
                </ul>
            </div>

            <button onclick="toggleFavorite('${pokemon.name}', '${pokemon.sprites.front_default}')" 
                    style="background:#ffca28; color:black; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; margin-top:10px;">
                ⭐ Add to Favorites
            </button>
        </div>
    `;
}

// 3. Search button click event
searchBtn.addEventListener('click', () => {
    const value = pokemonInput.value;
    if (value) {
        fetchPokemon(value);
    }
});

// 4. Function for the MODAL (Used by Recommendations)
async function showDetails(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const p = await response.json();

        modalDetails.innerHTML = `
            <h2>${p.name.toUpperCase()}</h2>
            <img src="${p.sprites.other['official-artwork'].front_default}" width="150">
            <p><strong>Weight:</strong> ${p.weight / 10} kg</p>
            <p><strong>Height:</strong> ${p.height / 10} m</p>
            <div>
                <strong>Statistics:</strong>
                <ul>
                    ${p.stats.map(s => `<li>${s.stat.name}: ${s.base_stat}</li>`).join('')}
                </ul>
            </div>
        `;
        pokemonModal.style.display = "block";
    } catch (error) {
        console.error("Modal error:", error);
    }
}

// 5. Close modal
closeModal.onclick = () => pokemonModal.style.display = "none";

// 6. Manage search history
function addToHistory(pokemonObj) {
    searchHistory = searchHistory.filter(item => item.name !== pokemonObj.name);
    searchHistory.unshift(pokemonObj);
    if (searchHistory.length > 5) {
        searchHistory.pop();
    }
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = ''; 
    searchHistory.forEach(pokemon => {
        const li = document.createElement('li');
        li.style.textAlign = "center";
        li.style.display = "inline-block";
        li.style.padding = "10px";
        li.style.cursor = "pointer";
        li.innerHTML = `
            <img src="${pokemon.sprite}" alt="${pokemon.name}" width="60" style="display:block; margin:auto;">
            <span style="font-size: 12px;">${pokemon.name}</span>
        `;
        li.onclick = () => fetchPokemon(pokemon.name);
        historyList.appendChild(li);
    });
}

// 7. Recommendations
async function generateRecommendations() {
    const randomList = document.getElementById('randomList');
    randomList.innerHTML = ""; 
    for (let i = 0; i < 5; i++) {
        const randomId = Math.floor(Math.random() * 1010) + 1;
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
            const p = await response.json();
            const pokemonDiv = document.createElement('div');
            pokemonDiv.className = "recommendation-item"; 
            pokemonDiv.style.display = "inline-block";
            pokemonDiv.style.margin = "10px";
            pokemonDiv.style.cursor = "pointer";
            pokemonDiv.innerHTML = `
                <img src="${p.sprites.front_default}" alt="${p.name}" width="80">
                <p style="font-size: 12px; margin:0;">${p.name}</p>
            `;
            // Recommendations still open the modal
            pokemonDiv.onclick = () => showDetails(p.id);
            randomList.appendChild(pokemonDiv);
        } catch (error) {
            console.error("Recommendation error:", error);
        }
    }
}

// 8. FAVORITES LOGIC
function toggleFavorite(name, sprite) {
    const index = favorites.findIndex(p => p.name === name);
    if (index === -1) {
        favorites.push({ name, sprite });
    } else {
        favorites.splice(index, 1);
    }
    updateFavoritesDisplay();
}

function updateFavoritesDisplay() {
    favoritesList.innerHTML = ''; 
    favorites.forEach(pokemon => {
        const favDiv = document.createElement('div');
        favDiv.className = "recommendation-item"; // Reuse same style
        favDiv.style.display = "inline-block";
        favDiv.style.margin = "10px";
        favDiv.style.textAlign = "center";
        favDiv.style.cursor = "pointer";
        
        // 1. Click on the image/name shows the card
        favDiv.innerHTML = `
            <div onclick="fetchPokemon('${pokemon.name}')">
                <img src="${pokemon.sprite}" alt="${pokemon.name}" width="60">
                <p style="font-size: 12px; margin:0;">${pokemon.name}</p>
            </div>
            <span style="color:red; font-size:10px; text-decoration:underline;" 
                  onclick="toggleFavorite('${pokemon.name}', '${pokemon.sprite}')">
                (Remove)
            </span>
        `;
        favoritesList.appendChild(favDiv);
    });
}

// INITIALIZATION
// Hide the main card container at the start to avoid white band
pokemonCard.style.display = "none";
generateRecommendations();