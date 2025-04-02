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

// let testSpread;

function preload() {
  font1 = loadFont('/assets/pirata.ttf');
  font2 = loadFont('/assets/inconsolata-bold.ttf');
}

function setup() {
    createCanvas(5100, 3300);
    pixelDensity(1);
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

    // create export button
    exportButton = createButton('Export Layers');
    exportButton.position(width/2 + 480, height + 20);
    exportButton.size(100, 40);
    exportButton.mousePressed(exportRiso);

    // Initial search
    searchWikipedia();

    //riso channels
    light = new Riso("FLUORESCENTPINK");
	  light.fill(200);

	  dark = new Riso("BLACK`");
	  dark.fill(200);
  
    //setup
    dark.angleMode(DEGREES);
    light.angleMode(DEGREES);
    dark.cutout(light);

    //sets initial layout
    setLayout();

    // testSpread = new Spread(75, 75, false);
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
        issueNumber: getRandom(1, 100), 
        "page1": {
            translate: [3825, 1725],
            title: [75, getRandom(150, 1000), 1200, 1200],
            subtitle: [1125, getRandom(75, 1375)],
            issue: [getRandom(75, 1125), getRandom(75, 1375)],
            image1: [150, 0, 1050, 1400],
            image2: [getRandom(0, 800), getRandom(0, 1000), getRandom(300, 400), getRandom(400, 500)]
        },
        "page8": {
            translate: [2625, 1725],
            "contents": {
                x: getRandom(0, 600),
                y: getRandom(0, 1100)
            },
            "about": {
                x: getRandom(0, 200),
                y: getRandom(0, 1100)
            },
            image: [getRandom(0, 600), getRandom(0, 700), 600, 800],
            imageSrc: getRandom(0,3)
        },
        "page2": {
            translate: [5025, 1575],
            text: [getRandom(0, 275), getRandom(200,1000), 900],
            image: [getRandom(0, 600), getRandom(0, 700), 600, 800]
        },
        "page3": {
            translate: [3825, 1575],
            text: [getRandom(0, 275), getRandom(200,1000), 900],
            image: [getRandom(0, 600), getRandom(0, 700), 600, 800]
        },
        "page5": {
            translate: [75, 1575],
            title: [75, 2262], //left bottom
            issue: [1425, 2262], //right bottom
            image: [75, 75, 1350, 2100],
            imageSrc: getRandom(1,3)
        },
        "page6": {
            translate: [75, 1725],
            text: [getRandom(0, 275), getRandom(200,1000), 900],
            image: [getRandom(0, 600), getRandom(0, 700), 600, 800]
        },
        "page7": {
            translate: [1275, 1725],
            text: [getRandom(0, 275), getRandom(200,1000), 900],
            image: [getRandom(0, 600), getRandom(0, 700), 600, 800]
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

    // testSpread.draw()

    // Only draw if 4 articles with images and snippets are loaded
    if (articles.length === 4 && articleImages.length === 4 && articleImages.every(img => img !== null)) {
        // PAGE 1

        dark.push();
        light.push();
            dark.translate(...params["page1"]["translate"]);
            light.translate(...params["page1"]["translate"]);
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
            dark.text("Issue #" + params["issueNumber"], ...params["page1"]["issue"]);
            
            //images
            p1MainImage = ditherImage(articleImages[0], 'none', 100);
            p1SmallImage = ditherImage(articleImages[1], 'none', 90);
            light.image(p1MainImage, ...params["page1"]["image1"]);
            dark.image(p1SmallImage, ...params["page1"]["image2"]);
        
        light.pop();
        dark.pop();

        //PAGE 2 SPREAD
        dark.push();
        light.push();
            // TITLE
            dark.translate(...params["page2"]["translate"]);
            light.translate(...params["page2"]["translate"]);
            dark.rotate(180);
            light.rotate(180);
            dark.textAlign(LEFT, BOTTOM);
            dark.textFont(font1);
            dark.textSize(84);
            dark.textLeading(72);
            dark.text(articles[0].title, ...params["page2"]["text"]);
            
            //snippet
            dark.textAlign(LEFT, TOP);
            dark.textFont(font2);
            dark.textSize(40);
            dark.textLeading(40);
            dark.text(articles[0].snippet, ...params["page2"]["text"]);        

            //image
            spreadImage6 = ditherImage(articleImages[0], 'none', 100);
            light.image(spreadImage6, ...params["page2"]["image"]);
        light.pop();
        dark.pop();

        //PAGE 2 SPREAD
        dark.push();
        light.push();
            // TITLE
            dark.translate(...params["page3"]["translate"]);
            light.translate(...params["page3"]["translate"]);
            dark.rotate(180);
            light.rotate(180);
            dark.textAlign(LEFT, BOTTOM);
            dark.textFont(font1);
            dark.textSize(84);
            dark.textLeading(72);
            dark.text(articles[1].title, ...params["page3"]["text"]);
            
            //snippet
            dark.textAlign(LEFT, TOP);
            dark.textFont(font2);
            dark.textSize(40);
            dark.textLeading(40);
            dark.text(articles[1].snippet, ...params["page3"]["text"]);        

            //image
            spreadImage6 = ditherImage(articleImages[1], 'none', 100);
            light.image(spreadImage6, ...params["page3"]["image"]);
        light.pop();
        dark.pop();

        //PAGE 5 CENTERFOLD
        dark.push();
        light.push();


            dark.translate(...params["page5"]["translate"]);
            light.translate(...params["page5"]["translate"]);
            dark.rotate(-90);
            light.rotate(-90);

            // background
            //light.rect(0,0, 1500, 2400);

            // TITLE
            dark.textAlign(LEFT, BOTTOM);
            dark.textFont(font1);
            dark.textSize(60);
            dark.textLeading(60);
            dark.text(articles[0].title, ...params["page5"]["title"]);
            dark.textAlign(RIGHT, BOTTOM);
            dark.text("Issue #" + params["issueNumber"], ...params["page5"]["issue"]);

            //image
            p5Image = ditherImage(articleImages[0], 'none', 80);
            p5Image2 = ditherImage(articleImages[params["page5"]["imageSrc"]], 'none', 80);
            light.image(p5Image, ...params["page5"]["image"]);
            dark.image(p5Image2, ...params["page5"]["image"]);

        light.pop();
        dark.pop();

        //PAGE 6 SPREAD
        dark.push();
        light.push();
            // TITLE
            dark.translate(...params["page6"]["translate"]);
            light.translate(...params["page6"]["translate"]);
            dark.textAlign(LEFT, BOTTOM);
            dark.textFont(font1);
            dark.textSize(84);
            dark.textLeading(72);
            dark.text(articles[2].title, ...params["page6"]["text"]);
            
            //snippet
            dark.textAlign(LEFT, TOP);
            dark.textFont(font2);
            dark.textSize(40);
            dark.textLeading(40);
            dark.text(articles[2].snippet, ...params["page6"]["text"]);        

            //image
            spreadImage6 = ditherImage(articleImages[2], 'none', 100);
            light.image(spreadImage6, ...params["page6"]["image"]);
        light.pop();
        dark.pop();

        //PAGE 7 SPREAD
        dark.push();
        light.push();
            // TITLE
            dark.translate(...params["page7"]["translate"]);
            light.translate(...params["page7"]["translate"]);
            dark.textAlign(LEFT, BOTTOM);
            dark.textFont(font1);
            dark.textSize(84);
            dark.textLeading(72);
            dark.text(articles[3].title, ...params["page7"]["text"]);
            
            //snippet
            dark.textAlign(LEFT, TOP);
            dark.textFont(font2);
            dark.textSize(40);
            dark.textLeading(40);
            dark.text(articles[3].snippet, ...params["page7"]["text"]);        

            //image
            spreadImage6 = ditherImage(articleImages[3], 'none', 100);
            light.image(spreadImage6, ...params["page7"]["image"]);
        light.pop();
        dark.pop();

        //PAGE 8
        dark.push();
        light.push();
            dark.translate(...params["page8"]["translate"]);
            light.translate(...params["page8"]["translate"]);
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
            
            dark.text("Note from the editor:", aboutX, aboutY, 500);
            dark.text("This magazine was procedurally generated using p5.js, p5.riso.js, and the Wikipedia API. All opinions expressed within are solely those of the algorithm. Previous issues are not available on demand but you might get lucky.", aboutX, aboutY+40, 1000);

            p8Image = ditherImage(articleImages[params["page8"]["imageSrc"]], 'none', 100);
            light.image(p8Image, ...params["page8"]["image"]);
        light.pop();
        dark.pop();


        // REGSITRATION
        dark.push();
        light.push();
            dark.noFill();
            light.noFill();
            dark.strokeWeight(2);
            light.strokeWeight(2);
            dark.circle(2550, 1650, 50);
            light.circle(2550, 1650, 50);
            dark.line(2510,1650, 2590, 1650);
            dark.line(2550,1610, 2550, 1690);
            light.line(2510,1650, 2590, 1650);
            light.line(2550,1610, 2550, 1690);

        light.pop();
        dark.pop();
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
//     constructor(translateX, translateY, flip=false) {
//         this.x = translateX;
//         this.y = translateY;
//         this.flip = flip;
//     }

//     draw() {
//         push();
//             translate(this.x, this.y)
//             if (this.flip) {
//                 rotate(180);
//             }
//             fill(10);

//         pop();
//     }
// }