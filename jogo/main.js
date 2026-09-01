const config ={
    type: Phaser.AUTO,
    width: innerWidth,
    height: innerHeight,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: {y: 650},
        debug: true
      }
    },
  
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
  },
  
    scene: [
    
    InicioScene,

    {
        key: "Jogo",
        preload: preload,
        create: create,
        update: update
    },DeadScene

    
]
};

  let plataforms;
  let player;
  let space;
  let mouse;
  let keys;
  let atq;
  let boss;
  let TextoVida;
  
  const game = new Phaser.Game(config);
  
  function preload() {
    this.load.image('fundo','assets/fundo3.png');
    this.load.image('player','assets/player1.png');
    this.load.image('ataque','assets/ataque1.png');
    this.load.image('chao','assets/chao.png');
    this.load.image('boss','assets/boss.png');
    this.load.image('Lanca','assets/Lanca.png');
    this.load.image('Bola','assets/AtaqueBola.png');

    LoadAnima('assets/EfeitoParry.png', 'EfeitoParry',64,64,this);
    LoadAnima('assets/PlayerParry.png', 'PlayerParry', 400,400, this);
    LoadAnima('assets/PlayerIdle.png', 'PlayerIdle', 400, 400, this);
    LoadAnima('assets/BossAndando.png', 'BossAndando', 640, 640, this);
    LoadAnima('assets/AnimacaoAtq.png', 'AnimacaoAtq', 1024, 784, this);
    LoadAnima('assets/BossAtacando.png', 'BossAtacando', 640, 640, this);
    LoadAnima('assets/PlayerAndando.png', 'PlayerAndando', 400, 400, this);

  }
  
  function create(){

      this.fundo = this.add.image(this.scale.width / 2,this.scale.height / 2,'fundo');
  
  this.fundo.setDisplaySize(
      this.scale.width,
      this.scale.height
  );
    TextoVida = this.add.text(150,30,'Vida: ',{fontSize: '64px',fill: '#ee0000'});
    TextoVidaBoss = this.add.text(650,30,'Vida do Boss: ',{fontSize: '64px',fill: '#ee0000'});

    keys = this.input.keyboard.addKeys('W,A,D,F,E,F,SHIFT');
    space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    mouse = this.input.activePointer;

    CriaAnima(this,45,5,0,'EfeitoParry','EfeitoParry');
    CriaAnima(this,10,3,0,'PlayerParry', 'PlayerParry');
    CriaAnima(this, 8, 3, -1, 'PlayerIdle', 'PlayerIdle');
    CriaAnima(this, 5, 3, -1, 'BossAndando', 'BossAndando');
    CriaAnima(this,37.5, 4, 0, 'AnimacaoAtq','AnimacaoAtq');
    CriaAnima(this,9, 7, 0, 'BossAtacando','BossAtacando');
    CriaAnima(this,8, 5, -1, 'PlayerAndando','PlayerAndando');
    
    player = new Player(this, 400, 300, 'player', 'ataque');
    boss = new Boss(this, 900, 300, 'boss' , 'ataque');
    plataforms = this.physics.add.staticGroup();
   
    const chao = plataforms.create(this.scale.width/2,this.scale.height,'chao');
    const esquerda = plataforms.create(0,this.scale.height/2,'chao');
    const direita = plataforms.create(this.scale.width /*- 200*/,this.scale.height/2,'chao');

    this.physics.add.collider(player, plataforms);
    this.physics.add.collider(boss, plataforms);

    chao.setVisible(false);
    esquerda.setVisible(false);
    direita.setVisible(false);

    chao.setDisplaySize(this.scale.width,120);
    esquerda.setDisplaySize(200,this.scale.height);
    direita.setDisplaySize(200,this.scale.height);

    chao.refreshBody();
    esquerda.refreshBody();
    direita.refreshBody();



  }

    function LoadAnima(caminho, nome, frameWidth, frameHeight,scene)
  {
    scene.load.spritesheet(nome, caminho, {
        frameWidth: frameWidth,
        frameHeight: frameHeight
    });
  }

  function CriaAnima(scene,frameRate, end, repeat, key, arquivo){
      if(scene.anims.exists(key)) 
        {
          return
        };

    scene.anims.create({
    key: key,
    frames: scene.anims.generateFrameNumbers(arquivo, {
        start: 0,
        end: end
    }),
    frameRate: frameRate,
    repeat: repeat
});
  }
  
  function update(time, delta)
  {
    boss.update(player);
    player.update(keys, space, mouse , boss);
    TextoVida.setText('Vida: ' + player.vida);
    TextoVidaBoss.setText('Vida do Boss: ' + boss.vida);


  } 

/*
Para rodar o projeto localmente sem o Live Server:

python -m http.server 8000

Depois, acessar no navegador:

http://localhost:8000


Para salvar as alterações no GitHub:

git add .
git commit -m "Descrição da alteração"
git push

*/
