class Boss extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture, ataque) {

        super(scene, x, y, texture);

        //oi

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);

        this.velocidade = 200;
        this.PodeAtq = true;
        this.EstaAtacando = false;
        this.Vulneravel = false;
        this.jaDeuDano = false;
        this.escolha;

        this.atq = scene.physics.add.sprite(0, 0, ataque);
        this.atq.setScale(2.6);
        this.atq.setVisible(false);
        this.atq.body.setSize(60, 50);
        this.atq.body.setAllowGravity(false);

        this.investidaAtiva = false;

        this.distanciaX = 0;
        this.distanciaY = 0;

        this.opcoes = [3,5,7];
        this.opcoesAngulos = [15,30,45];
        this.AtingiuAlturaMax = -1;
        this.Lancas = [];
        this.aleatorio = 0;
        this.anguloBossPlayer = 0;
        this.LancasSpeed = 350;
        this.LancasEstado = 0;

        this.body.setSize(70, 270);
        this.body.setOffset(335, 275);
        this.play('BossAndando');
        this.setScale(1);
        this.direcao = -1;
        this.PodeVirar = true;

        this.corFeixe = 0xff0000;
        this.feixes = [];
        this.feixesAtivos = false;
        this.jaDeuDanoFeixe = false;
        this.criarFeixes();

        this.vida = 1000;

        //console.log('foi');
    }

    Seguirplayer(player) {

            if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'BossAndando') {

                this.play('BossAndando');

                this.body.setSize(70, 270);

            }

        if (this.x < player.x) {

            this.body.setVelocityX(this.velocidade);

            this.flipX = false;

            this.atq.flipX = true;

        } else {

            this.body.setVelocityX(-this.velocidade);

            this.flipX = true;

            this.atq.flipX = false;

        }

    }

    PosAtaque(player) {

        this.atq.y = this.y + 80;

        //this.atq.setAllowGravity(false);

        if(player.x > this.x)

        {

            this.direcao = +1;

            this.atq.flipX = false;

            this.flipX = false;

            this.body.setOffset(240, 275);

        }else

        {

            this.direcao = -1;

            this.atq.flipX = true;

            this.flipX = true;

            this.body.setOffset(335, 275);

        }

            if(player.x > this.x && this.PodeVirar == false)

            {

                this.flipX = false;

                this.body.setOffset(85, 275);

            }

            if(player.x < this.x && this.PodeVirar == false)

            {

                this.flipX = true;

                this.body.setOffset(335, 275);

            }

            this.atq.x = this.x + 120 * this.direcao;

        }

    ataque1(player) {

        if (this.distanciaX < 200 && this.distanciaY < 200 && this.PodeAtq) 
            {
            this.PodeAtq = false;
            this.EstaAtacando = true;
            this.jaDeuDano = false;
            this.body.setVelocityX(0);
            this.PosAtaque(player);

                const ativarHitbox = (animacao, frame) => {
                    if (frame.index === 3) {
                        this.atq.setVisible(true);
                        this.off('animationupdate', ativarHitbox);
                    }
                };

                this.on('animationupdate', ativarHitbox);
                this.play('BossAtacando');
                this.body.setSize(100, 270);
                this.body.setOffset(335, 275);
                this.once('animationcomplete-BossAtacando', () => {
                this.atq.setVisible(false);
                this.EstaAtacando = false;
                this.body.setSize(70, 270);
                this.play('BossAndando');

            });

            this.scene.time.delayedCall(2000, () => {

                this.PodeAtq = true;

            });

        }

    }

acertarPlayer(player) {

    //console.log("acertarPlayer foi chamado");

    if (!this.EstaAtacando || this.jaDeuDano || !this.atq.visible) {
        return;
    }

    this.jaDeuDano = true;

        if (player.ParryConfig.ParryFoi) {
        player.ParryConfig.ParryJaFoi = 1;
        player.ParryObj.setVisible(true);
        player.ParryObj.play('EfeitoParry');
        player.ParryConfig.ParryFoi = true;
        player.ParryObj.once('animationcomplete-EfeitoParry', () => {
        player.ParryObj.setVisible(false);
        player.ParryConfig.ParryFoi = false;
        });

        return;

        }

        if (!player.PodeTomarDano) {
            return;
        }

        player.vida -= 7;

        if (this.x < player.x) {

            player.body.setVelocityX(600);

        } else {

            player.body.setVelocityX(-600);

        }

        player.body.setVelocityY(-300);

    }

