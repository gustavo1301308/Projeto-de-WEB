class InicioScene extends Phaser.Scene {

    constructor() {
        super("Inicio");
    }

   create() {

    const centroX = this.scale.width / 2;
    const centroY = this.scale.height / 2;

    this.add.text(
        centroX,
        centroY - 100,
        "The Chess Queen",
        {
            fontSize: "64px",
            color: "#ffffff"
        }
    ).setOrigin(0.5);


       
       this.add.text(
        centroX,
        centroY + 200,
        "Controles: \nA e D - andar \nEspaço - pular \nBotão esquerdo do mouse - Ataque corpo a corpo \nShift - Dash \nF - Parry \nQ - Atirar",
        {
            fontSize: "32px",
            color: "#ffffff"
        }
    ).setOrigin(0.5);


    let botao = this.add.text(
        centroX,
        centroY + 50,
        "Play",
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
        this.scene.start("Jogo");
    });

    botao.on("pointerover", () => {
        botao.setScale(1.1);
    });

    botao.on("pointerout", () => {
        botao.setScale(1);
    });
}
}
