import { WIDTH, HEIGHT } from "../config/constants.js";
import { VILLAGE_LAYOUT } from "../config/villageLayout.js";
import { CINEMATIC_PORTRAITS } from "../config/cinematicConfig.js";

/**
 * Conversaciones del pueblo de la Escena 1.
 *
 * Toda la historia nueva se cuenta con viñetas y bocadillos del sistema de
 * cómic ya existente: no se carga ni una sola imagen nueva. Los retratos HD
 * que se reutilizan están registrados en `CINEMATIC_PORTRAITS`.
 *
 * Cada personaje siembra un detalle que la Escena 3 recogerá al recorrer el
 * mismo pueblo ya destruido (el escudo de juguete, los ancianos del pórtico,
 * la promesa de volver antes del anochecer...).
 */
const VILLAGE_DIALOGUES = {
  wife: [
    {
      type: "vignette",
      speaker: "Esposa",
      portraitKey: CINEMATIC_PORTRAITS.wife,
      text: "Siempre supe que te irías con el General. Solo te pido una cosa: vuelve con la misma mirada con la que te fuiste."
    },
    {
      type: "bubble",
      target: "player",
      text: "Cuando vuelva, te contaré cada paso de la falange. Lo prometo."
    }
  ],
  boy: [
    {
      type: "bubble",
      target: "npc",
      text: "¿Me dejas sostener tu lanza, padre? Solo un momentito."
    },
    {
      type: "vignette",
      speaker: "Soldado",
      portraitKey: CINEMATIC_PORTRAITS.soldierThought,
      variant: "thought",
      text: "Es demasiado pesada para él. Quizá dentro de unos años... si es que queda algo de Esparta."
    }
  ],
  girl: [
    {
      type: "bubble",
      target: "npc",
      text: "¡Prométeme que volverás antes del anochecer!"
    },
    {
      type: "vignette",
      speaker: "Soldado",
      portraitKey: CINEMATIC_PORTRAITS.soldierThought,
      variant: "thought",
      text: "Antes del anochecer... El General dice que la batalla acabará mucho antes del ocaso."
    }
  ],
  farmer: [
    {
      type: "vignette",
      speaker: "Campesino",
      text: "La cosecha va bien, soldado. El trigo no sabe todavía de guerras."
    },
    {
      type: "bubble",
      target: "player",
      text: "Ojalá los dioses mantengan las cosas así."
    }
  ],
  blacksmith: [
    {
      type: "vignette",
      speaker: "Herrero",
      text: "Argos ha forjado mil lanzas este mes. ¿Y nosotros? Botones y promesas. No hace falta ser adivino para oler lo que viene."
    },
    {
      type: "vignette",
      speaker: "Soldado",
      portraitKey: CINEMATIC_PORTRAITS.soldierThought,
      variant: "thought",
      text: "El herrero tiene razón. Pero el General dice que Esparta nunca duerme."
    }
  ],
  neighbor: [
    {
      type: "vignette",
      speaker: "Aldeano",
      text: "Mi hermano está en la falange. Dice que el General canta antes de cargar. Yo solo quiero que vuelva a casa."
    },
    {
      type: "bubble",
      target: "player",
      text: "Yo también cantaría, si sirviera de algo."
    }
  ],
  elderWest: [
    {
      type: "vignette",
      speaker: "Guardia anciano",
      text: "Los jóvenes se van a la guerra y nosotros nos quedamos con las piedras. Alguien ha de sostener el techo, soldado."
    }
  ],
  elderEast: [
    {
      type: "vignette",
      speaker: "Guardia anciano",
      text: "Tu abuelo custodió este pórtico. Ahora te toca a ti... o a mí, hasta que vuelvas."
    },
    {
      type: "bubble",
      target: "player",
      text: "Vigilad bien este lugar. Volveré antes de que anochezca."
    }
  ]
};

const INTERACTION_RANGE = 96;
const DIALOGUE_DEPTH = 170;

/**
 * Gestiona las zonas de conversación del pueblo, el aviso [E] y el objetivo
 * opcional de hablar con todos los vecinos antes de partir a la plaza.
 */
