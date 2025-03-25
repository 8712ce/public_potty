console.log("Game script loaded!");

// GLOBAL VARIABLES //
let app;

let currentBuildings = []; // HOLDS "BUILDING" GRAPHICS //
let worldX = 0; // HOW FAR WE'VE SCROLLED (IF WE WANT TO SHIFT BACKGROUND) //
const chunkWidth = 800; // SAME AS CANVAS WIDTH //

let currentChunkIndex = 0;
let locationInChunk = 0; // WHICH OF THE 5 LOCATIONS IN THAT CHUNK //
let locationWidth = 160; // CHUNKWIDTH / 5 //

let loadedChunks = {}; // MAPS CHUNK INDEX -> BOOLEAN OR DATA //





// A FUNCTION TO RE-DRAW EACH BUILDING BASED ON WORLDX //
function updateScene() {
    currentBuildings.forEach(b => {
        b.x = b.worldX - worldX;
    });
}





// FUNCTIONS TO MOVE ONE CARD AT A TIME //
function moveRightOneCard() {
    worldX += buildingSpacing;
    updateScene();
}

function moveLeftOneCard() {
    worldX -= buildingSpacing;
    updateScene();
}





// FETCH CHUNK DATA FROM /GET_CHUNK/?INDEX=CURRENTCHUNKINDEX //
function loadChunk(index) {
    fetch(`/get_chunk/?index=${index}`)
        .then(response => response.json())
        .then(data => {
            console.log("Chunk data for index", index, data);
            // FOR NOW, JUST DISPLAY THEM IN THE .LOCATIONS-CONTAINER OR EVENTUALLY, INTEGRATE THEM INTO PIXI SCENE //

            // const container = document.querySelector('.locations-container');
            // container.innerHTML = ''; // CLEAR EXISTING //

            // data.forEach(location => {
            //     const div = document.createElement('div');
            //     div.classList.add('location-card');
            //     div.innerHTML = `
            //         <h2>${location.type_display}${location.subtype_display ? " ("+ location.subtype_display +")" : ""}</h2>
            //         ${location.name ? `<p>"${location.name}"</p>` : ""}
            //         <p>Has restroom? ${location.has_restroom ? "Yes" : "No"}</p>
            //         <p>Public? ${location.open_to_public ? "Yes" : "No"}</p>
            //     `;
            //     container.appendChild(div);
            // });


            // REMOVE OLD BUILDINGS IF WE ONLY WANT THIS CHUNK ON SCREEN //
            currentBuildings.forEach(b => app.stage.removeChild(b));
            currentBuildings = [];

            data.forEach((locData, i) => {
                // 1. CREATE A NEW GRAPHICS OBJECT //
                let building = new PIXI.Graphics();
                building.beginFill(0x00ff00); // GREEN PLACEHOLDER
                building.drawRect(0, 0, 50, 100); // 50 WIDE, 100 TALL
                building.endFill();

                // 2. DETERMINE HORIZONTAL POSITION WITHIN THE CHUNK. CHUNKWIDTH=800, SO EACH CHUNK HOLDS 5 BUILDINGS => SPACING=160 EACH
                let buildingSpacing = chunkWidth / 5;
                // E.G. I=0..4 => POSITIONS: 80, 240, 400, 720 //
                let xWithinChunk = i * buildingSpacing + (buildingSpacing / 2);

                // 3. BUILDING.WORLDX = CHUNKINDEX * CHUNKWIDTH + XWITHINCHUNK. THIS IS THE "ABOSOLUTE" X-POSITION IN THE GAME WORLD //
                building.worldX = (index * chunkWidth) + xWithinChunk;

                // 4. BASIC "GROUND" POSITION SO BUILDING STANDS ON "Y=250" //
                building.y = 250;

                // 5. OPTIONALLY, STORE METADATA ABOUT THE LOCATION //
                building.locationData = locData;

                // 6. IF WE WANT TO POSITION IT IMMEDIATELY ON THE SCREEN, SUBTRACT WORLDX.  IF WE'RE GOING TO  CALL UPDATESCENE() LATER, WE CAN SKIP THIS.
                building.x = building.worldX - worldX;

                // 7. ADD BUILDING OT THE PIXI STAGE //
                app.stage.addChild(building);

                // 8. KEEP TRACK OF IT IF WE WANT TO MOVE OR REMOVE IT LATER //
                currentBuildings.push(building);
            });
        })
        .catch(err => console.error("Error loading chunk:", err));
}





// CONFIRM PIXI.JS IS AVAILABLE //
if (typeof PIXI === "undefined") {
    console.error("Pixi.js failed to load!");
} else {
    console.log("Pixi.js loaded successfully.");
}





document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed.");

    try {
        // Initialize Pixi Application
        // let app = new PIXI.Application({
        //     width: 800,
        //     height: 400,
        //     backgroundColor: 0x1099bb
        // });
        app = new PIXI.Application({
            width: 800,
            height: 400,
            backgroundColor: 0x1099bb
        });

        let canvasContainer = document.getElementById("gameCanvas");

        // CHECK IF gameCanvas EXISTS //
        if (!canvasContainer) {
            console.error("Error: #gameCanvas not found!");
            return;
        }

        // Append Pixi's auto-generated <canvas> to the div
        canvasContainer.appendChild(app.view);

        // Create player (red square)
        let player = new PIXI.Graphics();
        player.beginFill(0xff0000);
        player.drawRect(0, 0, 50, 50);
        player.endFill();
        player.x = 400;
        player.y = 300;
        app.stage.addChild(player);

        // INITIALIZE CHUNK 0 SO WE HAVE DATA IN PIXI FROM THE START //
        loadChunk(0);

    } catch (error) {
        console.error("Error initializing Pixi.js:", error);
    }





    

    // SIMPLE LEFT/RIGHT BUTTONS FOR TESTING CHUNK CHANGES //
    const leftButton = document.createElement('button');
    leftButton.innerText = "Move Left";
    document.body.appendChild(leftButton);

    const rightButton = document.createElement('button');
    rightButton.innerText = "Move Right";
    document.body.appendChild(rightButton);

    // leftButton.addEventListener('click', () => {
    //     currentChunkIndex--;
    //     loadChunk(currentChunkIndex);
    // });
    leftButton.addEventListener('click', () => {
        locationInChunk--;
        if (locationInChunk < 0) {
            currentChunkIndex--;
            locationInChunk = 4; // THE LAST LOCATION IN A 5-LOCATION CHUNK //
            loadChunk(currentChunkIndex);
        }
        // CALCULATE THE NEW WORLD OFFSET //
        let newWorldX = (currentChunkIndex * chunkWidth) + (locationInChunk * locationWidth);
        worldX = newWorldX;
        
        // RE-POSITION ALL LOCATIONS BASED ON THE UPDATED WORLD X //
        updateScene();
    });
    // leftButton.addEventListener('click', moveLeftOneCard);

    // rightButton.addEventListener('click', () => {
    //     currentChunkIndex++;
    //     loadChunk(currentChunkIndex);
    // });
    rightButton.addEventListener('click', () => {
        locationInChunk++;
        if (locationInChunk >= 5) {
            currentChunkIndex++;
            locationInChunk = 0;
            // LOAD NEW CHUNK //
            loadChunk(currentChunkIndex);
        }
        let newWorldX = currentChunkIndex * chunkWidth + (locationInChunk * locationWidth);
        worldX = newWorldX;
        updateScene();
    });
    // rightButton.addEventListener('click', moveRightOneCard);


});
