// Get HTML elements
const searchBtn = document.getElementById('searchBtn');
const pokemonInput = document.getElementById('pokemonInput');
const pokemonModal = document.getElementById('pokemonModal');
const closeModal = document.getElementById('closeModal');
const modalDetails = document.getElementById('modalDetails');
const favoritesList = document.getElementById('favoritesList');
const errorToast = document.getElementById('errorMessage');

// --- INITIALISATION DE LA MÉMOIRE LOCALE ---
let searchHistory = JSON.parse(localStorage.getItem('pokedexHistory')) || [];
let favorites = JSON.parse(localStorage.getItem('pokedexFavorites')) || [];

// --- FONCTION : Affichage de l'erreur temporaire (TOAST) ---
function showError() {
    const errorBox = document.getElementById('errorMessage');
    if (errorBox) {
        errorBox.classList.remove('show');
        setTimeout(() => {
            errorBox.classList.add('show');
        }, 10);
        setTimeout(() => {
            errorBox.classList.remove('show');
        }, 3000);
    }
}

// 1. Function to fetch a Pokemon with LOADING ANIMATION
async function fetchPokemon(nameOrId) {
    if (!nameOrId) return;

    // Éléments pour l'animation de chargement
    const spinner = document.getElementById('loadingSpinner');
    const modalContent = document.querySelector('.modal-content');

    // On affiche la modal, on montre le spinner et on cache le contenu
    pokemonModal.style.display = "flex";
    if (spinner) spinner.style.display = "block";
    if (modalContent) modalContent.style.opacity = "0"; 

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId.toLowerCase()}`);
        
        if (!response.ok) {
            throw new Error("Pokemon not found");
        }
        
        const pokemon = await response.json();

        addToHistory({
            name: pokemon.name,
            sprite: pokemon.sprites.front_default
        });

        // Contenu de la fenêtre modale
        modalDetails.innerHTML = `
            <div class="pokemon-modal-view">
                <h2 style="color: #dc0a2d;">${pokemon.name.toUpperCase()}</h2>
                <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" style="width:220px;">
                <p><strong>Type:</strong> ${pokemon.types.map(t => t.type.name).join(', ')}</p>
                <p><strong>Poids:</strong> ${pokemon.weight / 10} kg | <strong>Taille:</strong> ${pokemon.height / 10} m</p>
                <div class="stats-container">
                    <strong>Statistiques :</strong>
                    <ul style="display:flex; flex-wrap:wrap; justify-content:center; gap:5px; list-style:none; padding:10px;">
                        ${pokemon.stats.map(s => `<li style="background:#dc0a2d; color:white; padding:4px 10px; border-radius:10px; font-size:12px;">${s.stat.name}: ${s.base_stat}</li>`).join('')}
                    </ul>
                </div>
                <button onclick="toggleFavorite('${pokemon.name}', '${pokemon.sprites.front_default}')" 
                        style="background:#ffca28; color:black; border:none; padding:10px 20px; border-radius:10px; cursor:pointer; font-weight:bold; margin-top:10px;">
                    ⭐ Ajouter aux Favoris
                </button>
            </div>
        `;
        
        // On cache le spinner et on affiche le contenu avec l'animation CSS
        if (spinner) spinner.style.display = "none";
        if (modalContent) {
            modalContent.style.opacity = "1";
            modalContent.style.display = "block";
        }
        
        pokemonInput.value = ""; 
        
    } catch (error) {
        // En cas d'erreur, on referme la modal et on montre le Toast
        pokemonModal.style.display = "none";
        showError();
    }
}

// 2. Gestion de l'historique
function addToHistory(pokemonObj) {
    searchHistory = searchHistory.filter(item => item.name !== pokemonObj.name);
    searchHistory.unshift(pokemonObj);
    if (searchHistory.length > 5) searchHistory.pop();
    
    localStorage.setItem('pokedexHistory', JSON.stringify(searchHistory));
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    historyList.innerHTML = ''; 
    
    searchHistory.forEach(pokemon => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${pokemon.sprite}" alt="${pokemon.name}" width="60" style="display:block; margin:auto;">
            <span style="font-size: 12px; font-weight:bold;">${pokemon.name}</span>
        `;
        li.onclick = () => fetchPokemon(pokemon.name);
        historyList.appendChild(li);
    });
}

// 3. Favoris
function toggleFavorite(name, sprite) {
    const index = favorites.findIndex(p => p.name === name);
    if (index === -1) {
        favorites.push({ name, sprite });
    } else {
        favorites.splice(index, 1);
    }
    
    localStorage.setItem('pokedexFavorites', JSON.stringify(favorites));
    updateFavoritesDisplay();
}

function updateFavoritesDisplay() {
    if (!favoritesList) return;
    favoritesList.innerHTML = ''; 
    
    favorites.forEach(pokemon => {
        const favDiv = document.createElement('div');
        favDiv.className = "recommendation-item"; 
        favDiv.innerHTML = `
            <div onclick="fetchPokemon('${pokemon.name}')">
                <img src="${pokemon.sprite}" alt="${pokemon.name}" width="60">
                <p style="font-size: 12px; margin:0; font-weight:bold;">${pokemon.name}</p>
            </div>
            <span style="color:red; font-size:10px; text-decoration:underline; cursor:pointer;" 
                  onclick="toggleFavorite('${pokemon.name}', '${pokemon.sprite}')">
                (Supprimer)
            </span>
        `;
        favoritesList.appendChild(favDiv);
    });
}

// 4. Recommendations
async function generateRecommendations() {
    const randomList = document.getElementById('randomList');
    if (!randomList) return;
    randomList.innerHTML = ""; 
    
    for (let i = 0; i < 5; i++) {
        const randomId = Math.floor(Math.random() * 1010) + 1;
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
            const p = await response.json();
            
            const pokemonDiv = document.createElement('div');
            pokemonDiv.className = "recommendation-item"; 
            pokemonDiv.innerHTML = `
                <img src="${p.sprites.front_default}" alt="${p.name}" width="80">
                <p style="font-size: 12px; margin:0; font-weight:bold;">${p.name}</p>
            `;
            pokemonDiv.onclick = () => fetchPokemon(p.name); 
            randomList.appendChild(pokemonDiv);
        } catch (error) {
            console.error("Erreur recommandation:", error);
        }
    }
}

// --- EVENEMENTS ---
searchBtn.addEventListener('click', () => {
    const value = pokemonInput.value.trim();
    fetchPokemon(value);
});

pokemonInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchBtn.click();
});

closeModal.onclick = () => {
    pokemonModal.style.display = "none";
};

window.onclick = (event) => {
    if (event.target == pokemonModal) {
        pokemonModal.style.display = "none";
    }
};

document.getElementById('refreshRecommendations').addEventListener('click', generateRecommendations);

// --- CHARGEMENT INITIAL ---
updateHistoryDisplay();
updateFavoritesDisplay();
generateRecommendations();