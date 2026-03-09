const searchBtn = document.getElementById('searchBtn');
const pokemonInput = document.getElementById('pokemonInput');
const pokemonModal = document.getElementById('pokemonModal');
const closeModal = document.getElementById('closeModal');
const modalDetails = document.getElementById('modalDetails');
const favoritesList = document.getElementById('favoritesList');
const errorToast = document.getElementById('errorMessage');
const spinner = document.getElementById('loadingSpinner');

let searchHistory = JSON.parse(localStorage.getItem('pokedexHistory')) || [];
let favorites = JSON.parse(localStorage.getItem('pokedexFavorites')) || [];

function showError() {
    if (errorToast) {
        errorToast.classList.add('show');
        setTimeout(() => {
            errorToast.classList.remove('show');
        }, 3000);
    }
}

async function fetchEvolutions(pokemonName) {
    const evoContainer = document.getElementById('evolutionContainer');
    if (!evoContainer) return;

    try {
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName.toLowerCase()}`);
        const speciesData = await speciesRes.json();
        const evoRes = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoRes.json();

        let evoHtml = `<div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-top:10px; flex-wrap:wrap;">`;
        let currentEvo = evoData.chain;

        while (currentEvo) {
            const name = currentEvo.species.name;
            const pRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            const pData = await pRes.json();
            const img = pData.sprites.front_default;

            evoHtml += `
                <div style="text-align:center; cursor:pointer;" onclick="fetchPokemon('${name}')">
                    <img src="${img}" width="50" style="background:#f8f8f8; border-radius:50%; border:1px solid #dc0a2d;">
                    <p style="font-size:10px; margin:0; font-weight:bold;">${name.toUpperCase()}</p>
                </div>
            `;

            if (currentEvo.evolves_to.length > 0) {
                evoHtml += `<span style="font-weight:bold; color:#dc0a2d;">→</span>`;
                currentEvo = currentEvo.evolves_to[0];
            } else {
                currentEvo = null;
            }
        }
        evoHtml += `</div>`;
        evoContainer.innerHTML = `<strong style="font-size:13px; color:#333;">Lignée d'évolution :</strong>` + evoHtml;
    } catch (error) {
        evoContainer.innerHTML = "";
    }
}

async function fetchPokemon(nameOrId) {
    if (!nameOrId) return;

    pokemonModal.style.display = "flex";
    if (spinner) spinner.style.display = "block";
    modalDetails.innerHTML = ""; 

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId.toString().toLowerCase().trim()}`);
        if (!response.ok) throw new Error();
        
        const pokemon = await response.json();

        addToHistory({
            name: pokemon.name,
            sprite: pokemon.sprites.front_default
        });

        modalDetails.innerHTML = `
            <div class="pokemon-modal-view">
                <h2 style="color: #dc0a2d; margin: 0 0 10px 0;">${pokemon.name.toUpperCase()} (#${pokemon.id})</h2>
                <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" alt="${pokemon.name}" style="width:180px;">
                <p><strong>Type(s):</strong> ${pokemon.types.map(t => t.type.name).join(', ')}</p>
                <p><strong>Poids:</strong> ${pokemon.weight / 10} kg | <strong>Taille:</strong> ${pokemon.height / 10} m</p>
                <div class="stats-container">
                    <ul style="display:flex; flex-wrap:wrap; justify-content:center; gap:5px; list-style:none; padding:10px 0;">
                        ${pokemon.stats.map(s => `<li style="background:#dc0a2d; color:white; padding:4px 10px; border-radius:15px; font-size:11px;">${s.stat.name}: ${s.base_stat}</li>`).join('')}
                    </ul>
                </div>
                <div id="evolutionContainer" style="margin-top:10px; border-top: 1px solid #eee; padding-top:10px;">
                    <p style="font-size:12px; color:gray;">Recherche des évolutions...</p>
                </div>
                <button onclick="toggleFavorite('${pokemon.name}', '${pokemon.sprites.front_default}')" 
                        style="background:#ffca28; color:black; border:none; padding:10px 20px; border-radius:20px; cursor:pointer; font-weight:bold; margin-top:15px;">
                    ⭐ Ajouter/Retirer des Favoris
                </button>
            </div>
        `;
        
        if (spinner) spinner.style.display = "none";
        fetchEvolutions(pokemon.name);
        pokemonInput.value = ""; 
        
    } catch (error) {
        pokemonModal.style.display = "none";
        showError();
    }
}

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
        li.className = "recommendation-item";
        li.innerHTML = `
            <img src="${pokemon.sprite}" alt="${pokemon.name}" width="50" style="display:block; margin:auto;">
            <span style="font-size: 11px; font-weight:bold;">${pokemon.name}</span>
        `;
        li.onclick = () => fetchPokemon(pokemon.name);
        historyList.appendChild(li);
    });
}

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
                <p style="font-size: 11px; margin:0; font-weight:bold;">${pokemon.name}</p>
            </div>
            <span style="color:#dc0a2d; font-size:10px; text-decoration:underline; cursor:pointer;" 
                  onclick="toggleFavorite('${pokemon.name}', '${pokemon.sprite}')">
                (Supprimer)
            </span>
        `;
        favoritesList.appendChild(favDiv);
    });
}

async function generateRecommendations() {
    const randomList = document.getElementById('randomList');
    if (!randomList) return;
    randomList.innerHTML = "<p>Chargement...</p>"; 
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 5; i++) {
        const randomId = Math.floor(Math.random() * 898) + 1;
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
            const p = await response.json();
            const pokemonDiv = document.createElement('div');
            pokemonDiv.className = "recommendation-item"; 
            pokemonDiv.innerHTML = `
                <img src="${p.sprites.front_default}" alt="${p.name}" width="70">
                <p style="font-size: 11px; margin:0; font-weight:bold;">${p.name}</p>
            `;
            pokemonDiv.onclick = () => fetchPokemon(p.name); 
            fragment.appendChild(pokemonDiv);
        } catch (e) {}
    }
    randomList.innerHTML = "";
    randomList.appendChild(fragment);
}

searchBtn.addEventListener('click', () => fetchPokemon(pokemonInput.value));
pokemonInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchPokemon(pokemonInput.value);
});
closeModal.onclick = () => { pokemonModal.style.display = "none"; };
window.onclick = (event) => {
    if (event.target == pokemonModal) pokemonModal.style.display = "none";
};
document.getElementById('refreshRecommendations').addEventListener('click', generateRecommendations);

updateHistoryDisplay();
updateFavoritesDisplay();
generateRecommendations();