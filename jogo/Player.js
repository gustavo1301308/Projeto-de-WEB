class Player extends Phaser.Physics.Arcade.Sprite{

    constructor(scene, x, y, texture, ataque){

        super(scene, x , y , texture);

      scene.add.existing(this);
      scene.physics.add.existing(this);
      this.setDisplaySize(120, 120);
      this.setCollideWorldBounds(true);
      this.atq = scene.physics.add.sprite(400, 300, 'AnimacaoAtq');

      this.atq.body.setAllowGravity(false);
      this.atq.setScale(0.6);
      this.atq.setVisible(false);
      this.atq.setDepth(10);
      this.atq.setAngle(195);
      this.atq.setSize(400,250);
      this.DanoContatoFoi = false;

      this.ParryObj = scene.add.sprite(400,300,'EfeitoParry');
      this.ParryObj.setScale(6.5);
      this.ParryObj.setDisplaySize(1300, 1300);
      this.ParryObj.setVisible(false);        
      this.ParryObj.setDepth(100);

      this.ParryObj.alpha = 0.75;
      this.PodeDefesa = 0;
      this.vida = 100;
      this.DanoTomado = false;
      this.PodeTomarDano = true;
      this.Direcao = 1;
      this.VidaAntiga = 0;
      this.jadeudano = false;
      this.ProjetilCooldown = 0;
      this.ProjetilNumero = 0;

      this.CliqueAtaque = false; // flag setada pelo evento, consumida no update

    scene.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
          this.CliqueAtaque = true; // marca que houve um clique novo
      }});

      this.AtaqueConfig = {
      AtaqueCooldown: 5,
      AtaqueDuration: 8,
      AtaqueTime: 0,
      AtaqueWait: 0,
      AtaqueAtivo: false,
      AtaqueDano: 20,
      AtaqueNumero: 0

      }

      this.DashConfig = {
      DashCooldown: 90,
      DashDuration: 16,
      DashTime: 0,
      DashWait: 0,
      DashSpeed: 1300,
      DashAtivo: false,
      Savey: 0
      }

      this.ParryConfig = {
      ParryCooldown: 90,
      ParryDuration: 24,
      ParryTime: 0,
      ParryWait: 0,
      ParryAtivo: false,                        
      parryAgora: -1,
      ParryJaFoi: 0,
      ParryFoi: false,
      ParryNumero: 0
      }

      this.body.setSize(110, 225);
      this.body.setOffset(150, 100);
      this.play('PlayerIdle');

  }  

  movimento(keys, space) {
    if (!this.ParryConfig.ParryAtivo) {
        if (keys.A.isDown || keys.D.isDown) {
            if (!this.anims.isPlaying ||
                this.anims.currentAnim.key !== 'PlayerAndando') {
                this.play('PlayerAndando');
            }
        } else {
            if (!this.anims.isPlaying ||
                this.anims.currentAnim.key !== 'PlayerIdle') {
                this.play('PlayerIdle');
            }
        }
    }
  if(keys.A.isDown && this.body.velocity.x > -480)
  {
    this.body.setVelocityX(this.body.velocity.x - 100);
    this.flipX = true;
    this.atq.flipX = true;  
    this.Direcao = -1;
  }
  else if(keys.D.isDown && this.body.velocity.x < 480)
  {
    this.body.setVelocityX(this.body.velocity.x + 100);
    this.flipX = false;
    this.atq.flipX = false;  
        this.Direcao = 1;
  }
  else if(!keys.D.isDown && !keys.A.isDown && this.body.velocity.x != 0)
    {
      if(this.body.velocity.x > 99)
      {
        this.body.setVelocityX(this.body.velocity.x - 60);
      }
      if(this.body.velocity.x < -99)  
      {
        this.body.setVelocityX(this.body.velocity.x + 60);
      }
      if(this.body.velocity.x > -120 && this.body.velocity.x < 120)
      {
        this.body.setVelocityX(0);
        /*
        if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'PlayerIdle')
            {
            this.play('PlayerIdle');
        }
            */
      }
    }
    if(Phaser.Input.Keyboard.JustDown(space) && this.body.blocked.down)
  {
    this.body.setVelocityY(-900);
  }
  }

