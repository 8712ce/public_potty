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
let insideLocation = false;



function getRandomDistance(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



// A FUNCTION TO RE-DRAW EACH BUILDING BASED ON WORLDX //
function updateScene() {
    currentBuildings.forEach(b => {
        if (b.worldX !== undefined) {
            b.x = b.worldX - worldX;
        }
    });

    const mainX = 400; // THE MAIN CHARACTER STAYS CENTERED ON SCREEN //

    addedCharacters.forEach((charObj, index) => {
        const { graphic, label, followMin, followMax } = charObj;

        // PICK A DIRECTION TO FOLLOW (LEFT OR RIGHT OF MAIN) //
        const dir = Math.random() < 0.5 ? -1 : 1;
        const offset = getRandomDistance(followMin, followMax);

        // UPDATE X BASED ON CURRENT WORLD X AND SPACING //
        const targetX = mainX + (dir * offset);

        // OPTIONALLY: SMOOTH FOLLOW ANIMATION //
        graphic.x += (targetX - graphic.x) * 0.1;

        // KEEP LABELS UPDATED TOO //
        label.x = graphic.x + 25;
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
    if (insideLocation) rerturn;

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
    if (insideLocation) return;

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






function addCharacterToGame(name, buttonElement) {
// function addCharacterToGame(name) {
    if (addedCharacterNames.has(name)) {
        return; // PREVENT DUPLICATES //
    }

    // GET PERSONALIZED FOLLOW DISTANCE RANGE FROM BUTTON'S DATASET //
    const min = parseInt(buttonElement.dataset.followMin, 10);
    const max = parseInt(buttonElement.dataset.followMax, 10);
    const offset = getRandomDistance(min, max);

    const direction = Math.random() < 0.5 ? -1 : 1;
    const totalOffset = offset * direction;
    


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
    label.zIndex = charGraphic.zIndex + 1;
    app.stage.addChild(label);

    addedCharacters.push({ name, graphic: charGraphic, label, followMin: min, followMax: max });
    addedCharacterNames.add(name); // TRACK NAME //

    // DISABLE OR REMOVE BUTTON //
    if (buttonElement) {
        buttonElement.disabled = true;
        buttonElement.innerText = "Added!"
    }
}





function enterLocation(locationData) {
    insideLocation = true;

    const characterName = selectedCharacterName || "You";
    const hasRestroom = locationData.has_restroom;
    const isPublic = locationData.open_to_public;
    const requiresPermission = locationData.restroom_requires_permission;
    const isOccupied = locationData.restroom_occupied;
    const isOutOfOrder = locationData.restroom_out_of_order;
    const isVisible = locationData.restroom_visible;
    const lineCount = locationData.restroom_line;

    let restroomMessage = "";
    if (!hasRestroom) {
        restroomMessage = "This location does not have a restroom.";
    } else if (isOutOfOrder) {
        restroomMessage = "The restroom is currently out of order.";
    } else if (isOccupied) {
        restroomMessage = "The restroom is currently occupied.";
    } else if (requiresPermission) {
        restroomMessage = "You'll need to ask an employee for permission to use the restroom.";
    } else if (lineCount > 0) {
        restroomMessage = `There ${lineCount === 1 ? "is" : "are"} ${lineCount} person${lineCount > 1 ? "s" : ""} in line for the restroom.`;
    } else {
        restroomMessage = "The restroom is available!";
    }

    const visibilityNote = isVisible ? "(You can see where it is!)" : "(You'll need to ask for directions.)";

    document.getElementById("modalTitle").textContent = `${characterName} enters: ${locationData.name || "Unnamed Place"}`;

    let modalHtml = `
        <strong>Type:</strong> ${locationData.type_display}<br>
        <strong>Has Restroom?</strong> ${hasRestroom ? "Yes" : "No"}<br>
        <strong>Open to Public?</strong> ${isPublic ? "Yes" : "No"}<br><br>
        <strong>Restroom Status:</strong> ${restroomMessage}<br>
        ${hasRestroom && !isOutOfOrder ? `<em>${visibilityNote}</em><br>` : ""}
    `;

    if (hasRestroom && !isOutOfOrder) {
        if (locationData.restroom_requires_code) {
            modalHtml += `<strong>This restroom requires a code:</strong> ${locationData.restroom_code}<br>`;
        } else {
            modalHtml += `<strong>No code required for the restroom.</strong><br>`;
        }
    }

    document.getElementById("modalDetails").innerHTML = modalHtml;

    const needsHelp = hasRestroom && (requiresPermission || locationData.restroom_requires_code || !isVisible);

    if (needsHelp) {
        const helpButton = document.createElement('button');
        helpButton.innerText = "Ask Employee for Help";
        helpButton.onclick = () => handleEmployeeHelp(locationData);
        helpButton.style.marginTop = "10px";
        document.getElementById("modalDetails").appendChild(helpButton);
    }

    document.getElementById("interiorModal").classList.add("show");
    document.getElementById("modalOverlay").classList.add("show");
}



function handleEmployeeHelp(locationData) {
    // DON'T REPEAT IF ALREADY HANDLED PERMISSION AND NO CODE IS INVOLVED //
    if (locationData.help_received && !locationData.restroom_requires_code) return;

    let message = "";

    if (locationData.restroom_out_of_order) {
        message += "The employee shrugs and says, 'Sorry, the restroom is out of order.'<br>";

        // SET HELP AS RECEIVED ONLY IF THERE'S NO CODE INVOLVED //
        if (!locationData.restroom_requires_code) {
            locationData.help_received = true;

            // HIDE BUTTON ONLY IN THIS SPECIFIC CASE //
            const helpButton = document.querySelector("#modalDetails button");
            if (helpButton) helpButton.style.display = "none";
        }

    } else {
        // IF RESTROOM IS NOT VISIBLE AND PLAYER HASN'T BEEN SHOWN DIRECTIONS //
        if (!locationData.restroom_visible && !locationData.directions_given) {
            message += "The empolyee says, 'It's right over there.'<br>";
            locationData.directions_given = true;

            // IMPLICITLY GRANT PERMISSION TOO //
            if (locationData.restroom_requires_permission && !locationData.permission_granted) {
                locationData.permission_granted = true;
            }
        } else if (locationData.restroom_requires_permission && !locationData.permission_granted) {
            message += "The employee nods and says, 'Go ahead and use the restroom.'<br>";
            locationData.permission_granted = true;
        }

        // ALWAYS GIVE CODE IF REQUESTED AND IT EXISTS //
        if (locationData.restroom_requires_code && locationData.restroom_code) {
            message += `The employee whispers the code: <strong>${locationData.restroom_code}</strong><br>`;
        } else if (locationData.restroom_requires_code) {
            message += "The employee looks confused. 'Uh...I don't remember the code.'<br>";
        }
    }

    // UPDATE MODAL TO REFLECT CHANGES //
    document.getElementById("modalDetails").innerHTML += `<div style="margin-top:10px;">${message}</div>`;

    // // ONLY HID BUTTON IF PERMISSION WAS TEH ONLY THING NEEDED AND IT'S GRANTED //
    // const helpButton = document.querySelector("#modalDetails button");
    // if (helpButton && locationData.restroom_requires_permission) {
    //     helpButton.style.display = "none";
    // }

    // SHOW "ENTER RESTROOM" BUTTON NOW //
    showEnterRestroomButton(locationData);
}




function closeModal() {
    insideLocation = false;
    document.getElementById("interiorModal").classList.remove("show");
    document.getElementById("modalOverlay").classList.remove("show");

    if (currentLocationData) {
        currentLocationData.permission_granted = false;
        currentLocationData.help_received = false;
    }
}




function showHint(message) {
    const hint = document.createElement("div");
    hint.textContent = message;
    hint.className = "hint-message";
    document.body.appendChild(hint);

    setTimeout(() => {
        hint.classList.add("fade-out");
    }, 1000);

    setTimeout(() => {
        hint.remove();
    }, 2000);
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
    // document.body.appendChild(leftButton);

    // CREATE ENTER BUTTON //
    const enterButton = document.createElement('button');
    enterButton.innerText = "Enter";

    const rightButton = document.createElement('button');
    rightButton.innerText = "Move Right";
    // document.body.appendChild(rightButton);

    // BUTTON CONTAINER //
    const buttonContainer = document.createElement('div');
    buttonContainer.style.textAlign = "center";
    buttonContainer.style.margin = "20px";
    buttonContainer.appendChild(leftButton);
    buttonContainer.appendChild(enterButton);
    buttonContainer.appendChild(rightButton);

    document.body.appendChild(buttonContainer);

    // EVENT LISTENERS //
    leftButton.addEventListener('click', moveLeftOneCard);
    rightButton.addEventListener('click', moveRightOneCard);
    enterButton.addEventListener('click', () => {
        const centerX = 400 + worldX; // PLAYER'S WORLD-ALIGNED POSITION //
        let closest = null;
        let minDistance = Infinity;

        currentBuildings.forEach(obj => {
            if (obj.locationData) {
                const dist = Math.abs(obj.worldX - centerX);
                if (dist < minDistance) {
                    closest = obj;
                    minDistance = dist;
                }
            }
        });

        if (closest && minDistance < 40) {
            const loc = closest.locationData;
            if (loc.open_to_public) {
                enterLocation(loc);
            } else {
                showHint("This location is not open to the public.");
                // alert("This location is not open to the public.");
                // document.getElementById("modalTitle").textContent = "Access Denied";
                // document.getElementById("modalDetails").innerHTML = `
                //     This location is <strong>not open to the public</strong>.
                // `;
                // document.getElementById("interiorModal").style.display = "block";
            }
        } else {
            showHint("You must be in front of a location to enter.")
            // alert("You're not in front of a location.");
            // document.getElementById("modalTitle").textContent = "No Location Nearby";
            // document.getElementById("modalDetails").innerHTML = `
            //     You must be in front of a location to enter.
            // `;
            // document.getElementById("interiorModal").style.display = "block";
        }
    });


});
