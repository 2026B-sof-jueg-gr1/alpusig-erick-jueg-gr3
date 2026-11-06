import { WIDTH, HEIGHT, COLORS } from "../config/constants.js";

export function addBackground(scene) {
  scene.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, COLORS.deepBlue);
  const sky = scene.add.graphics();
  sky.fillGradientStyle(0x294f73, 0x1e3a5f, 0x101b2d, 0x17283e, 1);
  sky.fillRect(0, 0, WIDTH, HEIGHT);
  sky.fillStyle(0xeaf4ff, 0.16);
  for (let i = 0; i < 50; i++) {
    sky.fillCircle((i * 137) % WIDTH, (i * 83) % 430, (i % 3) + 1);
  }
  sky.fillStyle(0x152943, 1)
    .fillTriangle(0, 500, 270, 230, 520, 500)
    .fillTriangle(310, 500, 700, 170, 1050, 500)
    .fillTriangle(760, 500, 1000, 280, 1250, 500);
  scene.add.rectangle(WIDTH / 2, 540, WIDTH, 28, 0xeaf4ff, 0.65);
}

export function addTitle(scene, text, y) {
  return scene.add.text(WIDTH / 2, y, text, {
    fontFamily: "Georgia",
    fontSize: "46px",
    color: "#eaf4ff",
    stroke: "#101b2d",
    strokeThickness: 8
  }).setOrigin(0.5);
}

export function addActionButton(scene, text, y, callback) {
  const button = scene.add.text(WIDTH / 2, y, text, {
    fontSize: "24px",
    color: "#23272f",
    backgroundColor: "#f4c542",
    padding: 14
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });
  
  button.on("pointerdown", callback);
  return button;
}