investidaAtaque(player) {
    if (!this.PodeAtq || this.EstaAtacando) return;

    this.PodeAtq = false;
    this.EstaAtacando = true;
    this.jaDeuDano = false;
    this.body.setVelocityX(0);

    if (this.x < player.x) {
        this.flipX = false;
        this.atq.flipX = false;
    } else {
        this.flipX = true;
        this.atq.flipX = true;
    }

    this.scene.time.delayedCall(500, () => {
        this.body.setVelocityX(this.flipX ? -1000 : 1000);
        this.investidaAtiva = true;
        this.PodeVirar = false; // hitbox de contato ativa durante o avanço

        this.scene.time.delayedCall(500, () => {

            this.body.setVelocityX(0);
            this.investidaAtiva = false;
            this.EstaAtacando = false;
            this.PodeVirar = true;

            this.scene.time.delayedCall(1500, () => {
                this.PodeAtq = true;
            });
        });
    });
}

        acertarInvestida(player) {
        if (!this.investidaAtiva || this.jaDeuDano) return;

        this.jaDeuDano = true;

        if(player.ParryConfig.ParryFoi) {

        player.ParryConfig.ParryJaFoi = 1;
        player.ParryObj.setVisible(true);
        player.ParryObj.play('EfeitoParry');
        player.ParryConfig.ParryFoi = true;
        player.ParryObj.once('animationcomplete-EfeitoParry', () => {
        player.ParryObj.setVisible(false);
        player.ParryConfig.ParryFoi = false;
        });
        return;
        }

        if (!player.PodeTomarDano) {
        return;
        }

        player.vida -= 12;
        if (this.x < player.x) {
            player.body.setVelocityX(800);
        } else {
            player.body.setVelocityX(-800);
        }
        player.body.setVelocityY(-300);
    }

    criarFeixes() {

        const largura = this.scene.scale.width;

        const altura = this.scene.scale.height;

        for (let i = 0; i < 5; i++) {

            const feixe = this.scene.add.rectangle(

                0,

                0,

                largura * 1.5,

                9,

                this.corFeixe

            );

            feixe.setOrigin(0.5);

            feixe.setVisible(false);

            this.feixes.push({

                objeto: feixe,

                angulo: 0,

                x: 0,

                y: 0

            });

        }

    }

    gerarPadraoXequeMate() {

        const largura = this.scene.scale.width;

        const altura = this.scene.scale.height;

        const angulos = [

            45,

            -45,

            25,

            -25,

            155

        ];

        for (let i = 0; i < this.feixes.length; i++) {

            const feixe = this.feixes[i];

            feixe.x = Phaser.Math.Between(0, largura);

            feixe.y = Phaser.Math.Between(100, altura - 120);

            feixe.angulo = angulos[i];

            feixe.objeto.x = feixe.x;

            feixe.objeto.y = feixe.y;

            feixe.objeto.setRotation(

                Phaser.Math.DegToRad(feixe.angulo)

            );

            feixe.objeto.setFillStyle(this.corFeixe);

            feixe.objeto.setVisible(true);

        }

    }

    xequeMate(player) {

        if (!this.PodeAtq || this.EstaAtacando) {

            return;

        }

        this.PodeAtq = false;

        this.EstaAtacando = true;

        this.Vulneravel = false;

        this.PodeVirar = false;

        this.body.setVelocityX(0);

        this.gerarPadraoXequeMate();

        this.scene.time.delayedCall(1000, () => {

            this.feixesAtivos = true;

            this.scene.time.delayedCall(700, () => {

                this.feixesAtivos = false;
                this.jaDeuDanoFeixe = false;

                for (let i = 0; i < this.feixes.length; i++) {

                    this.feixes[i].objeto.setVisible(false);

                }

                this.EstaAtacando = false;

                this.Vulneravel = true;

                this.scene.time.delayedCall(1800, () => {

                    this.Vulneravel = false;

                    this.PodeAtq = true;

                    this.PodeVirar = true;

                });

            });

        });

    }

    verificarFeixes(player) {

        if (!this.feixesAtivos || this.jaDeuDanoFeixe) {

            return;

        }

        if (player.ParryConfig.ParryAtivo) {

        player.ParryConfig.ParryJaFoi = 1;

        player.ParryObj.setVisible(true);

        player.ParryObj.play('EfeitoParry');

        player.ParryConfig.ParryFoi = true;

        player.ParryObj.once('animationcomplete-EfeitoParry', () => {

        player.ParryObj.setVisible(false);

        player.ParryConfig.ParryFoi = false;

        });return;}

//

        for (let i = 0; i < this.feixes.length; i++) {

            const feixe = this.feixes[i];

            const angulo = Phaser.Math.DegToRad(feixe.angulo);

            const dx = player.x - feixe.x;

            const dy = player.y - feixe.y;

            const distancia = Math.abs(

                dx * Math.sin(angulo) -

                dy * Math.cos(angulo)

            );

            if (distancia < 25) {

                if (!player.PodeTomarDano) {
                return;
                }
                player.vida -= 10;

                if (player.body.velocity.y === 0) {

                    player.body.setVelocityY(-300);

                }

                return;

            }

        }

    }

    AtaquePulo(player){

        if (!this.PodeAtq || this.EstaAtacando) {

        return;

        }

        this.PodeAtq = false;

        this.EstaAtacando = true;

        this.jaDeuDano = false;

        this.AtingiuAlturaMax = 0;

        this.PodeVirar = false;

            this.body.setVelocityY(-800);

            }

            AtualizarAnguloLancas(player)

            {

            const meio = Math.floor(this.NumeroLancas / 2);

                const angulo =

        Phaser.Math.RadToDeg(

            Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y));

            for(let i = 0; i < this.NumeroLancas; i++)

            {

            const deslocamento = (i - meio) * 25;

            this.Lancas[i].angulo = angulo + deslocamento;

            this.Lancas[i].setRotation(Phaser.Math.DegToRad(this.Lancas[i].angulo + 90));

            }

            }

            CriarLancas(player)

            {
                this.anguloBossPlayer = Phaser.Math.RadToDeg(
                Phaser.Math.Angle.Between(
                this.x,
                this.y,
                player.x,
                player.y
                )
                );
                this.aleatorio = Phaser.Math.Between(0,2);
                this.NumeroLancas = this.opcoes[this.aleatorio];
                const meio = Math.floor(this.NumeroLancas / 2);
                for(let i = 0; i < this.NumeroLancas; i++)
                {
                    this.Lancas[i] = this.scene.physics.add.sprite(this.x,this.y,'Lanca');
                    this.Lancas[i].jaDeuDano = false;
                    this.Lancas[i].setScale(0.3);

                    const deslocamento = (i - meio) * 25;

                    this.Lancas[i].angulo = this.anguloBossPlayer + deslocamento;

                    this.Lancas[i].body.setAllowGravity(false);

                    //eu estou convertendo de radianos para graus e depois para radianos de novo para que eu possa entender

                    //já que eu não estou acostumado com radianos

                }

                this.LancasEstado = 1;

                this.AtualizarAnguloLancas(player);

            }

                    LancarLancas() {

    for (let i = 0; i < this.NumeroLancas; i++) {

        const lanca = this.Lancas[i];

        // Guarda o ângulo definitivo do disparo

        lanca.anguloDisparo = lanca.angulo;

        const angulo = Phaser.Math.DegToRad(lanca.anguloDisparo);

        const comprimento = lanca.displayHeight / 2;

        const dx = Math.cos(angulo);

        const dy = Math.sin(angulo);

        lanca.canto1 = {

            x: lanca.x - dx * comprimento,

            y: lanca.y - dy * comprimento

        };

        lanca.canto2 = {

            x: lanca.x + dx * comprimento,

            y: lanca.y + dy * comprimento

        };

        lanca.setVelocityX(

            Math.cos(angulo) * this.LancasSpeed

        );

        lanca.setVelocityY(

            Math.sin(angulo) * this.LancasSpeed

        );

    }

}

            AtualizarHitboxLancas() {

    for (let i = 0; i < this.NumeroLancas; i++) {

        const lanca = this.Lancas[i];

        if (!lanca.canto1) {

            continue;

        }

        const angulo = Phaser.Math.DegToRad(lanca.anguloDisparo);

        const comprimento = lanca.displayHeight / 2;

        const dx = Math.cos(angulo);

        const dy = Math.sin(angulo);

        lanca.canto1.x = lanca.x - dx * comprimento;

        lanca.canto1.y = lanca.y - dy * comprimento;

        lanca.canto2.x = lanca.x + dx * comprimento;

        lanca.canto2.y = lanca.y + dy * comprimento;

    }

}

