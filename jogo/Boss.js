class Boss extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture, ataque, plataforms) {

        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);

        // ===== Padronização Andando / Idle / Atacando (sprites 400x400, centralizadas) =====
        this.BOSS_SCALE = 1.6;
        this.BOSS_BODY_WIDTH = 45;
        this.BOSS_BODY_HEIGHT = 170;
        this.BOSS_BODY_OFFSET_X = 175; // (400 - 70) / 2 — centralizado, mesmo valor pros dois lados agora
        this.BOSS_BODY_OFFSET_Y = 117; // ajuste visual conforme a arte final
        // ====================================================================================

        this.velocidade = 200;
        this.PodeAtq = true;
        this.EstaAtacando = false;
        this.Vulneravel = false;
        this.jaDeuDano = false;
        this.escolha;
        this.gambiarra = false;
        this.escolha2 = 0;
        this.plataforms = plataforms;

        this.barraDeVida = scene.add.graphics();
        this.Barra = scene.add.sprite(300, 300, 'BarraVidaBoss');
        this.Barra.setScale(1.2);

        this.atq = scene.physics.add.sprite(0, 0, ataque);
        this.atq.setScale(2.6);
        this.atq.setVisible(false);
        this.atq.body.setSize(60, 50);
        this.atq.body.setAllowGravity(false);

        this.investidaAtiva = false;

        this.distanciaX = 0;
        this.distanciaY = 0;

        this.opcoes = [3, 5, 7];
        this.opcoesAngulos = [15, 30, 45];
        this.AtingiuAlturaMax = -1;
        this.Lancas = [];
        this.aleatorio = 0;
        this.anguloBossPlayer = 0;
        this.LancasSpeed = 800;
        this.LancasEstado = 0;

        this.direcao = -1;
        this.PodeVirar = true;

        this.play('BossAndando');
        this.AplicarEstadoPadrao(); // scale/body/offset padronizados desde o início

        this.corFeixe = 0xff0000;
        this.feixes = [];
        this.feixesAtivos = false;
        this.jaDeuDanoFeixe = false;
        this.criarFeixes();

        this.vida = 1000;
    }

        AplicarOffsetPadrao() {
            const offsetX = this.flipX
                ? (this.width - this.BOSS_BODY_OFFSET_X - this.BOSS_BODY_WIDTH) // espelha para o lado esquerdo
                : this.BOSS_BODY_OFFSET_X; // valor original, lado direito

            this.body.setOffset(offsetX, this.BOSS_BODY_OFFSET_Y);
        }

    // Aplica scale, tamanho e offset do body de forma idêntica para
    // BossAndando / BossIdle / BossAtacando — chame sempre que entrar em um desses estados.
    AplicarEstadoPadrao() {
        this.setScale(this.BOSS_SCALE);
        this.body.setSize(this.BOSS_BODY_WIDTH, this.BOSS_BODY_HEIGHT);
        this.AplicarOffsetPadrao();
        //this.body.setOffset(this.BOSS_BODY_OFFSET_X, this.BOSS_BODY_OFFSET_Y);
        this.body.updateFromGameObject();
        this.AlinharAoChao();
    }

    AlinharAoChao() {
        const chaoTopY = this.scene.chao.body.top;
        this.body.updateFromGameObject();
        const ajuste = chaoTopY - this.body.bottom;
        this.y += ajuste;
        this.body.updateFromGameObject();
        this.body.setVelocityY(0);
    }

    AtualizarBarra() {
        if (this.flipX) {
            this.Barra.x = this.x + 0;
        } else {
            this.Barra.x = this.x - 0;
        }
        this.Barra.y = this.y - 160;
        this.barraDeVida.clear();
        this.barraDeVida.fillStyle(0x00ff00);
        const largura = this.Barra.displayWidth - 22;
        const altura = 20;
        const larguraAtual = largura * (this.vida / 1000);
        this.barraDeVida.fillRect(this.Barra.x - largura / 2, this.Barra.y - altura / 2, larguraAtual, altura);
    }

    Seguirplayer(player) {
        if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'BossAndando') {
            this.play('BossAndando');
            this.AplicarEstadoPadrao(); // mesmo padrão de body/scale que Idle e Atacando
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
        this.AplicarOffsetPadrao();
    }

    DefinirIdle(player) {
        this.play('BossIdle');
        this.AplicarEstadoPadrao(); // idle agora usa exatamente o mesmo body/scale de andando/atacando
    }

    PosAtaque(player) {
        this.atq.y = this.y + 0;

        // Offset não muda mais por direção (sprite centralizada) — só direção/flip são atualizados aqui.
        const emEstadoPadrao =
            this.anims.currentAnim?.key === 'BossAndando' ||
            this.anims.currentAnim?.key === 'BossAtacando' ||
            this.anims.currentAnim?.key === 'BossIdle';

        if (this.PodeVirar && emEstadoPadrao) {
            if (player.x > this.x) {
                this.direcao = +1;
                this.atq.flipX = false;
                this.flipX = false;
            } else {
                this.direcao = -1;
                this.atq.flipX = true;
                this.flipX = true;
            }
            this.AplicarOffsetPadrao();
        }

        this.atq.x = this.x + 120 * this.direcao;
    }

    ataque1(player) {
        if (this.distanciaX < 200 && this.distanciaY < 200 && this.PodeAtq) {
            this.PodeAtq = false;
            this.EstaAtacando = true;
            this.jaDeuDano = false;
            this.body.setVelocityX(0);

            const ativarHitbox = (animacao, frame) => {
                if (frame.index === 7) {
                    this.atq.setVisible(true);
                    this.off('animationupdate', ativarHitbox);
                }
            };

            this.on('animationupdate', ativarHitbox);

            this.play('BossAtacando');
            this.AplicarEstadoPadrao(); // mesmo body/scale do andando e idle
            this.PosAtaque(player);

            this.once('animationcomplete-BossAtacando', () => {
                this.atq.setVisible(false);
                this.EstaAtacando = false;
                this.DefinirIdle(player);
            });

            this.scene.time.delayedCall(2000, () => {
                this.PodeAtq = true;
            });
        }
    }

    acertarPlayer(player) {
        if (!this.EstaAtacando || this.jaDeuDano || !this.atq.visible) {
            return;
        }

        if (player.ParryConfig.ParryFoi) {
            player.ParryConfig.ParryJaFoi = 1;
            player.ParryObj.setVisible(true);
            player.ParryObj.play('EfeitoParry');
            player.ParryConfig.ParryFoi = true;
            player.ParryConfig.ParryNumero += 1;
            this.jaDeuDano = true;
            player.ParryObj.once('animationcomplete-EfeitoParry', () => {
                player.ParryObj.setVisible(false);
                player.ParryConfig.ParryFoi = false;
            });
            return;
        }

        if (!player.PodeTomarDano) {
            return;
        }

        this.jaDeuDano = true;
        player.vida -= 7;

        if (this.x < player.x) {
            player.body.setVelocityX(600);
        } else {
            player.body.setVelocityX(-600);
        }
        player.body.setVelocityY(-300);
    }

    investidaAtaque(player) {
        if (this.EstaAtacando) return;

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

        this.scene.time.delayedCall(499, () => {
            this.investidaAtiva = true;

            this.scene.time.delayedCall(1, () => {
                this.body.setVelocityX(this.flipX ? -1000 : 1000);
                this.PodeVirar = false;

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
        });
    }

    acertarInvestida(player) {
        if (!this.investidaAtiva || this.jaDeuDano) return;

        if (player.ParryConfig.ParryFoi) {
            player.ParryConfig.ParryJaFoi = 1;
            player.ParryObj.setVisible(true);
            player.ParryObj.play('EfeitoParry');
            player.ParryConfig.ParryFoi = true;
            player.ParryConfig.ParryNumero += 1;
            player.ParryObj.once('animationcomplete-EfeitoParry', () => {
                player.ParryObj.setVisible(false);
                player.ParryConfig.ParryFoi = false;
                this.jaDeuDano = true;
            });
            return;
        }

        if (player.PodeTomarDano == false) {
            return;
        }

        this.jaDeuDano = true;
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
        for (let i = 0; i < 5; i++) {
            const feixe = this.scene.add.rectangle(0, 0, largura * 1.5, 9, this.corFeixe);
            feixe.setOrigin(0.5);
            feixe.setVisible(false);
            this.feixes.push({ objeto: feixe, angulo: 0, x: 0, y: 0 });
        }
    }

    gerarPadraoXequeMate() {
        const largura = this.scene.scale.width;
        const altura = this.scene.scale.height;
        const angulos = [45, -45, 25, -25, 155];
        for (let i = 0; i < this.feixes.length; i++) {
            const feixe = this.feixes[i];
            feixe.x = Phaser.Math.Between(0, largura);
            feixe.y = Phaser.Math.Between(100, altura - 120);
            feixe.angulo = angulos[i];
            feixe.objeto.x = feixe.x;
            feixe.objeto.y = feixe.y;
            feixe.objeto.setRotation(Phaser.Math.DegToRad(feixe.angulo));
            feixe.objeto.setFillStyle(this.corFeixe);
            feixe.objeto.setVisible(true);
        }
    }

    // xequeMate continua com body/scale próprios (usa a spritesheet AtaqueFeixes,
    // que é um tamanho de frame diferente — 640x640 — então não entra na padronização)
    xequeMate(player) {
        if (this.EstaAtacando) return;

        this.PodeAtq = false;
        this.EstaAtacando = true;
        this.Vulneravel = false;
        this.PodeVirar = false;
        this.body.setVelocityX(0);
        this.gerarPadraoXequeMate();
        this.gambiarra = true;

        this.anims.play('AtaqueFeixes');
        this.body.setAllowGravity(false);
        this.setScale(1.5);
        this.body.setSize(50, 170);

        if (this.flipX) {
            this.body.setOffset(350, 288);
            this.x -= 40;
        } else {
            this.body.setOffset(290 - this.body.width, 288);
            this.x += 40;
        }

        this.body.updateFromGameObject();
        this.AlinharAoChao();

        for (let i = 0; i < this.feixes.length; i++) {
            this.feixes[i].objeto.alpha = 0.5;
        }

        this.scene.time.delayedCall(1000, () => {
            this.feixesAtivos = true;
            for (let i = 0; i < this.feixes.length; i++) {
                this.feixes[i].objeto.alpha = 0.8;
            }

            this.scene.time.delayedCall(700, () => {
                this.feixesAtivos = false;
                this.jaDeuDanoFeixe = false;

                for (let i = 0; i < this.feixes.length; i++) {
                    this.feixes[i].objeto.setVisible(false);
                }

                this.EstaAtacando = false;
                this.gambiarra = false;

                this.DefinirIdle(player); // volta ao body padronizado (Andando/Idle/Atacando)

                if (player.x > this.x) {
                    this.direcao = +1;
                    this.atq.flipX = false;
                    this.flipX = false;
                } else {
                    this.direcao = -1;
                    this.atq.flipX = true;
                    this.flipX = true;
                }

                this.Vulneravel = true;
                this.body.setAllowGravity(true);
                this.scene.time.delayedCall(1800, () => {
                    this.Vulneravel = false;
                    this.PodeAtq = true;
                    this.PodeVirar = true;
                });
            });
        });
    }

    verificarFeixes(player) {
        if (!this.feixesAtivos || this.jaDeuDanoFeixe == true) {
            return;
        }

        for (let i = 0; i < this.feixes.length; i++) {
            const feixe = this.feixes[i];
            const angulo = Phaser.Math.DegToRad(feixe.angulo);

            const dx = player.x + 20 - feixe.x;
            const dy = player.body.top + 20 - feixe.y;
            const distancia = Math.abs(dx * Math.sin(angulo) - dy * Math.cos(angulo));

            const dx2 = player.x - 20 - feixe.x;
            const dy2 = player.body.bottom - 20 - feixe.y;
            const distancia2 = Math.abs(dx2 * Math.sin(angulo) - dy2 * Math.cos(angulo));

            if (distancia < 24 || distancia2 < 24) {
                if (!player.PodeTomarDano) return;

                if (player.ParryConfig.ParryAtivo) {
                    player.ParryConfig.ParryJaFoi = 1;
                    player.ParryObj.setVisible(true);
                    player.ParryObj.play('EfeitoParry');
                    player.ParryConfig.ParryFoi = true;
                    this.jaDeuDanoFeixe = true;
                    player.ParryConfig.ParryNumero += 1;
                    player.ParryObj.once('animationcomplete-EfeitoParry', () => {
                        player.ParryObj.setVisible(false);
                        player.ParryConfig.ParryFoi = false;
                    });
                    return;
                }

                if (this.jaDeuDanoFeixe == false) {
                    this.jaDeuDanoFeixe = true;
                    player.vida -= 10;
                }

                if (player.body.velocity.y === 0) {
                    player.body.setVelocityY(-300);
                }
                return;
            }
        }
    }

    AtaquePulo(player) {
        if (this.EstaAtacando) return;

        this.PodeAtq = false;
        this.EstaAtacando = true;
        this.jaDeuDano = false;
        this.AtingiuAlturaMax = 0;

        this.DefinirIdle(player); // usa o mesmo body/scale padronizado

        this.PodeVirar = false;
        this.body.setVelocityY(-800);
    }

    AtualizarAnguloLancas(player) {
        const meio = Math.floor(this.NumeroLancas / 2);
        const angulo = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y));
        for (let i = 0; i < this.NumeroLancas; i++) {
            const deslocamento = (i - meio) * 25;
            this.Lancas[i].angulo = angulo + deslocamento;
            this.Lancas[i].setRotation(Phaser.Math.DegToRad(this.Lancas[i].angulo + 90));
        }
    }

    CriarLancas(player) {
        this.anguloBossPlayer = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y));
        this.aleatorio = Phaser.Math.Between(0, 2);
        this.NumeroLancas = this.opcoes[this.aleatorio];
        const meio = Math.floor(this.NumeroLancas / 2);
        for (let i = 0; i < this.NumeroLancas; i++) {
            this.Lancas[i] = this.scene.physics.add.sprite(this.x, this.y, 'Lanca');
            this.Lancas[i].jaDeuDano = false;
            this.Lancas[i].setScale(0.3);
            this.Lancas[i].body.setSize(200,200);
            const deslocamento = (i - meio) * 25;
            this.Lancas[i].angulo = this.anguloBossPlayer + deslocamento;
            this.Lancas[i].body.setAllowGravity(false);
        }
        this.LancasEstado = 1;
        this.AtualizarAnguloLancas(player);
    }

    LancarLancas() {
        for (let i = 0; i < this.NumeroLancas; i++) {
            const lanca = this.Lancas[i];
            lanca.anguloDisparo = lanca.angulo;
            const angulo = Phaser.Math.DegToRad(lanca.anguloDisparo);
            const comprimento = lanca.displayHeight / 2;
            const dx = Math.cos(angulo);
            const dy = Math.sin(angulo);
            lanca.canto1 = { x: lanca.x - dx * comprimento, y: lanca.y - dy * comprimento };
            lanca.canto2 = { x: lanca.x + dx * comprimento, y: lanca.y + dy * comprimento };
            lanca.setVelocityX(Math.cos(angulo) * this.LancasSpeed);
            lanca.setVelocityY(Math.sin(angulo) * this.LancasSpeed);
        }
    }

    AtualizarHitboxLancas() {
        for (let i = 0; i < this.NumeroLancas; i++) {
            const lanca = this.Lancas[i];
            if (!lanca.canto1) continue;
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

                for (let i = 0; i < this.NumeroLancas; i++) 
                {
                    if (this.scene.physics.overlap(this.Lancas[i], this.plataforms))
                    {
                    this.Lancas[i].destroy();
                    this.Lancas.splice(this.Lancas.indexOf(this.Lancas[i]), 1);
                    this.NumeroLancas -= 1;
                     }
                }


        for (let i = 0; i < this.NumeroLancas; i++) {
            const lanca = this.Lancas[i];
            if (!lanca.canto1) continue;

            const x1 = lanca.canto1.x, y1 = lanca.canto1.y;
            const x2 = lanca.canto2.x, y2 = lanca.canto2.y;
            const px = player.x, py = player.y;
            const dx = x2 - x1, dy = y2 - y1;
            const comprimentoQuadrado = dx * dx + dy * dy;
            let t = ((px - x1) * dx + (py - y1) * dy) / comprimentoQuadrado;
            t = Math.max(0, Math.min(1, t));
            const pontoX = x1 + t * dx;
            const pontoY = y1 + t * dy;
            const distancia = Phaser.Math.Distance.Between(px, py, pontoX, pontoY);

            if (distancia < 15) {
                if (lanca.jaDeuDano) continue;

                if (player.ParryConfig.ParryAtivo) {
                    lanca.destroy();
                    this.Lancas.splice(this.Lancas.indexOf(lanca), 1);
                    this.NumeroLancas -= 1;
                    player.ParryConfig.ParryJaFoi = 1;
                    player.ParryObj.setVisible(true);
                    player.ParryObj.play('EfeitoParry');
                    player.ParryConfig.ParryFoi = true;
                    player.ParryConfig.ParryNumero += 1;
                    player.ParryObj.once('animationcomplete-EfeitoParry', () => {
                        player.ParryObj.setVisible(false);
                        player.ParryConfig.ParryFoi = false;
                    });
                    return;
                }

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
    }

    AtaquePuloAltMax(player) {
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
        if (!this.PodeAtq || this.EstaAtacando) return;
        this.PodeAtq = false;
        this.PosAtaque(player);

        this.scene.time.delayedCall(1, () => {
            this.Seguirplayer(player);

            if (player.x > this.x) {
                this.direcao = +1;
                this.atq.flipX = false;
                this.flipX = false;
            } else {
                this.direcao = -1;
                this.atq.flipX = true;
                this.flipX = true;
            }
            this.AplicarOffsetPadrao();

            this.escolha = Phaser.Math.Between(0, 2);

            if (this.escolha === 0) {
                this.investidaAtaque(player);
            } else if (this.escolha === 1) {
                this.xequeMate(player);
            } else if (this.escolha === 2) {
                this.AtaquePulo(player);
            } else {
                this.investidaAtaque(player);
            }
        });
    }

    morrer() {
        if (this.vida <= 0) {
            console.log('Morreu');
            this.scene.scene.start('Win');
        }
    }

    update(player, delta) {
        this.morrer();
        this.PosAtaque(player);
        this.verificarFeixes(player);
        this.AtualizarBarra();
        this.distanciaX = Math.abs(this.x - player.x);
        this.distanciaY = Math.abs(this.y - player.y);

        if (this.Vulneravel) {
            this.body.setVelocityX(0);
            return;
        }

        if (this.EstaAtacando && this.body.velocity.y >= 0 && this.AtingiuAlturaMax == 0) {
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

        if (this.LancasEstado == 0) {
            this.AtualizarHitboxLancas();
            this.VerificarHitboxLancas(player);
        }
        if (this.LancasEstado == 1) {
            this.AtualizarAnguloLancas(player);
        }

        if (this.EstaAtacando) return;

        if (this.distanciaX > 400) {
            if (this.PodeAtq) {
                this.escolherAtaque(player);
            } else {
                this.Seguirplayer(player);
            }
        } else {
            this.escolha2 = Phaser.Math.Between(1, 3);
            if (this.escolha2 == 0) {
                this.escolherAtaque(player);
            } else {
                this.body.setVelocityX(0);
                this.ataque1(player);
            }
        }
    }
}