class DeadScene extends Phaser.Scene {

    constructor() {
        super("Dead");
    }

   create() {

    const centroX = this.scale.width / 2;
    const centroY = this.scale.height / 2;

    this.add.text(
        centroX,
        centroY - 100,
        "Você morreu!!",
        {
            fontSize: "64px",
            color: "#ffffff"
        }
    ).setOrigin(0.5);


    let botao = this.add.text(
        centroX,
        centroY + 50,
        "Continuar",
        {
            fontSize: "40px",
            color: "#ffffff",
            backgroundColor: "#333333",
            padding: {
                x: 30,
                y: 15
            }
        }
    )
    .setOrigin(0.5)
    .setInteractive();


    botao.on("pointerdown", () => {
        this.scene.start("Inicio");
    });

    botao.on("pointerover", () => {
        botao.setScale(1.1);
    });

    botao.on("pointerout", () => {
        botao.setScale(1);
    });
}
}