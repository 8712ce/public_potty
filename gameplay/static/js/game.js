console.log("Game script loaded!");

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
        let app = new PIXI.Application({
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
        player.x = 100;
        player.y = 300;
        app.stage.addChild(player);

    } catch (error) {
        console.error("Error initializing Pixi.js:", error);
    }





    let currentChunkIndex = 0;

    // SIMPLE LEFT/RIGHT BUTTONS FOR TESTING CHUNK CHANGES //
    const leftButton = document.createElement('button');
    leftButton.innerText = "Move Left";
    document.body.appendChild(leftButton);

    const rightButton = document.createElement('button');
    rightButton.innerText = "Move Right";
    document.body.appendChild(rightButton);

    leftButton.addEventListener('click', () => {
        currentChunkIndex--;
        loadChunk(currentChunkIndex);
    });
    rightButton.addEventListener('click', () => {
        currentChunkIndex++;
        loadChunk(currentChunkIndex);
    });

    // FETCH CHUNK DATA FROM /GET_CHUNK/?INDEX=CURRENTCHUNKINDEX //
    function loadChunk(index) {
        fetch(`/get_chunk/?index=${index}`)
            .then(response => response.json())
            .then(data => {
                console.log("Chunk data for index", index, data);
                // FOR NOW, JUST DISPLAY THEM IN THE .LOCATIONS-CONTAINER OR EVENTUALLY, INTEGRATE THEM INTO PIXI SCENE //

                const container = document.querySelector('.locations-container');
                container.innerHTML = ''; // CLEAR EXISTING //

                data.forEach(location => {
                    const div = document.createElement('div');
                    div.classList.add('location-card');
                    div.innerHTML = `
                        <h2>${location.type_display}${location.subtype_display ? " ("+ location.subtype_display +")" : ""}</h2>
                        ${location.name ? `<p>"${location.name}"</p>` : ""}
                        <p>Has restroom? ${location.has_restroom ? "Yes" : "No"}</p>
                        <p>Public? ${location.open_to_public ? "Yes" : "No"}</p>
                    `;
                    container.appendChild(div);
                });
            })
            .catch(err => console.error("Error loading chunk:", err));
    }
});
