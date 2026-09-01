class Player extends Phaser.Physics.Arcade.Sprite{

    constructor(scene, x, y, texture, ataque){

        super(scene, x , y , texture);

    scene.add.existing(this);

    scene.physics.add.existing(this);

    this.setDisplaySize(120, 120);

    this.setCollideWorldBounds(true);

this.atq = scene.add.sprite(400, 300, 'AnimacaoAtq');

this.atq.setScale(0.6);

this.atq.setVisible(false);

this.atq.setDepth(10);

this.atq.setAngle(195);

    this.ParryObj = scene.add.sprite(400,300,'EfeitoParry');

    this.ParryObj.setScale(6.5);

    this.ParryObj.setDisplaySize(1300, 1300);

    this.ParryObj.setVisible(false);        

    this.ParryObj.setDepth(100);

    this.ParryObj.alpha = 0.75;

    this.pisca = 0;

    this.PodeAtq = 0;

    this.PodeDefesa = 0;

    this.vida = 1000;

    this.DanoTomado = false;

    this.PodeTomarDano = true;

    this.Direcao = 1;

    this.VidaAntiga = 0;

    this.DashConfig = {

    DashCooldown: 60,

    DashDuration: 16,

    DashTime: 0,

    DashWait: 0,

    DashSpeed: 1300,

    DashAtivo: false,

    Savey: 0

      }

    this.ParryConfig = {

  ParryCooldown: 80,

  ParryDuration: 16,

  ParryTime: 0,

  ParryWait: 0,

  ParryAtivo: false,                        

  parryAgora: -1,

  ParryJaFoi: 0,

  ParryFoi: false

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

    this.body.setVelocityY(-800);

  }

    /*

    if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'PlayerAndando') {

    this.play('PlayerAndando');

    }  

    */

  }

  ataque(keys, mouse)

  {

    if(mouse.leftButtonDown() && this.PodeAtq <= 0)

    {

      this.PodeAtq = 5.2;

    }

    if(this.PodeAtq > 4 && this.PodeAtq < 5.2)

    {

      this.PodeAtq -= 0.1;

      this.atq.setVisible(true);

      this.atq.play('AnimacaoAtq',true);

    }

    else if(this.PodeAtq > 0)

    {

      this.PodeAtq -= 0.4;

      this.atq.setVisible(false);

    }}

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

  console.log('Zerou');

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

    // 0 só dura um frame

    if (this.ParryConfig.parryAgora == 0) {

        this.ParryConfig.parryAgora = -1;

    }

    if ((keys.F.isDown || mouse.rightButtonDown()) && this.ParryConfig.ParryWait == 0) {

        this.play('PlayerParry');

        //this.ParryObj.play('EfeitoParry');

        //this.ParryObj.setVisible(true);

        this.ParryConfig.ParryTime = this.ParryConfig.ParryDuration;

        this.ParryConfig.ParryWait = this.ParryConfig.ParryCooldown;

        this.ParryConfig.ParryJaFoi = 0;

        this.ParryConfig.parryAgora = 1;

    }

    if (this.ParryConfig.ParryTime > 0) {

        this.ParryConfig.ParryAtivo = true;

        this.ParryConfig.ParryTime -= 1;

    }

    // O Parry acabou neste frame

    if (this.ParryConfig.ParryTime == 0 && this.ParryConfig.ParryAtivo == true) {

        this.ParryConfig.ParryAtivo = false;

        this.ParryConfig.parryAgora = 0;
        this.DashConfig.DashWait = this.DashConfig.DashCooldown;
        this.play('PlayerIdle');

        //this.ParryObj.setVisible(false);        

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

    TomouDano(boss)

    {

        if(this.DanoTomado == 0)

        {

          this.PodeTomarDano = true;

        }

        if(this.DanoTomado > 0)

        {

          this.DanoTomado -= 1;

          this.PodeTomarDano = false;

          if(this.pisca == 0)

        {

          this.pisca = 1;

          this.alpha = 0.75;

        } else

        {

          this.pisca = 0;

          this.alpha = 1;

        }

        if(this.VidaAntiga > this.vida || this.DanoTomado == 0)

        {

        this.DanoTomado = 30;

        }

      }

    }

  PosAtaque(){

  this.atq.y = this.y;

  this.atq.x = this.x + 80 * this.Direcao;

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
  update(keys,space,mouse,boss)

  {

  this.movimento(keys, space);

  this.ataque(keys, mouse);

  this.Dash(keys);

  this.Parry(keys, boss, mouse);

  this.PosAtaque();

  this.TomouDano(boss);
  this.morrer();

  this.VidaAntiga = this.vida;

  }

  }