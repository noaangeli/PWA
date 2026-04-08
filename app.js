const API_KEY = 'f28e568459557cd59382e6d8';
const baseSelect = document.getElementById('base-currency');
const targetSelect = document.getElementById('currency-select');
const amountInput = document.getElementById('amount-input');

async function convert() {
    const base = baseSelect.value;
    const target = targetSelect.value;
    const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${base}`;
    
    try {
        // 1. Tenter de récupérer les données en ligne
        const response = await fetch(url);
        if (!response.ok) throw new Error("Erreur réseau");
        
        const data = await response.json();
        
        // 2. Sauvegarder les données dans IndexedDB pour plus tard
        const db = await dbPromise; // Utilise la variable globale de db.js
        await db.put('rates', data);
        
        // Mettre à jour l'interface (En ligne)
        updateUI(data, target, false);

    } catch (err) {
        console.warn("Échec du fetch, tentative de récupération depuis IndexedDB...", err);
        
        // 3. Mode Hors-ligne : Récupérer les taux depuis IndexedDB
        const db = await dbPromise;
        const cachedData = await db.get('rates', base);
        
        if (cachedData) {
            updateUI(cachedData, target, true);
        } else {
            // Si aucune donnée n'est en cache pour cette monnaie
            document.getElementById('result-value').innerText = "Indisponible";
            document.getElementById('last-update').innerText = "Pas de données en cache";
            document.getElementById('offline-banner').style.display = 'block';
        }
    }
}

// Fonction pour mettre à jour l'affichage
function updateUI(data, target, isOffline) {
    const rate = data.conversion_rates[target];
    const result = (amountInput.value * rate).toFixed(2);
    
    document.getElementById('result-value').innerText = `${result} ${target}`;
    
    if (isOffline) {
        document.getElementById('last-update').innerText = "Taux chargés du cache (hors-ligne)";
        document.getElementById('offline-banner').style.display = 'block';
    } else {
        document.getElementById('last-update').innerText = "Taux à jour (en ligne)";
        document.getElementById('offline-banner').style.display = 'none';
    }
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
}

[baseSelect, targetSelect, amountInput].forEach(el => el.addEventListener('input', convert));
window.addEventListener('DOMContentLoaded', convert);