ataqueprojetil(keys, boss) {

    if (this.ProjetilCooldown > 0) {
        this.ProjetilCooldown--;
    }

    if (keys.Q.isDown && this.ProjetilCooldown <= 0 && this.ProjetilNumero < 10) {

        let projetil = this.scene.physics.add.sprite(
            this.x + (60 * this.Direcao),
            this.y,
            'Bola',
      
        );
              projetil.setScale(0.2)

        projetil.body.setAllowGravity(false);

        projetil.setVelocityX(800 * this.Direcao);

        projetil.setFlipX(this.Direcao == -1);

        projetil.setCollideWorldBounds(false);

        this.ProjetilCooldown = 120;

        this.ProjetilNumero++;

        projetil.dano = 20;

        this.scene.physics.add.overlap(projetil, boss, () => {

            boss.vida -= projetil.dano;

            projetil.destroy();

        });

        this.scene.physics.world.on('worldstep', () => {

            if (
                projetil.active &&
                (
                    projetil.x < 0 ||
                    projetil.x > this.scene.physics.world.bounds.width
                )
            ) {
                projetil.destroy();
            }

        });
    }
}
ataque(mouse)
{
    if(this.CliqueAtaque && this.AtaqueConfig.AtaqueWait == 0)
    {
      this.AtaqueConfig.AtaqueTime = this.AtaqueConfig.AtaqueDuration;
      this.AtaqueConfig.AtaqueWait = this.AtaqueConfig.AtaqueCooldown;
      this.atq.play('AnimacaoAtq', true);
    }
    this.CliqueAtaque = false;

    if(this.AtaqueConfig.AtaqueTime > 0){
      this.atq.setVisible(true);
      this.AtaqueConfig.AtaqueTime -= 1;
      this.AtaqueConfig.AtaqueAtivo = true;
    }

    if(this.AtaqueConfig.AtaqueTime == 0 && this.AtaqueConfig.AtaqueAtivo)
      {
      this.atq.setVisible(false);
      this.jadeudano = false;
      this.AtaqueConfig.AtaqueAtivo = false;
    }

    if(this.AtaqueConfig.AtaqueTime == 0){
    this.AtaqueConfig.AtaqueWait -=1;
}

  if(this.AtaqueConfig.AtaqueWait <= 0)
  {
    this.AtaqueConfig.AtaqueWait = 0;
  }
}








    Dash(keys)
{
if(keys.SHIFT.isDown && this.DashConfig.DashWait == 0)
{
  this.body.setAllowGravity(false);
  this.DashConfig.DashTime = this.DashConfig.DashDuration;
  this.DashConfig.DashWait = this.DashConfig.DashCooldown;
  this.DashConfig.Savey = this.y;
}

if(this.DashConfig.DashTime > 0){
  this.setVelocityX(this.DashConfig.DashSpeed * this.Direcao);
  this.setVelocityY(0);
  this.DashConfig.DashTime -= 1;
  this.DashConfig.DashAtivo = true;
  this.y = this.DashConfig.Savey;
}

if(this.DashConfig.DashTime == 0 && this.DashConfig.DashAtivo)
  {
  this.setVelocityX(0);
  this.body.setAllowGravity(true);
  this.DashConfig.DashAtivo = false;
}

if(this.DashConfig.DashTime == 0){
    this.DashConfig.DashWait -=1;
}

  if(this.DashConfig.DashWait <= 0)
  {
    this.DashConfig.DashWait = 0;
  }
}




