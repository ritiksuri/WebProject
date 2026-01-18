const API_KEY = "CYHSGLQL6KRGL5WH";

const stockAlert = document.getElementById('stock-alert');
const alertText = document.getElementById('alert-text');
const closeAlertBtn = document.getElementById('close-alert');
const tickerInput = document.getElementById('ticker-input');
const searchBtn = document.getElementById('search-btn');

let lastPrices = {};
let monitoringTickers = {}; 
function showStockAlert(message) {
    alertText.textContent = message;
    stockAlert.classList.remove('hidden');
    setTimeout(() => stockAlert.classList.add('hidden'), 5000);
}


closeAlertBtn.addEventListener('click', () => {
    stockAlert.classList.add('hidden');
});


async function fetchStockPrice(ticker) {
    try {
        const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${API_KEY}`;
        const response = await fetch(quoteUrl);
        if (!response.ok) throw new Error('Failed to fetch stock price');
        const data = await response.json();
        return data.c;
    } catch (err) {
        console.error(err);
        return null;
    }
}


async function checkStockAlert(ticker) {
    const currentPrice = await fetchStockPrice(ticker);
    if (!currentPrice) return;

    if (lastPrices[ticker]) {
        const oldPrice = lastPrices[ticker];
        const changePercent = ((currentPrice - oldPrice) / oldPrice) * 100;

        if (Math.abs(changePercent) >= 2) {
            const direction = changePercent > 0 ? 'up' : 'down';
            showStockAlert(`${ticker} is ${direction} by ${changePercent.toFixed(2)}%: $${currentPrice.toFixed(2)}`);
        }
    }

    lastPrices[ticker] = currentPrice;
}


function startStockMonitoring(ticker) {
    if (monitoringTickers[ticker]) return;

    checkStockAlert(ticker);
    monitoringTickers[ticker] = setInterval(() => {
        checkStockAlert(ticker);
    }, 30000);
}


searchBtn.addEventListener('click', () => {
    const ticker = tickerInput.value.trim().toUpperCase();
    if (ticker) {
        showStockAlert(`Monitoring ${ticker} for significant changes...`);
        startStockMonitoring(ticker);
    }
});

document.querySelectorAll('.capsules span').forEach(span => {
    span.addEventListener('click', () => {
        const ticker = span.textContent.trim().toUpperCase();
        showStockAlert(`Monitoring ${ticker} for significant changes...`);
        startStockMonitoring(ticker);
    
    });
});
