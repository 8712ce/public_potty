let app = new PIXI.Application({ width: 800, height: 400, backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

let player = new PIXI.Graphics();
player.beginFill(0xff0000);
player.drawRect(0, 0, 50, 50);
player.endFill();
player.x = 100;
player.y = 300;
app.stage.addChild(player);