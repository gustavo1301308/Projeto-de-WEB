class Player extends Phaser.Physics.Arcade.Sprite{

    constructor(scene, x, y, texture, ataque, plataforms){

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

      this.plataforms = plataforms;

      this.ParryObj = scene.add.sprite(400,300,'EfeitoParry');
      this.ParryObj.setScale(6.5);
      this.ParryObj.setDisplaySize(1300, 1300);
      this.ParryObj.setVisible(false);        
      this.ParryObj.setDepth(100);

      this.ParryObj.alpha = 0.75;
      this.PodeDefesa = 0;
      this.vida = 100;
      this.DanoTomado = 0; // agora em ms (era contagem de frames)
      this.BlinkAcumulado = 0; // acumulador (ms) para o piscar de invencibilidade
      this.PodeTomarDano = true;
      this.Direcao = 1;
      this.VidaAntiga = 0;
      this.jadeudano = false;

      this.CliqueAtaque = false; // flag setada pelo evento, consumida no update

    scene.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
          this.CliqueAtaque = true; // marca que houve um clique novo
      }});

      this.ProjetilConfig = {
      ProjetilCooldown: 667, // ms (equivalente a 40 frames a 60fps)
      ProjetilNumero: 0,
      Projeteis: [],
      ProjetilDano: 20,
      Municao: 7

      }

      this.AtaqueConfig = {
      AtaqueCooldown: 267, // ms (equivalente a 16 frames a 60fps)
      AtaqueDuration: 133, // ms (equivalente a 8 frames a 60fps)
      AtaqueTime: 0,
      AtaqueWait: 0,
      AtaqueAtivo: false,
      AtaqueDano: 20,
      AtaqueNumero: 0

      }

      this.DashConfig = {
      DashCooldown: 1500, // ms (equivalente a 90 frames a 60fps)
      DashDuration: 267, // ms (equivalente a 16 frames a 60fps)
      DashTime: 0,
      DashWait: 0,
      DashSpeed: 1300,
      DashAtivo: false,
      Savey: 0
      }

      this.ParryConfig = {
      ParryCooldown: 1500, // ms (equivalente a 90 frames a 60fps)
      ParryDuration: 400, // ms (equivalente a 24 frames a 60fps)
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

  movimento(keys, space, delta) {
    const acelX = 6000; // px/s² (equivalente a +100/frame a 60fps)
    const desacelX = 3600; // px/s² (equivalente a -60/frame a 60fps)

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
    this.body.setVelocityX(this.body.velocity.x - acelX * (delta / 1000));
    this.flipX = true;
    this.atq.flipX = true;  
    this.Direcao = -1;
  }
  else if(keys.D.isDown && this.body.velocity.x < 480)
  {
    this.body.setVelocityX(this.body.velocity.x + acelX * (delta / 1000));
    this.flipX = false;
    this.atq.flipX = false;  
        this.Direcao = 1;
  }
  else if(!keys.D.isDown && !keys.A.isDown && this.body.velocity.x != 0)
    {
      if(this.body.velocity.x > 99)
      {
        this.body.setVelocityX(this.body.velocity.x - desacelX * (delta / 1000));
      }
      if(this.body.velocity.x < -99)  
      {
        this.body.setVelocityX(this.body.velocity.x + desacelX * (delta / 1000));
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

      CriarMunição()
{
    const projetil = this.scene.physics.add.sprite(
        this.x + (60 * this.Direcao),
        this.y,
        'Bola'
    );
    this.ProjetilConfig.Municao -= 1;
    this.ProjetilConfig.ProjetilCooldown = 667; // ms (equivalente a 40 frames a 60fps) — reseta o cooldown
    projetil.setScale(0.2);
    projetil.body.setAllowGravity(false);
    projetil.setVelocityX(800 * this.Direcao);
    projetil.setFlipX(this.Direcao == -1);
    projetil.jaAtingiu = false; // controla se já bateu em algo e parou de dar dano
    projetil.podeSerRecolhido = false; // só pode ser pego pelo player depois de já ter parado

    this.ProjetilConfig.Projeteis.push(projetil);
}

ataqueprojetil(keys, boss, delta) {

    // Percorre de trás para frente para poder remover elementos
    for (let i = this.ProjetilConfig.Projeteis.length - 1; i >= 0; i--) {

        const projetil = this.ProjetilConfig.Projeteis[i];

        // Remove referências a projéteis que já foram destruídos
        if (!projetil || !projetil.active) {
            this.ProjetilConfig.Projeteis.splice(i, 1);
            continue;
        }

        // Se o player encostar num projétil que já parou (no chão ou no boss), recolhe e devolve munição
        if (projetil.podeSerRecolhido && this.scene.physics.overlap(this, projetil)) {
            this.ProjetilConfig.Municao += 1;
            projetil.destroy();
            this.ProjetilConfig.Projeteis.splice(i, 1);
            continue;
        }

        // Já bateu em algo antes: não dá mais dano, só espera ser recolhido
        if (projetil.jaAtingiu) {
            continue;
        }

        // Acertou o Boss
        if (this.scene.physics.overlap(projetil, boss)) {

            boss.vida -= this.ProjetilConfig.ProjetilDano;

            this.jadeudano = true;

            projetil.jaAtingiu = true;
            projetil.podeSerRecolhido = true;
            projetil.setVelocityX(0);
            projetil.body.setAllowGravity(true);

            continue;
        }

        // Acertou uma plataforma (parede ou chão)
        if (this.scene.physics.overlap(projetil, this.plataforms)) {

            this.jadeudano = true;

            projetil.jaAtingiu = true;
            projetil.podeSerRecolhido = true;
            projetil.setVelocityX(0);
            projetil.body.setAllowGravity(true);
        }
    }
    
    if (this.ProjetilConfig.ProjetilCooldown > 0) {
        this.ProjetilConfig.ProjetilCooldown -= delta;
        if (this.ProjetilConfig.ProjetilCooldown < 0) this.ProjetilConfig.ProjetilCooldown = 0;
    }

    if (
        keys.Q.isDown &&
        this.ProjetilConfig.ProjetilCooldown <= 0 &&
        this.ProjetilConfig.Municao > 0
    ) {
        this.CriarMunição();
    }
}
ataque(mouse, delta)
{
    if(this.CliqueAtaque && this.AtaqueConfig.AtaqueWait <= 0)
    {
      this.AtaqueConfig.AtaqueTime = this.AtaqueConfig.AtaqueDuration;
      this.AtaqueConfig.AtaqueWait = this.AtaqueConfig.AtaqueCooldown;
      this.atq.play('AnimacaoAtq', true);
    }
    this.CliqueAtaque = false;

    if(this.AtaqueConfig.AtaqueTime > 0){
      this.atq.setVisible(true);
      this.AtaqueConfig.AtaqueTime -= delta;
      this.AtaqueConfig.AtaqueAtivo = true;
    }

    if(this.AtaqueConfig.AtaqueTime <= 0 && this.AtaqueConfig.AtaqueAtivo)
      {
      this.AtaqueConfig.AtaqueTime = 0;
      this.atq.setVisible(false);
      this.jadeudano = false;
      this.AtaqueConfig.AtaqueAtivo = false;
    }

    if(this.AtaqueConfig.AtaqueTime <= 0){
    this.AtaqueConfig.AtaqueWait -= delta;
}

  if(this.AtaqueConfig.AtaqueWait <= 0)
  {
    this.AtaqueConfig.AtaqueWait = 0;
  }
}








    Dash(keys, delta)
{
if(keys.SHIFT.isDown && this.DashConfig.DashWait <= 0)
{
  this.body.setAllowGravity(false);
  this.DashConfig.DashTime = this.DashConfig.DashDuration;
  this.DashConfig.DashWait = this.DashConfig.DashCooldown;
  this.DashConfig.Savey = this.y;
}

if(this.DashConfig.DashTime > 0){
  this.setVelocityX(this.DashConfig.DashSpeed * this.Direcao);
  this.setVelocityY(0);
  this.DashConfig.DashTime -= delta;
  this.DashConfig.DashAtivo = true;
  this.y = this.DashConfig.Savey;
}

if(this.DashConfig.DashTime <= 0 && this.DashConfig.DashAtivo)
  {
  this.DashConfig.DashTime = 0;
  this.setVelocityX(0);
  this.body.setAllowGravity(true);
  this.DashConfig.DashAtivo = false;
}

if(this.DashConfig.DashTime <= 0){
    this.DashConfig.DashWait -= delta;
}

  if(this.DashConfig.DashWait <= 0)
  {
    this.DashConfig.DashWait = 0;
  }
}




Parry(keys, boss, mouse, delta) {
    if (this.ParryConfig.parryAgora == 0) {
        this.ParryConfig.parryAgora = -1;
    }
    if ((keys.F.isDown || mouse.rightButtonDown()) && this.ParryConfig.ParryWait <= 0) {
        this.play('PlayerParry');
        this.ParryConfig.ParryTime = this.ParryConfig.ParryDuration;
        this.ParryConfig.ParryWait = this.ParryConfig.ParryCooldown;
        this.ParryConfig.ParryJaFoi = 0;
        this.ParryConfig.parryAgora = 1;
    }
    if (this.ParryConfig.ParryTime > 0) {
        this.ParryConfig.ParryAtivo = true;
        this.ParryConfig.ParryTime -= delta;
    }


    if (this.ParryConfig.ParryTime <= 0 && this.ParryConfig.ParryAtivo == true) {

        this.ParryConfig.ParryTime = 0;
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

        this.ParryConfig.ParryWait -= delta;
        if (this.ParryConfig.ParryWait < 0) this.ParryConfig.ParryWait = 0;

    }

}

    TomouDano(boss, delta) {
    if (this.DanoTomado <= 0) {
        this.PodeTomarDano = true;
    }
    if (this.DanoTomado > 0) {
        this.DanoTomado -= delta;
        this.PodeTomarDano = false;

        // troca o alpha a cada 100ms (~10x por segundo — equivalente aos 6 frames a 60fps originais)
        this.BlinkAcumulado += delta;
        if (this.BlinkAcumulado >= 100) {
            this.BlinkAcumulado -= 100;
            this.alpha = (this.alpha === 1) ? 0.3 : 1;
        }
    } else {
        this.DanoTomado = 0;
        this.BlinkAcumulado = 0;
        this.alpha = 1; // garante que volta ao normal fora da invencibilidade
    }

    if (this.VidaAntiga > this.vida) {
        this.DanoTomado = 1500; // ms (equivalente a 90 frames a 60fps)
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
    console.log("ffff");
  this.ataqueprojetil(keys, boss, delta)
  this.movimento(keys, space, delta);
  this.ataque(mouse, delta);
  this.Dash(keys, delta);
  this.Parry(keys, boss, mouse, delta);
  this.PosAtaque();
  this.DanoDeContato(boss);
  this.DarDano(boss);
  this.TomouDano(boss, delta);
  this.morrer();

  this.VidaAntiga = this.vida;
  }

  }