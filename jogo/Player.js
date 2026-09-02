class Player extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y, texture, ataque, plataforms) {

      super(scene, x, y, texture);

      scene.add.existing(this);
      scene.physics.add.existing(this);

      this.setDisplaySize(120, 120);
      this.setCollideWorldBounds(true);

      // =========================
      // ATAQUE
      // =========================

      this.atq = scene.physics.add.sprite(400, 300, 'AnimacaoAtq');

      this.atq.body.setAllowGravity(false);
      this.atq.setScale(0.6);
      this.atq.setVisible(false);
      this.atq.setDepth(10);
      this.atq.setAngle(195);
      this.atq.setSize(400, 250);

      this.DanoContatoFoi = false;


      // =========================
      // PLATAFORMAS
      // =========================

      this.plataforms = plataforms;


      // =========================
      // PARRY
      // =========================

      this.ParryObj = scene.add.sprite(400, 300, 'EfeitoParry');

      this.ParryObj.setScale(6.5);
      this.ParryObj.setDisplaySize(1300, 1300);
      this.ParryObj.setVisible(false);
      this.ParryObj.setDepth(100);
      this.ParryObj.alpha = 0.75;


      // =========================
      // VIDA
      // =========================

      this.PodeDefesa = 0;

      this.vida = 100;

      this.DanoTomado = 0;
      this.BlinkAcumulado = 0;

      this.PodeTomarDano = true;

      this.Direcao = 1;

      this.VidaAntiga = 0;

      this.jadeudano = false;


      // =========================
      // ATAQUE POR CLIQUE
      // =========================

      this.CliqueAtaque = false;

      scene.input.on('pointerdown', (pointer) => {

          if (pointer.leftButtonDown()) {
              this.CliqueAtaque = true;
          }

      });


      // =========================
      // PROJÉTEIS
      // =========================

      this.ProjetilConfig = {

          ProjetilCooldown: 667,

          ProjetilNumero: 0,

          Projeteis: [],

          ProjetilDano: 20,

          Municao: 7

      };


      // =========================
      // ATAQUE
      // =========================

      this.AtaqueConfig = {

          AtaqueCooldown: 267,

          AtaqueDuration: 133,

          AtaqueTime: 0,

          AtaqueWait: 0,

          AtaqueAtivo: false,

          AtaqueDano: 20,

          AtaqueNumero: 0

      };


      // =========================
      // DASH
      // =========================

      this.DashConfig = {

          DashCooldown: 1500,

          DashDuration: 267,

          DashTime: 0,

          DashWait: 0,

          DashSpeed: 1300,

          DashAtivo: false,

          Savey: 0

      };


      // =========================
      // PARRY
      // =========================

      this.ParryConfig = {

          ParryCooldown: 1500,

          ParryDuration: 400,

          ParryTime: 0,

          ParryWait: 0,

          ParryAtivo: false,

          parryAgora: -1,

          ParryJaFoi: 0,

          ParryFoi: false,

          ParryNumero: 0

      };


      // =========================
      // HITBOX
      // =========================

      this.body.setSize(110, 225);
      this.body.setOffset(150, 100);

      this.play('PlayerIdle');
  }


  // =========================================================
  // MOVIMENTO
  // =========================================================

  movimento(keys, space, delta) {

      const acelX = 6000;
      const desacelX = 3600;


      if (!this.ParryConfig.ParryAtivo) {

          if (keys.A.isDown || keys.D.isDown) {

              if (
                  !this.anims.isPlaying ||
                  this.anims.currentAnim.key !== 'PlayerAndando'
              ) {
                  this.play('PlayerAndando');
              }

          } else {

              if (
                  !this.anims.isPlaying ||
                  this.anims.currentAnim.key !== 'PlayerIdle'
              ) {
                  this.play('PlayerIdle');
              }

          }
      }


      // ANDAR PARA ESQUERDA

      if (
          keys.A.isDown &&
          this.body.velocity.x > -480
      ) {

          this.body.setVelocityX(
              this.body.velocity.x -
              acelX * (delta / 1000)
          );

          this.flipX = true;
          this.atq.flipX = true;

          this.Direcao = -1;

      }


      // ANDAR PARA DIREITA

      else if (
          keys.D.isDown &&
          this.body.velocity.x < 480
      ) {

          this.body.setVelocityX(
              this.body.velocity.x +
              acelX * (delta / 1000)
          );

          this.flipX = false;
          this.atq.flipX = false;

          this.Direcao = 1;

      }


      // DESACELERAÇÃO

      else if (
          !keys.D.isDown &&
          !keys.A.isDown &&
          this.body.velocity.x != 0
      ) {

          if (this.body.velocity.x > 99) {

              this.body.setVelocityX(
                  this.body.velocity.x -
                  desacelX * (delta / 1000)
              );

          }

          if (this.body.velocity.x < -99) {

              this.body.setVelocityX(
                  this.body.velocity.x +
                  desacelX * (delta / 1000)
              );

          }

          if (
              this.body.velocity.x > -120 &&
              this.body.velocity.x < 120
          ) {

              this.body.setVelocityX(0);

          }
      }


      // PULO

      if (
          Phaser.Input.Keyboard.JustDown(space) &&
          this.body.blocked.down
      ) {

          this.body.setVelocityY(-900);

      }
  }


  // =========================================================
  // CRIAR MUNIÇÃO
  // =========================================================

  CriarMunição() {

      const projetil = this.scene.physics.add.sprite(
          this.x + (60 * this.Direcao),
          this.y,
          'Bola'
      );


      // Gastar munição

      this.ProjetilConfig.Municao -= 1;


      // Reiniciar cooldown

      this.ProjetilConfig.ProjetilCooldown = 667;


      // Configurações da bola

      projetil.setScale(0.2);

      projetil.body.setAllowGravity(false);

      projetil.setVelocityX(
          800 * this.Direcao
      );

      projetil.setFlipX(
          this.Direcao == -1
      );


      // Estados da bola

      projetil.jaAtingiu = false;

      projetil.podeSerRecolhido = false;


      // =====================================================
      // COLISÃO COM PLATAFORMAS
      // =====================================================

      this.scene.physics.add.collider(
          projetil,
          this.plataforms,

          (projetil, plataforma) => {

              // Evita processar novamente uma colisão
              // com o chão depois de já ter parado
              if (
                  plataforma === this.scene.chao &&
                  projetil.jaAtingiu
              ) {
                  return;
              }


              projetil.jaAtingiu = true;

              projetil.podeSerRecolhido = true;

              this.jadeudano = true;


              // =================================================
              // BATEU NO CHÃO
              // =================================================

              if (plataforma === this.scene.chao) {

                  // Para completamente

                  projetil.setVelocity(0, 0);

                  // Não precisa mais da gravidade

                  projetil.body.setAllowGravity(false);

              }


              // =================================================
              // BATEU EM UMA PAREDE
              // =================================================

              else {

                  // Para o movimento horizontal

                  projetil.setVelocityX(0);

                  // Liga a gravidade

                  projetil.body.setAllowGravity(true);

              }

          }
      );


      // Adiciona à lista

      this.ProjetilConfig.Projeteis.push(projetil);
  }


  // =========================================================
  // ATAQUE COM PROJÉTIL
  // =========================================================

  ataqueprojetil(keys, boss, delta) {


      // Percorre de trás para frente

      for (
          let i = this.ProjetilConfig.Projeteis.length - 1;
          i >= 0;
          i--
      ) {

          const projetil =
              this.ProjetilConfig.Projeteis[i];


          // =================================================
          // PROJÉTIL DESTRUÍDO
          // =================================================

          if (
              !projetil ||
              !projetil.active
          ) {

              this.ProjetilConfig.Projeteis.splice(i, 1);

              continue;
          }


          // =================================================
          // RECOLHER PROJÉTIL
          // =================================================

          if (
              projetil.podeSerRecolhido &&
              this.scene.physics.overlap(
                  this,
                  projetil
              )
          ) {

              // Devolve a munição

              this.ProjetilConfig.Municao += 1;


              // Destrói a bola

              projetil.destroy();


              // Remove da lista

              this.ProjetilConfig.Projeteis.splice(i, 1);

              continue;
          }


          // =================================================
          // JÁ ATINGIU ALGUMA COISA
          // =================================================

          if (projetil.jaAtingiu) {
              continue;
          }


          // =================================================
          // ACERTOU O BOSS
          // =================================================

          if (
              this.scene.physics.overlap(
                  projetil,
                  boss
              )
          ) {

              boss.vida -=
                  this.ProjetilConfig.ProjetilDano;


              this.jadeudano = true;


              projetil.jaAtingiu = true;

              projetil.podeSerRecolhido = true;


              // Para de andar para os lados

              projetil.setVelocityX(0);


              // Começa a cair

              projetil.body.setAllowGravity(true);


              continue;
          }

      }


      // =====================================================
      // COOLDOWN
      // =====================================================

      if (
          this.ProjetilConfig.ProjetilCooldown > 0
      ) {

          this.ProjetilConfig.ProjetilCooldown -= delta;


          if (
              this.ProjetilConfig.ProjetilCooldown < 0
          ) {

              this.ProjetilConfig.ProjetilCooldown = 0;

          }
      }


      // =====================================================
      // DISPARAR
      // =====================================================

      if (
          keys.Q.isDown &&
          this.ProjetilConfig.ProjetilCooldown <= 0 &&
          this.ProjetilConfig.Municao > 0
      ) {

          this.CriarMunição();

      }
  }


  // =========================================================
  // ATAQUE NORMAL
  // =========================================================

  ataque(mouse, delta) {

      if (
          this.CliqueAtaque &&
          this.AtaqueConfig.AtaqueWait <= 0
      ) {

          this.AtaqueConfig.AtaqueTime =
              this.AtaqueConfig.AtaqueDuration;

          this.AtaqueConfig.AtaqueWait =
              this.AtaqueConfig.AtaqueCooldown;

          this.atq.play(
              'AnimacaoAtq',
              true
          );
      }


      this.CliqueAtaque = false;


      if (
          this.AtaqueConfig.AtaqueTime > 0
      ) {

          this.atq.setVisible(true);

          this.AtaqueConfig.AtaqueTime -= delta;

          this.AtaqueConfig.AtaqueAtivo = true;
      }


      if (
          this.AtaqueConfig.AtaqueTime <= 0 &&
          this.AtaqueConfig.AtaqueAtivo
      ) {

          this.AtaqueConfig.AtaqueTime = 0;

          this.atq.setVisible(false);

          this.jadeudano = false;

          this.AtaqueConfig.AtaqueAtivo = false;
      }


      if (
          this.AtaqueConfig.AtaqueTime <= 0
      ) {

          this.AtaqueConfig.AtaqueWait -= delta;

      }


      if (
          this.AtaqueConfig.AtaqueWait <= 0
      ) {

          this.AtaqueConfig.AtaqueWait = 0;

      }
  }


  // =========================================================
  // DASH
  // =========================================================

  Dash(keys, delta) {

      if (
          keys.SHIFT.isDown &&
          this.DashConfig.DashWait <= 0
      ) {

          this.body.setAllowGravity(false);

          this.DashConfig.DashTime =
              this.DashConfig.DashDuration;

          this.DashConfig.DashWait =
              this.DashConfig.DashCooldown;

          this.DashConfig.Savey = this.y;
      }


      if (
          this.DashConfig.DashTime > 0
      ) {

          this.setVelocityX(
              this.DashConfig.DashSpeed *
              this.Direcao
          );

          this.setVelocityY(0);

          this.DashConfig.DashTime -= delta;

          this.DashConfig.DashAtivo = true;

          this.y = this.DashConfig.Savey;
      }


      if (
          this.DashConfig.DashTime <= 0 &&
          this.DashConfig.DashAtivo
      ) {

          this.DashConfig.DashTime = 0;

          this.setVelocityX(0);

          this.body.setAllowGravity(true);

          this.DashConfig.DashAtivo = false;
      }


      if (
          this.DashConfig.DashTime <= 0
      ) {

          this.DashConfig.DashWait -= delta;

      }


      if (
          this.DashConfig.DashWait <= 0
      ) {

          this.DashConfig.DashWait = 0;

      }
  }


  // =========================================================
  // PARRY
  // =========================================================

  Parry(keys, boss, mouse, delta) {

      if (
          this.ParryConfig.parryAgora == 0
      ) {

          this.ParryConfig.parryAgora = -1;

      }


      if (
          (keys.F.isDown || mouse.rightButtonDown()) &&
          this.ParryConfig.ParryWait <= 0
      ) {

          this.play('PlayerParry');

          this.ParryConfig.ParryTime =
              this.ParryConfig.ParryDuration;

          this.ParryConfig.ParryWait =
              this.ParryConfig.ParryCooldown;

          this.ParryConfig.ParryJaFoi = 0;

          this.ParryConfig.parryAgora = 1;
      }


      if (
          this.ParryConfig.ParryTime > 0
      ) {

          this.ParryConfig.ParryAtivo = true;

          this.ParryConfig.ParryTime -= delta;
      }


      if (
          this.ParryConfig.ParryTime <= 0 &&
          this.ParryConfig.ParryAtivo == true
      ) {

          this.ParryConfig.ParryTime = 0;

          this.ParryConfig.ParryAtivo = false;

          this.ParryConfig.parryAgora = 0;

          this.DashConfig.DashWait =
              this.DashConfig.DashCooldown;

          this.ParryConfig.ParryFoi = false;

          this.play('PlayerIdle');
      }


      if (
          this.ParryConfig.ParryAtivo == true &&
          boss.EstaAtacando == true &&
          Math.abs(boss.x - this.x) <= 400 &&
          (
              (this.Direcao == 1 && this.x < boss.x) ||
              (this.Direcao == -1 && this.x > boss.x)
          )
      ) {

          if (
              this.ParryConfig.ParryJaFoi == 0
          ) {

              this.ParryConfig.ParryJaFoi = 1;

              this.ParryConfig.ParryFoi = true;
          }
      }


      if (
          this.ParryConfig.ParryWait > 0
      ) {

          this.ParryConfig.ParryWait -= delta;

          if (
              this.ParryConfig.ParryWait < 0
          ) {

              this.ParryConfig.ParryWait = 0;

          }
      }
  }


  // =========================================================
  // TOMOU DANO
  // =========================================================

  TomouDano(boss, delta) {

      if (
          this.DanoTomado <= 0
      ) {

          this.PodeTomarDano = true;

      }


      if (
          this.DanoTomado > 0
      ) {

          this.DanoTomado -= delta;

          this.PodeTomarDano = false;


          this.BlinkAcumulado += delta;


          if (
              this.BlinkAcumulado >= 100
          ) {

              this.BlinkAcumulado -= 100;

              this.alpha =
                  (this.alpha === 1)
                  ? 0.3
                  : 1;
          }

      } else {

          this.DanoTomado = 0;

          this.BlinkAcumulado = 0;

          this.alpha = 1;
      }


      if (
          this.VidaAntiga > this.vida
      ) {

          this.DanoTomado = 1500;

      }
  }


  // =========================================================
  // POSIÇÃO DOS ATAQUES
  // =========================================================

  PosAtaque() {

      this.atq.y =
          this.y - 30;

      this.atq.x =
          this.x + 140 * this.Direcao;


      this.ParryObj.x =
          this.x + 80 * this.Direcao;

      this.ParryObj.y =
          this.y;
  }


  // =========================================================
  // PEGAR X
  // =========================================================

  GetX() {

      return this.x;

  }


  // =========================================================
  // PEGAR Y
  // =========================================================

  GetY() {

      return this.y;

  }


  // =========================================================
  // MORRER
  // =========================================================

  morrer() {

      if (
          this.vida <= 0
      ) {

          console.log('Morreu');

          this.scene.scene.start('Dead');

      }
  }


  // =========================================================
  // DAR DANO
  // =========================================================

  DarDano(boss) {

      if (
          this.scene.physics.overlap(
              this.atq,
              boss
          ) &&
          this.atq.visible == true &&
          this.jadeudano == false
      ) {

          boss.vida -=
              this.AtaqueConfig.AtaqueDano;

          this.AtaqueConfig.AtaqueNumero += 1;

          this.jadeudano = true;
      }
  }


  // =========================================================
  // DANO DE CONTATO
  // =========================================================

  DanoDeContato(boss) {

      if (
          this.scene.physics.overlap(
              this,
              boss
          ) &&
          this.PodeTomarDano == true &&
          boss.investidaAtiva == false &&
          this.DanoContatoFoi == false
      ) {

          this.DanoContatoFoi = true;

          this.vida -= 10;


          if (this.x < boss.x) {

              this.body.setVelocityX(500);

          } else {

              this.body.setVelocityX(-500);

          }


          this.body.setVelocityY(-200);


          this.scene.time.delayedCall(
              400,
              () => {

                  this.DanoContatoFoi = false;

              }
          );
      }
  }


  // =========================================================
  // UPDATE
  // =========================================================

  update(
      keys,
      space,
      mouse,
      boss,
      delta
  ) {

      this.ataqueprojetil(
          keys,
          boss,
          delta
      );

      this.movimento(
          keys,
          space,
          delta
      );

      this.ataque(
          mouse,
          delta
      );

      this.Dash(
          keys,
          delta
      );

      this.Parry(
          keys,
          boss,
          mouse,
          delta
      );

      this.PosAtaque();

      this.DanoDeContato(
          boss
      );

      this.DarDano(
          boss
      );

      this.TomouDano(
          boss,
          delta
      );

      this.morrer();


      this.VidaAntiga =
          this.vida;
  }
}