VerificarHitboxLancas(player) {

    for (let i = 0; i < this.NumeroLancas; i++) {

        const lanca = this.Lancas[i];

        if (!lanca.canto1) {

            continue;

        }

        const x1 = lanca.canto1.x;

        const y1 = lanca.canto1.y;

        const x2 = lanca.canto2.x;

        const y2 = lanca.canto2.y;

        const px = player.x;

        const py = player.y;

        const dx = x2 - x1;

        const dy = y2 - y1;

        const comprimentoQuadrado = dx * dx + dy * dy;

        let t =

            ((px - x1) * dx + (py - y1) * dy) /

            comprimentoQuadrado;

        t = Math.max(0, Math.min(1, t));

        const pontoX = x1 + t * dx;

        const pontoY = y1 + t * dy;

        const distancia = Phaser.Math.Distance.Between(
            px,
            py,
            pontoX,
            pontoY
        );

        const distanciaParede = Phaser.Math.Distance.Between(
            px,
            py,
            pontoX,
            pontoY
        );

        if (distancia < 15) {
            if (lanca.jaDeuDano) {continue};
        if (player.ParryConfig.ParryAtivo) {
                lanca.destroy(); 
                this.Lancas.splice(this.Lancas.indexOf(lanca), 1); 
                this.NumeroLancas -= 1; 
        player.ParryConfig.ParryJaFoi = 1;
        player.ParryObj.setVisible(true);
        player.ParryObj.play('EfeitoParry');
        player.ParryConfig.ParryFoi = true;
        player.ParryObj.once('animationcomplete-EfeitoParry', () => {
        player.ParryObj.setVisible(false);
        player.ParryConfig.ParryFoi = false;
        });
        return;
        }
            if (distancia < 15) {
                if (lanca.jaDeuDano) { continue };
                // ...checagem de parry...
                if (!player.PodeTomarDano) return;
                player.vida -= 10;
                player.PodeTomarDano = false;
                if (this.x < player.x) { player.body.setVelocityX(500); } else { player.body.setVelocityX(-500); }
                lanca.destroy(); 
                this.Lancas.splice(this.Lancas.indexOf(lanca), 1); 
                this.NumeroLancas -= 1; 
                return;
            }

    }

}}

        AtaquePuloAltMax(player){

    this.body.setVelocityY(0);

    this.body.setAllowGravity(false);

    this.setVelocityX(0);

    this.AtingiuAlturaMax = 0;

    this.scene.time.delayedCall(200, () => {

        this.CriarLancas(player);

        this.scene.time.delayedCall(1300, () => {

        this.LancasEstado = 0;

        this.scene.time.delayedCall(200, () => {

            this.LancarLancas();

    this.scene.time.delayedCall(600, () => {

        this.body.setAllowGravity(true);

        this.EstaAtacando = false;

        this.PodeVirar = true;

        this.scene.time.delayedCall(1500, () => {

        this.AtingiuAlturaMax = -1;

        this.PodeAtq = true;

    });

    });

    });

    });

    });

    }

    escolherAtaque(player) {

        if (this.distanciaX < 300) {

            this.ataque1(player);

        } else if (this.distanciaX < 600) {

            //const this.escolha = 2;

            this.escolha = Phaser.Math.Between(0, 3);

            if (this.escolha === 0) {

                this.investidaAtaque(player);

            } else if (this.escolha === 1) {

                this.xequeMate(player);

            } else if(this.escolha === 2){

                this.AtaquePulo(player);

            }else {

                this.investidaAtaque(player);

            }

        } else {

            this.investidaAtaque(player);

        }

    }

 morrer(){
    if(this.vida <= 0){
        console.log('Morreu');     
        this.setScale(5);
      }
  }

    update(player) {
        this.morrer();
        this.PosAtaque(player);
        this.verificarFeixes(player);
        this.distanciaX = Math.abs(this.x - player.x);
        this.distanciaY = Math.abs(this.y - player.y);
        console.log(this.vida);
        if (this.Vulneravel) {
            this.body.setVelocityX(0);
            return;
        }
        if (this.EstaAtacando && this.body.velocity.y >= 0 && this.AtingiuAlturaMax == 0)
        {
        this.AtaquePuloAltMax(player);
        this.AtingiuAlturaMax = 1;
        }

        if (this.investidaAtiva) {
            if (this.scene.physics.overlap(this, player)) {
                this.acertarInvestida(player);
            }
        }

    if (this.scene.physics.overlap(this.atq, player)) {
        this.acertarPlayer(player);
            }
                // Enquanto estão voando
            if (this.LancasEstado == 0) {
                this.AtualizarHitboxLancas();
                this.VerificarHitboxLancas(player);
            }
            // Enquanto estão sendo preparadas
            if (this.LancasEstado == 1) {
                this.AtualizarAnguloLancas(player);
            }
        if (this.EstaAtacando) {
            return;
        }
        if (this.distanciaX > 300) {
            if (this.PodeAtq) {
                this.escolherAtaque(player);
            } else {
                this.Seguirplayer(player);
            }
        } else {
            this.body.setVelocityX(0);
            this.ataque1(player);
            }
                }
            }