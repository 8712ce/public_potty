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
});
