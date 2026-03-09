// On récupère les éléments HTML dont on a besoin
const searchBtn = document.getElementById('searchBtn');
const pokemonInput = document.getElementById('pokemonInput');
const pokemonCard = document.getElementById('pokemonCard');
const pokemonModal = document.getElementById('pokemonModal');
const closeModal = document.getElementById('closeModal');
const modalDetails = document.getElementById('modalDetails');

// 1. Fonction pour aller chercher un Pokémon sur l'API
async function fetchPokemon(nameOrId) {
    try {
        // On transforme le nom en minuscules (l'API n'aime pas les Majuscules)
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId.toLowerCase()}`);
        
        if (!response.ok) {
            throw new Error("Pokémon non trouvé");
        }

        const pokemon = await response.json();
        displayPokemon(pokemon); // Si on le trouve, on l'affiche
    } catch (error) {
        pokemonCard.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

// 2. Fonction pour afficher le Pokémon dans la page
function displayPokemon(pokemon) {
    addToHistory(pokemon.name);
    pokemonCard.innerHTML = `
        <h2>${pokemon.name.toUpperCase()}</h2>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p>Type: ${pokemon.types.map(t => t.type.name).join(', ')}</p>
        <button onclick="showDetails(${pokemon.id})">Voir Détails</button>
    `;
}

// 3. Écouter le clic sur le bouton Rechercher
searchBtn.addEventListener('click', () => {
    const value = pokemonInput.value;
    if (value) {
        fetchPokemon(value);
    }
});
let searchHistory = []; // Tableau pour stocker l'historique

// 4. Fonction pour afficher la MODAL avec les détails
async function showDetails(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const p = await response.json();

        // On remplit la modal avec les infos (Poids, Taille, Stats)
        modalDetails.innerHTML = `
            <h2>${p.name.toUpperCase()}</h2>
            <img src="${p.sprites.other['official-artwork'].front_default}" width="150">
            <p><strong>Poids :</strong> ${p.weight / 10} kg</p>
            <p><strong>Taille :</strong> ${p.height / 10} m</p>
            <div>
                <strong>Statistiques :</strong>
                <ul style="text-align:left; display:inline-block;">
                    ${p.stats.map(s => `<li>${s.stat.name}: ${s.base_stat}</li>`).join('')}
                </ul>
            </div>
        `;
        pokemonModal.style.display = "block"; // On montre la modal
    } catch (error) {
        console.error("Erreur modal:", error);
    }
}

// 5. Fermer la modal quand on clique sur le "X"
closeModal.onclick = () => pokemonModal.style.display = "none";

// 6. Gérer l'historique des 5 dernières recherches
function addToHistory(name) {
    // Si le nom est déjà dans la liste, on l'enlève pour le remettre au début
    searchHistory = searchHistory.filter(item => item !== name);
    
    // On ajoute le nouveau nom au début du tableau
    searchHistory.unshift(name);

    // On garde seulement les 5 derniers
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

// MODIFICATION de ta fonction fetch pour inclure l'historique
// Remplace juste la fin de ta fonction fetchPokemon (là où il y a displayPokemon)
// ou ajoute simplement cette ligne dans ta fonction displayPokemon existante :
// addToHistory(pokemon.name);