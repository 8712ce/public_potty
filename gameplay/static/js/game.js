console.log("Game script loaded!");

// GLOBAL VARIABLES //
let app;

let currentBuildings = []; // HOLDS "BUILDING" GRAPHICS //
let worldX = 0; // HOW FAR WE'VE SCROLLED (IF WE WANT TO SHIFT BACKGROUND) //
const chunkWidth = 800; // SAME AS CANVAS WIDTH //
let loadedChunks = {}; // MAPS CHUNK INDEX -> BOOLEAN OR DATA //
let currentChunkIndex = 0;
let locationInChunk = 0; // WHICH OF THE 5 LOCATIONS IN THAT CHUNK //
let locationWidth = 160; // CHUNKWIDTH / 5 //
let addedCharacters = [];
let addedCharacterNames = new Set();
let zIndexCounter = 9;
// let nextOffset = 40; // STARTING DISTANCE FROM THE CENTER, TWEAK AS NEEDED //







// A FUNCTION TO RE-DRAW EACH BUILDING BASED ON WORLDX //
function updateScene() {
    currentBuildings.forEach(b => {
        if (b.worldX !== undefined) {
            b.x = b.worldX - worldX;
        }
    });
}





function animateWorldX(targetX, duration = 300) {
    let startX = worldX;
    let deltaX = targetX - startX;
    let startTime = performance.now();

    function animateFrame(now) {
        let elapsed = now - startTime;
        let progress = Math.min(elapsed / duration, 1);

        // OPTIONAL EASING FUNCTION (easeInOutQuad) //
        let eased = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;
        
        worldX = startX + deltaX * eased;
        updateScene();

        if (progress < 1) {
            requestAnimationFrame(animateFrame);
        } else {
            worldX = targetX;
            updateScene();
        }
    }

    requestAnimationFrame(animateFrame);
}





// FUNCTIONS TO MOVE ONE CARD AT A TIME //
function moveRightOneCard() {
    locationInChunk++;

    // PRE-FETCH NEXT CHUNK IF WERE NEAR THE 5TH BUILDING //
    if (locationInChunk >=1) {
        let nextChunk = currentChunkIndex + 1;
        // IF WE HAVEN'T LOADED IT YET, DO SO //
        if (!loadedChunks[nextChunk]) {
            loadChunk(nextChunk);
        }
    }

    // IF WE'VE FULLY PASSED TEH LAST BUILDING, STEP INTO THE NEXT CHUNK //
    if (locationInChunk >= 5) {
        currentChunkIndex++;
        locationInChunk = 0;
    }

    // UPDATE THE CAMERA OFFSET //
    // worldX = (currentChunkIndex * chunkWidth) + (locationInChunk * locationWidth);
    // updateScene();

    let targetX = (currentChunkIndex * chunkWidth) + (locationInChunk * locationWidth);
    animateWorldX(targetX);
}





function moveLeftOneCard() {
    locationInChunk--;

    // PRE-FETCH TEH PREVIOUS CHUNK IF WE'RE NEAR THE LOCATIONINCHUNK=1 OR 0 //
    if (locationInChunk <= 1) {
        let prevChunk = currentChunkIndex -1;
        if (!loadedChunks[prevChunk]) {
            loadChunk(prevChunk);
        }
    }

    // IF WE STEPPED PAST BUILDING 0 //
    if (locationInChunk < 0) {
        currentChunkIndex--;
        locationInChunk = 4;
    }

    // worldX = (currentChunkIndex * chunkWidth) + (locationInChunk * locationWidth);
    // updateScene();

    let targetX = (currentChunkIndex * chunkWidth) + (locationInChunk * locationWidth);
    animateWorldX(targetX);
}





