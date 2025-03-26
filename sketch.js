let searchInput;
let articles = [];
let articleImages = [];
let searchButton;
let font1;
let font2;
let light;
let dark;
let params;

function preload() {
  font1 = loadFont('/assets/pirata.ttf');
  font2 = loadFont('/assets/inconsolata.ttf');
}

function setup() {
    createCanvas(5100, 3300);
    //each pane: 1200 x 1500
    //page 1: x 3825 - 5025, y 1725, 3225
    //page 8: x 2625 - 3825, y 1725, 3225
    //page 2-3 (rotate updside down): x 2625 - 5025, y 75, 1575
    //page 4-5 (rotate updside down): x 75 - 2425, y 75, 1575
    //pages 6-7: x 75 - 2475, y 1725, 3225



    
    // Create input field
    searchInput = createInput('Papa Shango');
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
	  light.fill(200);

	  dark = new Riso("BLACK");
	  dark.fill(180);
  
    //setup
    dark.angleMode(DEGREES);
    light.angleMode(DEGREES);
    dark.cutout(light);

    //PAGE LAYOUT DIMENSIONS
    //each pane: 1200 x 1500
    //page 1: x 3825 - 5025, y 1725, 3225
    //page 8: x 2625 - 3825, y 1725, 3225
    //page 2-3 (rotate updside down): x 2625 - 5025, y 75, 1575
    //page 4-5 (rotate updside down): x 75 - 2425, y 75, 1575
    //pages 6-7: x 75 - 2475, y 1725, 3225

    // MOVE THIS OUT OF SETUP AND PUT BEFORE EVERYTHING
    //  THEN CREATE A BUTTON that fires a FUNCTION TO UPDATE THE RAndom variables
    // ie. keep data refresh and layout refresh sepearatE!!!!
    console.log(params);
    params = {
        "page1": {
            //item: [x(min, max), y(min, max), widthInPx(min, max), heightInPx(min, max)]
            title: [getRandom(0, 4425), getRandom(0, 2700), getRandom(400, 800), getRandom(600, 1000)]
        }
    }
    console.log(params);
}



function getRandom(min, max){
    let random = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(random);
    return random;
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

function draw() {
    background("beige");
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
        light.textFont(font1);
        light.textSize(280);
        light.textLeading(230);
        light.text(articles[0].title, ...params["page1"]["title"]);
        light.textSize(78);
        light.textFont(font2);
        light.textLeading(76);
        light.text("A procedurally generated wikizine", width-800, height-1200, 800);
        light.text(articles[0].snippet, width-800, height-1200, 800);

        dithered = ditherImage(articleImages[0], 'none', 85);
        dark.image(dithered, 4000, 2000, 800, 1100);
        
        // function drawWithSpread() {
        //     const textParams = ["Hello", 10, 50];
        //     text(...textParams);
        //   }
        
        // function getrandom(min, max){
        //      return random int in range min-max
        //  }
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