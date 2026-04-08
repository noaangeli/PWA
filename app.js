const API_KEY = "f28e568459557cd59382e6d8";
const baseSelect = document.getElementById("base-currency");
const targetSelect = document.getElementById("currency-select");
const amountInput = document.getElementById("amount-input");

async function convert() {
  const base = baseSelect.value;
  const target = targetSelect.value;
  const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${base}`;

  if (!navigator.onLine) {
    console.log("🌐 Mode hors-ligne détecté immédiatement.");
    await fetchFromCache(base, target);
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erreur API");

    const data = await response.json();

    if (window.dbPromise) {
      const db = await window.dbPromise;
      await db.put("rates", data);
    }

    updateUI(data, target, false);
  } catch (err) {
    console.warn("La requête a échoué en cours de route", err);
    await fetchFromCache(base, target);
  }
}

async function fetchFromCache(base, target) {
  if (window.dbPromise) {
    const db = await window.dbPromise;
    const cachedData = await db.get("rates", base);

    if (cachedData) {
      updateUI(cachedData, target, true);
      return;
    }
  }
  document.getElementById("result-value").innerText = "---";
  document.getElementById("last-update").innerText = "Données non disponibles";
  document.getElementById("offline-banner").style.display = "block";
  document.getElementById("offline-banner").innerText =
    "⚠️ Connectez-vous pour télécharger les taux.";
}

function updateUI(data, target, isOffline) {
  const rate = data.conversion_rates[target];
  const result = (amountInput.value * rate).toFixed(2);

  document.getElementById("result-value").innerText = `${result} ${target}`;

  if (isOffline) {
    document.getElementById("last-update").innerText =
      "Taux chargés du cache (hors-ligne)";
    document.getElementById("offline-banner").style.display = "block";
  } else {
    document.getElementById("last-update").innerText = "Taux à jour (en ligne)";
    document.getElementById("offline-banner").style.display = "none";
  }
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}

[baseSelect, targetSelect, amountInput].forEach((el) =>
  el.addEventListener("input", convert),
);
window.addEventListener("DOMContentLoaded", convert);