// FETCH CHUNK DATA FROM /GET_CHUNK/?INDEX=CURRENTCHUNKINDEX //
function loadChunk(index) {
    // IF WE ALREADY LOADED THIS CHUNK, SKIP //
    if (loadedChunks[index]) return;

    // MARK THIS CHUNK AS LOADING/LOADED //
    // COULD ALSO DO A 'LOADING" STATE TO AVOID RACE CONDITIONS //
    loadedChunks[index] = true;

    // FETCH THE CHUNK DATA //
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
            // currentBuildings.forEach(b => app.stage.removeChild(b));
            // currentBuildings = [];

            data.forEach((locData, i) => {
                // 1. CREATE A NEW GRAPHICS OBJECT //
                let building = new PIXI.Graphics();
                building.beginFill(0x00ff00); // GREEN PLACEHOLDER
                building.drawRect(0, 0, 50, 100); // 50 WIDE, 100 TALL
                building.endFill();

                // 2. DETERMINE HORIZONTAL POSITION WITHIN THE CHUNK. CHUNKWIDTH=800, SO EACH CHUNK HOLDS 5 BUILDINGS => SPACING=160 EACH
                let buildingSpacing = chunkWidth / 5;
                let xWithinChunk = i * buildingSpacing + (buildingSpacing / 2);

                // 3. BUILDING.WORLDX = CHUNKINDEX * CHUNKWIDTH + XWITHINCHUNK. THIS IS THE "ABOSOLUTE" X-POSITION IN THE GAME WORLD //
                building.worldX = (index * chunkWidth) + xWithinChunk;

                // 4. BASIC "GROUND" POSITION SO BUILDING STANDS ON "Y=250" //
                building.y = 250;

                // 5. OPTIONALLY, STORE METADATA ABOUT THE LOCATION //
                building.locationData = locData;

                // 6. IF WE WANT TO POSITION IT IMMEDIATELY ON THE SCREEN, SUBTRACT WORLDX.  IF WE'RE GOING TO  CALL UPDATESCENE() LATER, WE CAN SKIP THIS.
                building.x = building.worldX - worldX;

                building.zIndex = 1;

                // 7. ADD BUILDING OT THE PIXI STAGE //
                app.stage.addChild(building);

                // 8. KEEP TRACK OF IT IF WE WANT TO MOVE OR REMOVE IT LATER //
                currentBuildings.push(building);

                // ADD A TEXT LABEL ABOVE EACH BUILDING //
                let labelText = `${locData.type_display}`;
                if (locData.subtype_display) {
                    labelText += ` (${locData.subtype_display})`;
                }

                if (locData.name) {
                    labelText += `\n"${locData.name}"`;
                }

                // ADD A RESTROOM/PUBLIC TAG //
                labelText += `\nRestroom: ${locData.has_restroom ? "Yes" : "No"}`;
                labelText += `\nPublic: ${locData.open_to_public ? "Yes" : "No"}`;

                let label = new PIXI.Text(labelText, {
                    fontSize: 12,
                    fill: 0xffffff,
                    align: "center",
                    wordWrap: true,
                    wordWrapWidth: 60
                });

                label.anchor.set(0.5, 1); // CENTER HORIZONTALLY, BOTTOM-ALIGN VERTICALLY //
                // label.x = building.worldX - worldX + 25; // CENTER ABOVIE BULDING //
                label.worldX = building.worldX + 25;
                label.x = label.worldX - worldX;
                label.y = building.y; // RIGHT ABOVE THE BUILDING TOP //

                label.zIndex = 5;
                app.stage.addChild(label);
                currentBuildings.push(label);
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




function getRandomDistance(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}




function addCharacterToGame(name, buttonElement, followMin = 30, followMax = 80) {
// function addCharacterToGame(name) {
    if (addedCharacterNames.has(name)) {
        return; // PREVENT DUPLICATES //
    }

    // addedCharacterNames.add(name);

    // DYNAMIC SPACING BASED ON HOW MANY CHARACTERS ARE ADDED //
    // let spacingBase = 50;
    // let spacing = Math.max(30, spacingBase - addedCharacters.length * 5);
    // NEVER LESS THAN 30PX APART //

    // RANDOMLY CHOOSE LEFT OR RIGHT //
    const offset = getRandomDistance(followMin, followMax);
    const direction = Math.random() < 0.5 ? -1 : 1;
    const totalOffset = offset * direction;
    // const maxOffset = 80; // PIXELS AWAY FROM MAIN CHARACTER //
    // const minOffset = 30; // AVOID EXACT OVERLAP //
    // let direction = Math.random() < 0.5 ? -1 : 1; // RANDOMLY LEFT OR RIGHT //
    // let offset = Math.floor(Math.random() * (maxOffset - minOffset)) + minOffset;
    // let totalOffset = direction * offset;
    // let totalOffset = direction * spacing * addedCharacters.length;
    // const offsetX = 50 + (addedCharacters.length * 60);
    // const offsetX = direction * nextOffset;
    // nextOffset += 40; // ENSURE SPACING INCREASES WITH EACH ADDED CHARACTER //
    


    const charGraphic = new PIXI.Graphics();
    charGraphic.beginFill(0x0000ff); // BLUE PLACEHOLDER //
    charGraphic.drawRect(0, 0, 50, 50);
    charGraphic.endFill();

    // charGraphic.x = 400 + offsetX;
    charGraphic.x = 400 + totalOffset;
    charGraphic.y = 300;
    charGraphic.zIndex = zIndexCounter--;
    app.stage.addChild(charGraphic);

    const label = new PIXI.Text(name, {
        fontSize: 12,
        fill: 0xffffff,
        align: 'center'
    });

    label.anchor.set(0.5, 1);
    label.x = charGraphic.x + 25;
    label.y = charGraphic.y - 5;
    label,zIndex = charGraphic.zIndex + 1;
    app.stage.addChild(label);

    addedCharacters.push({ name, graphic: charGraphic, label, follow_distance_min: followMin, follow_distance_max: followMax });
    addedCharacterNames.add(name); // TRACK NAME //

    // DISABLE OR REMOVE BUTTON //
    if (buttonElement) {
        buttonElement.disabled = true;
        buttonElement.innerText = "Added!"
    }
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

        app.stage.sortableChildren = true;

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
        player.zIndex = 10;
        app.stage.addChild(player);

        // ADD NAME LABEL IF AVAILABLE //
        if (typeof selectedCharacterName !== 'undefined' && selectedCharacterName) {
            const nameText = new PIXI.Text(selectedCharacterName, {
                fontSize: 14,
                fill: 0xffffff,
                align: 'center'
            });

            nameText.anchor.set(0.5, 1);
            nameText.x = player.x + 25;
            nameText.y = player.y - 5;
            nameText.zIndex = 11;
            app.stage.addChild(nameText);
        }

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


    leftButton.addEventListener('click', moveLeftOneCard);
    rightButton.addEventListener('click', moveRightOneCard);


});
