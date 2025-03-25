let searchInput;
let articles = [];
let articleImages = [];
let searchButton;
let font1;
let font2;

function preload() {
  font1 = loadFont('/assets/pirata.ttf');
  font2 = loadFont('/assets/inconsolata.ttf');
}

function setup() {
    createCanvas(5100, 3300
    );
    
    // Create input field
    searchInput = createInput('Science');
    searchInput.position(width/2 - 150, height + 20);
    searchInput.size(200, 40);
    
    // Create search button
    searchButton = createButton('Search');
    searchButton.position(width/2 + 160, height + 20);
    searchButton.size(100, 40);
    searchButton.mousePressed(searchWikipedia);
    
    // Initial search
    searchWikipedia();

    //riso channels
    light = new Riso("FLUORESCENTPINK");
	  light.fill(100);

	  dark = new Riso("BLUE");
	  dark.fill(256);
  
    //setup
    dark.angleMode(DEGREES);
    light.angleMode(DEGREES);
}

// Function to strip HTML tags
function stripHtmlTags(text) {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, '').trim();
}


function searchWikipedia() {
  let searchTerm = searchInput.value() || 'Macho Man';
  
  // Reset previous articles and images completely
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
                  
                  // Reset articleImages array
                  articleImages = [];
                  
                  // Load images for filtered articles
                  articles.forEach(article => {
                      loadImage(article.imageUrl, 
                          (img) => {
                              articleImages.push(img);
                          }, 
                          (err) => {
                              console.error('Error loading image:', err);
                              articleImages.push(null);
                          }
                      );
                  });
              });
      })
      .catch(error => {
          console.error('Error fetching Wikipedia data:', error);
      });
}
// function searchWikipedia() {
//     let searchTerm = searchInput.value() || 'Macho Man';
    
//     // Reset previous articles and images
//     articles = [];
//     articleImages = [];

//     // Fetch Wikipedia search results
//     let searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(searchTerm)}&srlimit=30`;
    
//     fetch(searchUrl)
//         .then(response => response.json())
//         .then(data => {
//             let searchResults = data.query.search;
            
//             // Fetch details for each article with a focus on finding those with images and snippets
//             let promises = searchResults.map(result => {
//                 let pageId = result.pageid;
//                 let detailUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&pageids=${pageId}&prop=pageimages|extracts&pithumbsize=300&exintro=true&exsentences=2`;
                
//                 return fetch(detailUrl)
//                     .then(response => response.json())
//                     .then(details => {
//                         let page = details.query.pages[pageId];
                        
//                         // Require both thumbnail and non-empty snippet
//                         let cleanedTitle = stripHtmlTags(page.title);
//                         let cleanedSnippet = stripHtmlTags(page.extract);
                        
//                         return page.thumbnail && cleanedSnippet.length > 50 ? {
//                             title: cleanedTitle,
//                             snippet: cleanedSnippet,
//                             imageUrl: page.thumbnail.source
//                         } : null;
//                     });
//             });

//             // Process all article details, filtering out those without images and snippets
//             Promise.all(promises)
//                 .then(processedArticles => {
//                     // Filter out null results and take first 4
//                     articles = processedArticles
//                         .filter(article => article !== null)
//                         .slice(0, 4);
                    
//                     // Load images for filtered articles
//                     articleImages = articles.map(article => {
//                         return loadImage(article.imageUrl, 
//                             () => {}, 
//                             () => null  // Return null if image fails to load
//                         );
//                     });
//                 });
//         })
//         .catch(error => {
//             console.error('Error fetching Wikipedia data:', error);
//         });
// }

function draw() {
    background('beige');
    clearRiso();

    //guides
    push();
      stroke("lightblue");
      strokeWeight(6);
      noFill();
      line(width/2, 0, width/2, height);
      line(0, height/2, width, height/2);
      rect(75, 75, width-150, height-150);
      rect(75, (height/2)-75, width-150, 150);
      rect((width/2)-75, 75, 150, height-150);
      line(width*.25, 0, width*.25, height);
      line(width*.75, 0, width*.75, height);
    pop();  


    // Only draw if 4 articles with images and snippets are loaded
    if (articles.length === 4 && articleImages.length === 4 && articleImages.every(img => img !== null)) {
        dark.textFont(font1);
        dark.textSize(280);
        dark.textLeading(230);
        dark.text(articles[0].title, width-1200, height-480, 300);
        dark.textSize(78);
        dark.textFont(font2);
        dark.textLeading(76);
        dark.text(articles[0].snippet, width-800, height-1200, 800);
        
        dithered = ditherImage(articleImages[0], 'none', 80);
        light.image(dithered, width-1200, height-1500, 1500, 2000);
        dark.image(dithered, width-1280, height-1590, 1200, 2200);
        
        
        
        drawRiso();
    }
    // If fewer than 4 articles with images and snippets are found
    else if (articles.length > 0 && articles.length < 4) {
        textSize(16);
        fill(0);
        textAlign(CENTER, CENTER);
        text(`Found only ${articles.length} articles with images and snippets`, width/2, height/2);
    }

}