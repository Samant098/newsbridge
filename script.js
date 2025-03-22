const API_KEY = 'joqqkvvgfdt5ypehapjflyjdlkqjv7zyd0uviosy';
const feeds = {
    india: 'https://www.thehindu.com/news/national/feeder/default.rss',
    world: 'http://feeds.bbci.co.uk/news/world/rss.xml'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadNews();
    setupFilters();
});

// News Loading
async function loadNews() {
    try {
        const [indiaRes, worldRes] = await Promise.all([
            fetchNews(feeds.india, 'india'),
            fetchNews(feeds.world, 'world')
        ]);
        
        showNews([...indiaRes, ...worldRes]);
    } catch (error) {
        console.error('News loading failed:', error);
    }
}

async function fetchNews(url, type) {
    try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${url}&api_key=${API_KEY}`);
        const data = await response.json();
        return (data.items || []).map(item => ({
            ...item,
            type,
            image: getImageUrl(item),
            source: item.author || item.feed
        }));
    } catch (error) {
        console.error('Feed error:', url, error);
        return [];
    }
}

// In script.js - Modify the getImageUrl and getFallbackImage functions

// Replace existing image handling functions with this:
function getImageUrl(article) {
    // Detect Getty Images URLs
    if (article.image && article.image.includes('gettyimages')) {
        return getFallbackImage(article);
    }
    return article.image ? 
        `https://images.weserv.nl/?url=${encodeURIComponent(article.image)}` : 
        getFallbackImage(article);
}

function getFallbackImage(article) {
    // Use Google Custom Search API for relevant images (free tier available)
    const keywords = encodeURIComponent(`${article.title} ${article.type} news`);
    return `https://source.unsplash.com/600x400/?${keywords}`;
    
    // Alternative: Use Wikimedia Commons
    // return `https://commons.wikimedia.org/w/api.php?action=query&titles=${keywords}&prop=imageinfo&iiprop=url&format=json`;
}

// In the showNews function's image HTML - Add error handling:
<img class="news-image" 
     src="${getImageUrl(article)}" 
     alt="${article.title}"
     loading="lazy"
     onerror="this.onerror=null;this.src='${getFallbackImage(article)}'">
}

// Display News
function showNews(articles) {
    const container = document.getElementById('newsContainer');
    container.innerHTML = articles.map(article => `
        <article class="news-article" data-type="${article.type}">
            <div class="article-image">
                <img class="news-image" 
                     src="${getProxiedImage(article.image, article.type)}" 
                     alt="${article.title}"
                     loading="lazy"
                     onerror="this.src='${getFallbackImage(article.type)}'">
            </div>
            <div class="article-content">
                <div class="article-source">${article.source}</div>
                <h2 class="article-title">${article.title}</h2>
                <p class="article-excerpt">${cleanText(article.description)}</p>
                <a href="${article.link}" class="read-more" target="_blank">
                    Full Story <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        </article>
    `).join('');
}

function getProxiedImage(url, type) {
    return url ? `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=800&h=600&fit=cover` 
              : getFallbackImage(type);
}

function getFallbackImage(type) {
    return type === 'india' 
        ? 'https://source.unsplash.com/800x600/?india' 
        : 'https://source.unsplash.com/800x600/?world';
}

function cleanText(text) {
    return text.replace(/<[^>]+>/g, '').substring(0, 200).trim() + '...';
}

// Filter System
function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => 
                b.classList.remove('active')
            );
            btn.classList.add('active');
            filterNews(btn.dataset.filter);
        });
    });
}

function filterNews(type) {
    document.querySelectorAll('.news-article').forEach(article => {
        const show = type === 'all' || article.dataset.type === type;
        article.style.display = show ? 'grid' : 'none';
    });
}
