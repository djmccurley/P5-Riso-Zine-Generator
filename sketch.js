let searchInput;
let articles = [];
let articleImages = [];
let searchButton;
let layoutButton;
let font1;
let font2;
let light;
let dark;
let params;

// let testSpread

function preload() {
  font1 = loadFont('/assets/pirata.ttf');
  font2 = loadFont('/assets/inconsolata-bold.ttf');
}

function setup() {
    createCanvas(5100, 3300);
    //canvas: 5100x3300
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
    
    // create layout button
    layoutButton = createButton('Change Layout');
    layoutButton.position(width/2 + 320, height + 20);
    layoutButton.size(100, 40);
    layoutButton.mousePressed(setLayout);

    // Initial search
    searchWikipedia();

    //riso channels
    light = new Riso("FLUORESCENTPINK");
	  light.fill(200);

	  dark = new Riso("BLACK");
	  dark.fill(200);
  
    //setup
    dark.angleMode(DEGREES);
    light.angleMode(DEGREES);
    dark.cutout(light);

    //sets initial layout
    setLayout();

    // testSpread = new Spread(75, 75, false, light, dark);
}



function getRandom(min, max){
    let random = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(random);
    return random;
}

function setLayout(){
    //PAGE LAYOUT DIMENSIONS
    //each pane: 1200 x 1500
    //page 1: x 3825 - 5025, y 1725, 3225
    //page 8: x 2625 - 3825, y 1725, 3225
    //page 2-3 (rotate updside down): x 2625 - 5025, y 75, 1575
    //page 4-5 (rotate updside down): x 75 - 2425, y 75, 1575
    //pages 6-7: x 75 - 2475, y 1725, 3225
    
    //item: [x(min, max), y(min, max), widthInPx(min, max), heightInPx(min, max)]
    params = {};
    params = {
        "page1": {
            title: [3900, getRandom(1875, 2700), 1200, 1200],
            subtitle: [4950, getRandom(1800, 3100)],
            issue: ["Issue #" + getRandom(1,100), getRandom(3900, 4950), getRandom(1800, 3100)],
            image1: [3975, 1725, 1050, 1400],
            image2: [getRandom(3825, 4825), getRandom(1725, 2825), getRandom(300, 400), getRandom(400, 500)]
        },
        "page8": {
            "contents": {
                x: getRandom(2625, 3225),
                y: getRandom(1725, 2825)
            },
            "about": {
                x: getRandom(2625, 3225),
                y: getRandom(1725, 2825)
            }
        }
    };
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

    // testSpread.draw()

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

    dark.push();
        dark.rotate(180);    
        dark.translate(-2475, -1575);
        
        dark.rect(0, 0, 120, 90);
    dark.pop();

    // Only draw if 4 articles with images and snippets are loaded
    if (articles.length === 4 && articleImages.length === 4 && articleImages.every(img => img !== null)) {
        // PAGE 1
        // TITLE
        dark.textAlign(LEFT, TOP);
        dark.textFont(font1);
        dark.textSize(204);
        dark.textLeading(192);
        dark.text(articles[0].title, ...params["page1"]["title"]);

        //subtitle and issue #
        dark.textAlign(RIGHT, TOP);
        dark.textSize(40);
        dark.textFont(font2);
        dark.textLeading(40);
        dark.text("A procedurally generated wikizine", ...params["page1"]["subtitle"]);
        dark.textAlign(LEFT, TOP);
        dark.text(...params["page1"]["issue"]);
        
        //images
        p1MainImage = ditherImage(articleImages[0], 'none', 100);
        p1SmallImage = ditherImage(articleImages[1], 'none', 90);
        light.image(p1MainImage, ...params["page1"]["image1"]);
        dark.image(p1SmallImage, ...params["page1"]["image2"]);
        
        //PAGE 8
        dark.textAlign(LEFT, TOP);
        dark.textSize(40);
        dark.textFont(font2);
        dark.textLeading(40);
        contentsX = params["page8"]["contents"]["x"];
        contentsY = params["page8"]["contents"]["y"];
        dark.text("In this issue:", contentsX, contentsY-40);
        for (i=0; i < articles.length; i+=1){
            dark.text(articles[i].title, contentsX, contentsY + (40 * i));
        }
        aboutX = params["page8"]["about"]["x"];
        aboutY = params["page8"]["about"]["y"];
        dark.text("This wikizine was procedurally generated using p5.js, p5.riso and the Wikipedia API.", aboutX, aboutY, 500);
        

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

// class Spread {
//     constructor(translateX, translateY, flip=false, light, dark, page) {
//         this.x = translateX;
//         this.y = translateY;
//         this.flip = flip;
//         this.light = light;
//         this.dark = dark;
//     }

//     draw() {
//         push();
//         translate(this.x, this.y)
//         angleMode(DEGREES);
//         if (this.flip) {
//             rotate(180);
//         }
//         rect(0,0, 120, 90);
//         pop();
//     }
// }