export class VillageDialogueManager {
  constructor(scene, narrative) {
    this.scene = scene;
    this.narrative = narrative;
    this.npcs = [];
    this.talked = new Set();
    this.rewardShown = false;
    this.active = false;
    this.nearby = null;

    this.prompt = scene.add
      .text(WIDTH / 2, HEIGHT - 60, "", {
        fontFamily: "Arial, sans-serif",
        fontSize: "13px",
        fontStyle: "bold",
        color: "#f6d99a",
        backgroundColor: "#1a1412dd",
        padding: { left: 12, right: 12, top: 5, bottom: 5 }
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(136)
      .setVisible(false);

    this.objective = scene.add
      .text(20, HEIGHT - 62, "", {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        color: "#d8c49a",
        backgroundColor: "#1a1412aa",
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(136);

    scene.events.once("shutdown", () => this.clear());
    scene.events.once("destroy", () => this.clear());
  }

  /** Debe llamarse después de construir los sprites del pueblo. */
  registerNpcs() {
    const { home, village } = VILLAGE_LAYOUT;
    const villagers = this.scene.villagerSprites ?? [];
    const elders = this.scene.elderGuardSprites ?? [];

    this.npcs = [
      { id: "wife", name: "Esposa", x: home.wifeX, sprite: this.scene.wifeSprite, lines: VILLAGE_DIALOGUES.wife },
      { id: "boy", name: "Hijo", x: home.boyX, sprite: this.scene.boySprite, lines: VILLAGE_DIALOGUES.boy },
      { id: "girl", name: "Hija", x: home.girlX, sprite: this.scene.girlSprite, lines: VILLAGE_DIALOGUES.girl },
      {
        id: "farmer",
        name: "Campesino",
        x: village.villagers[0].x,
        sprite: villagers[0],
        lines: VILLAGE_DIALOGUES.farmer
      },
      {
        id: "blacksmith",
        name: "Herrero",
        x: village.villagers[1].x,
        sprite: villagers[1],
        lines: VILLAGE_DIALOGUES.blacksmith
      },
      {
        id: "neighbor",
        name: "Aldeano",
        x: village.villagers[2].x,
        sprite: villagers[2],
        lines: VILLAGE_DIALOGUES.neighbor
      },
      {
        id: "elderWest",
        name: "Guardia anciano",
        x: village.elderGuardsX[0],
        sprite: elders[0],
        lines: VILLAGE_DIALOGUES.elderWest
      },
      {
        id: "elderEast",
        name: "Guardia anciano",
        x: village.elderGuardsX[1],
        sprite: elders[1],
        lines: VILLAGE_DIALOGUES.elderEast
      }
    ];

    this.updateObjective();
  }

  findNearest(playerX) {
    let nearest = null;
    let bestDistance = INTERACTION_RANGE;

    for (const npc of this.npcs) {
      const distance = Math.abs(npc.x - playerX);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = npc;
      }
    }
    return nearest;
  }

  update(playerX) {
    if (this.active) return;
    if (this.scene.milestoneState?.hito1_2Started || this.scene.milestoneState?.hito1_3Started) {
      this.prompt.setVisible(false);
      return;
    }

    this.nearby = this.findNearest(playerX);
    if (this.nearby) {
      const mark = this.talked.has(this.nearby.id) ? " ✓" : "";
      this.prompt.setText(`[E] Hablar con ${this.nearby.name}${mark}`).setVisible(true);
    } else {
      this.prompt.setVisible(false);
    }
  }

  /** @returns {boolean} true si se inició una conversación. */
  tryInteract(playerX) {
    const flags = this.scene.milestoneState ?? {};
    if (this.active || flags.hito1_2Started || flags.hito1_3Started || flags.sceneCompleted) return false;

    const npc = this.findNearest(playerX);
    if (!npc) return false;

    this.startConversation(npc);
    return true;
  }

  async startConversation(npc) {
    this.active = true;
    this.prompt.setVisible(false);
    this.scene.player?.setControlEnabled(false);

    const steps = npc.lines.map((line, index) => ({
      type: line.type,
      corner: line.corner ?? (index % 2 === 0 ? "top-left" : "top-right"),
      speaker: line.speaker ?? npc.name,
      portraitKey: line.portraitKey ?? null,
      variant: line.variant ?? "dialogue",
      text: line.text,
      target: line.target === "player" ? this.scene.player : npc.sprite,
      offsetY: line.offsetY ?? 78,
      depth: DIALOGUE_DEPTH,
      delayAfter: 240
    }));

    try {
      await this.narrative.playSequence(steps);
    } finally {
      this.talked.add(npc.id);
      this.updateObjective();
      if (this.scene.player && !this.scene.milestoneState?.sceneCompleted) {
        this.scene.player.setControlEnabled(true);
      }
      this.active = false;
    }

    if (
      this.talked.size === this.npcs.length &&
      !this.rewardShown &&
      !this.scene.milestoneState?.hito1_2Started
    ) {
      this.rewardShown = true;
      await this.narrative.showVignette({
        corner: "bottom-center",
        variant: "dramatic",
        speaker: "Soldado",
        portraitKey: CINEMATIC_PORTRAITS.soldier,
        text: "He oído sus nombres. Si Argos vuelve, ya no serán caras sin nombre detrás de mi escudo.",
        depth: DIALOGUE_DEPTH
      });
    }
  }

  updateObjective() {
    if (!this.objective) return;
    const total = this.npcs.length || 8;
    this.objective.setText(
      this.talked.size === total
        ? "OBJETIVO CUMPLIDO — Escuchaste a todos antes de marchar"
        : `OBJETIVO OPCIONAL — Habla con tu familia y el pueblo (${this.talked.size}/${total})`
    );
  }

  dismiss() {
    this.prompt.setVisible(false);
    this.nearby = null;
  }

  clear() {
    this.prompt?.destroy();
    this.objective?.destroy();
    this.prompt = null;
    this.objective = null;
  }
}
