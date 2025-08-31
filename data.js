const API_KEY = "CYHSGLQLL5W6KRGH";

const stockAlert = document.getElementById('stock-alert');
const alertText = document.getElementById('alert-text');
const closeAlertBtn = document.getElementById('close-alert');
const tickerInput = document.getElementById('ticker-input');
const searchBtn = document.getElementById('search-btn');
const stockDataContainer = document.getElementById('stock-data');

let lastPrices = {};
let monitoringTickers = {};

// Show alert with live price
function showStockAlert(message) {
    alertText.innerHTML = message;
    stockAlert.classList.remove('hidden');
    setTimeout(() => stockAlert.classList.add('hidden'), 5000);
}

closeAlertBtn.addEventListener('click', () => {
    stockAlert.classList.add('hidden');
});

// Fetch stock price from Finnhub
async function fetchStockPrice(ticker) {
    try {
        const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${API_KEY}`;
        const response = await fetch(quoteUrl);
        if (!response.ok) throw new Error('Failed to fetch stock price');
        const data = await response.json();
        return data.c; // current price
    } catch (err) {
        console.error(err);
        return null;
    }
}

// Display stock data on page
async function displayStockData(ticker) {
    const currentPrice = await fetchStockPrice(ticker);
    if (!currentPrice) {
        showStockAlert(`No data for ${ticker}`);
        return;
    }

    // Check if card exists
    let card = document.getElementById(`card-${ticker}`);
    if (!card) {
        card = document.createElement("div");
        card.classList.add("stock-card");
        card.id = `card-${ticker}`;
        stockDataContainer.appendChild(card);
    }

    card.innerHTML = `
        <h2>${ticker}</h2>
        <p>Live Price: ₹${currentPrice}</p>
        <a href="https://www.google.com/search?q=${encodeURIComponent(ticker + ' stock report')}" target="_blank">
            View Latest Report
        </a>
    `;
}

// Alert if price changes by more than 2%
async function checkStockAlert(ticker) {
    const currentPrice = await fetchStockPrice(ticker);
    if (!currentPrice) return;

    if (lastPrices[ticker]) {
        const oldPrice = lastPrices[ticker];
        const changePercent = ((currentPrice - oldPrice) / oldPrice) * 100;

        if (Math.abs(changePercent) >= 2) {
            const direction = changePercent > 0 ? 'up' : 'down';
            showStockAlert(`
                <strong>${ticker}</strong> is ${direction} by 
                <strong>${changePercent.toFixed(2)}%</strong><br>
                Latest Price: <strong>₹${currentPrice.toFixed(2)}</strong>
            `);
        }
    }

    lastPrices[ticker] = currentPrice;
    displayStockData(ticker);
}

// Start monitoring a stock
function startStockMonitoring(ticker) {
    if (monitoringTickers[ticker]) return;

    checkStockAlert(ticker);
    monitoringTickers[ticker] = setInterval(() => {
        checkStockAlert(ticker);
    }, 30000); // every 30s
}

// On search button click
searchBtn.addEventListener('click', () => {
    const ticker = tickerInput.value.trim().toUpperCase();
    if (ticker) {
        showStockAlert(`Monitoring ${ticker}...`);
        displayStockData(ticker);
        startStockMonitoring(ticker);
    }
});

// On capsule click
function openCompany(ticker) {
    showStockAlert(`Monitoring ${ticker}...`);
    displayStockData(ticker);
    startStockMonitoring(ticker);
}

window.openCompany = openCompany; // so HTML onclick works