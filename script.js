const API_KEY = 'joqqkvvgfdt5ypehapjflyjdlkqjv7zyd0uviosy'; // Get your own key from rss2json.com
const feeds = {
    india: 'https://www.thehindu.com/news/national/feeder/default.rss',
    world: 'https://feeds.bbci.co.uk/news/world/rss.xml' // Updated BBC feed URL
};

let currentPage = 1;
const itemsPerPage = 10;
let allArticles = [];

// Initialize with error handling
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadNews();
        setupFilters();
    } catch (error) {
        showErrorToUser();
        console.error('Initialization failed:', error);
    }
});

// Modified loadNews with better error handling
async function loadNews() {
    try {
        document.getElementById('newsContainer').innerHTML = '<div class="loading">Loading news...</div>';
        
        const [indiaRes, worldRes] = await Promise.all([
            fetchNews(feeds.india, 'The Hindu'),
            fetchNews(feeds.world, 'BBC News')
        ]);
        
        allArticles = [...indiaRes, ...worldRes];
        
        if (allArticles.length === 0) {
            showNoArticlesMessage();
            return;
        }
        
        showNews(currentPage);
        createPagination(allArticles.length);
    } catch (error) {
        showErrorToUser();
        console.error('News loading failed:', error);
    }
}

// Updated fetchNews with CORS proxy
async function fetchNews(url, source) {
    try {
        // Using CORS proxy for development
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&api_key=${API_KEY}`;
        
        const response = await fetch(proxyUrl + apiUrl);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        if (data.status !== 'ok') throw new Error('RSS feed error: ' + data.message);
        
        return data.items.map(item => ({
            title: item.title || 'No title',
            description: item.description || 'No description available',
            link: item.link || '#',
            source: source,
            type: url.includes('india') ? 'india' : 'world',
            image: item.enclosure?.link || item.media?.content?.url || ''
        }));
        
    } catch (error) {
        console.error('Error fetching', source, error);
        return [];
    }
}

// Add these new functions
function showNoArticlesMessage() {
    const container = document.getElementById('newsContainer');
    container.innerHTML = `
        <div class="error-message">
            <h3>📰 No articles found!</h3>
            <p>Try these troubleshooting steps:</p>
            <ol>
                <li>Check your internet connection</li>
                <li>Verify the RSS feed URLs</li>
                <li>Ensure you have a valid API key</li>
            </ol>
        </div>
    `;
}

function showErrorToUser() {
    const container = document.getElementById('newsContainer');
    container.innerHTML = `
        <div class="error-message">
            <h3>⚠️ Technical Difficulty</h3>
            <p>We're experiencing issues loading news. Please try again later.</p>
        </div>
    `;
}

// Keep rest of the code from previous version (image handling, pagination, filters)
// [Paste all previous functions here without changes]
