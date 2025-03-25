let searchInput;
let articles = [];
let articleImages = [];
let searchButton;

function setup() {
    createCanvas(1200, 800);
    
    // Create input field
    searchInput = createInput('Science');
    searchInput.position(width/2 - 150, height + 20);
    searchInput.size(300);
    
    // Create search button
    searchButton = createButton('Search');
    searchButton.position(width/2 + 160, height + 20);
    searchButton.mousePressed(searchWikipedia);
    
    // Initial search
    searchWikipedia();
}

// Function to strip HTML tags
function stripHtmlTags(text) {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, '').trim();
}

function searchWikipedia() {
    let searchTerm = searchInput.value() || 'Science';
    
    // Reset previous articles and images
    articles = [];
    articleImages = [];

    // Fetch Wikipedia search results
    let searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(searchTerm)}&srlimit=30`;
    
    fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
            let searchResults = data.query.search;
            
            // Fetch details for each article with a focus on finding those with images and snippets
            let promises = searchResults.map(result => {
                let pageId = result.pageid;
                let detailUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&pageids=${pageId}&prop=pageimages|extracts&pithumbsize=300&exintro=true&exsentences=2`;
                
                return fetch(detailUrl)
                    .then(response => response.json())
                    .then(details => {
                        let page = details.query.pages[pageId];
                        
                        // Require both thumbnail and non-empty snippet
                        let cleanedTitle = stripHtmlTags(page.title);
                        let cleanedSnippet = stripHtmlTags(page.extract);
                        
                        return page.thumbnail && cleanedSnippet.length > 50 ? {
                            title: cleanedTitle,
                            snippet: cleanedSnippet,
                            imageUrl: page.thumbnail.source
                        } : null;
                    });
            });

            // Process all article details, filtering out those without images and snippets
            Promise.all(promises)
                .then(processedArticles => {
                    // Filter out null results and take first 4
                    articles = processedArticles
                        .filter(article => article !== null)
                        .slice(0, 4);
                    
                    // Load images for filtered articles
                    articleImages = articles.map(article => {
                        return loadImage(article.imageUrl, 
                            () => {}, 
                            () => null  // Return null if image fails to load
                        );
                    });
                });
        })
        .catch(error => {
            console.error('Error fetching Wikipedia data:', error);
        });
}

function draw() {
    background(240);
    
    // Only draw if 4 articles with images and snippets are loaded
    if (articles.length === 4) {
        for (let i = 0; i < 4; i++) {
            let x = (i % 2) * (width / 2) + 20;
            let y = Math.floor(i / 2) * (height / 2) + 20;
            
            // Draw article container
            fill(255);
            stroke(200);
            rect(x, y, width/2 - 40, height/2 - 40);
            
            // Draw title
            noStroke();
            fill(0);
            textSize(16);
            textStyle(BOLD);
            text(articles[i].title, x + 10, y + 30, width/2 - 60);
            
            // Draw snippet
            textSize(12);
            textStyle(NORMAL);
            text(articles[i].snippet, x + 10, y + 60, width/2 - 60, 100);
            
            // Draw image (now guaranteed to exist)
            let imgWidth = 150;
            let imgHeight = (imgWidth / articleImages[i].width) * articleImages[i].height;
            image(articleImages[i], x + width/4 - 75, y + height/4, imgWidth, imgHeight);
        }
    }
    // If fewer than 4 articles with images and snippets are found
    else if (articles.length > 0 && articles.length < 4) {
        textSize(16);
        fill(0);
        textAlign(CENTER, CENTER);
        text(`Found only ${articles.length} articles with images and snippets`, width/2, height/2);
    }
}