Parry(keys, boss, mouse) {

    if (this.ParryConfig.parryAgora == 0) {

        this.ParryConfig.parryAgora = -1;

    }

    if ((keys.F.isDown || mouse.rightButtonDown()) && this.ParryConfig.ParryWait == 0) {

        this.play('PlayerParry');


        this.ParryConfig.ParryTime = this.ParryConfig.ParryDuration;

        this.ParryConfig.ParryWait = this.ParryConfig.ParryCooldown;

        this.ParryConfig.ParryJaFoi = 0;

        this.ParryConfig.parryAgora = 1;

    }

    if (this.ParryConfig.ParryTime > 0) {

        this.ParryConfig.ParryAtivo = true;

        this.ParryConfig.ParryTime -= 1;

    }


    if (this.ParryConfig.ParryTime == 0 && this.ParryConfig.ParryAtivo == true) {

        this.ParryConfig.ParryAtivo = false;

        this.ParryConfig.parryAgora = 0;
        this.DashConfig.DashWait = this.DashConfig.DashCooldown;
        this.ParryConfig.ParryFoi = false;
        this.play('PlayerIdle');
 

    }

    if(this.ParryConfig.ParryAtivo == true && boss.EstaAtacando == true && Math.abs(boss.x - this.x) <= 400

    && ((this.Direcao == 1 && this.x < boss.x) || (this.Direcao == -1 && this.x > boss.x)) /*&&

    (boss.atq.visible == true)*/)

    {

      //this.ParryAcertou(boss);

        if(this.ParryConfig.ParryJaFoi == 0)

        {

        this.ParryConfig.ParryJaFoi = 1;

        this.ParryConfig.ParryFoi = true;

        }

    }

    if (this.ParryConfig.ParryWait > 0) {

        this.ParryConfig.ParryWait -= 1;

    }

}

    TomouDano(boss) {
    if (this.DanoTomado == 0) {
        this.PodeTomarDano = true;
    }
    if (this.DanoTomado > 0) {
        this.DanoTomado -= 1;
        this.PodeTomarDano = false;

        // só troca o alpha a cada 6 frames (~10x por segundo)
        if (this.DanoTomado % 6 == 0) {
            this.alpha = (this.alpha === 1) ? 0.3 : 1;
        }
    } else {
        this.alpha = 1; // garante que volta ao normal fora da invencibilidade
    }

    if (this.VidaAntiga > this.vida) {
        this.DanoTomado = 90; // 200 frames de invencibilidade é bem longo (~3.3s a 60fps); considere reduzir
    }

}

  PosAtaque(){
  this.atq.y = this.y - 30;
  this.atq.x = this.x + 140 * this.Direcao;
  this.ParryObj.x = this.x + 80 * this.Direcao;
  this.ParryObj.y = this.y;
  }

  GetX(){
    return player.x;
  }

  GetY(){
    return player.y;
  }

 morrer(){
    if(this.vida <= 0){
        console.log('Morreu');     
         this.scene.scene.start('Dead');
      }
  }
      DarDano(boss) 
      {
      if (this.scene.physics.overlap(player.atq, boss) && (this.atq.visible) == true && this.jadeudano == false) {
          boss.vida -= this.AtaqueConfig.AtaqueDano;
          this.AtaqueConfig.AtaqueNumero += 1;
          this.jadeudano = true;
      }
      }

      DanoDeContato(boss)
      {
        if (this.scene.physics.overlap(this, boss) && this.PodeTomarDano == true && 
        boss.investidaAtiva == false && this.DanoContatoFoi == false)
        {
          this.DanoContatoFoi = true;
          this.vida -= 10;

          
        if (this.x < boss.x) {
        this.body.setVelocityX(500);
        } else {
          this.body.setVelocityX(-500);
        }
        this.body.setVelocityY(-200);
        
        this.scene.time.delayedCall(400, () => {

        this.DanoContatoFoi = false;
      });
        }



      }

  update(keys,space,mouse,boss, delta)

  {
  this.ataqueprojetil(keys, boss)
  this.movimento(keys, space);
  this.ataque(mouse);
  this.Dash(keys);
  this.Parry(keys, boss, mouse);
  this.PosAtaque();
  this.DanoDeContato(boss);
  this.DarDano(boss);
  this.TomouDano(boss);
  this.morrer();

  this.VidaAntiga = this.vida;
  }

  }