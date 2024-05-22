let config = {
    renderer: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: "arcade",
        arcade: {
            gravity: {y:300},
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let bird;
let game = new Phaser.Game(config);
let hasLanded = false;
let cursors;
let hasBumped;
let isGameStarted = false;
let messageToPlayer;
let evilBird = [];
let evilBirdCollide = false;
let soundVictory;
let once = true; // This boolean will be used to prevent that the victory sound plays more than once when 
                 //  the player reaches the end, and to avoid the death counter to keep going at the end.
let deaths = 0;

const musicConfig = { 
    volume: 0.3,
    loop: true
}
const soundConfig = {
    volume:0.3,
    loop: false,       
}

function preload(){
    this.load.image("background", "assets/background.png");
    this.load.image("road", "assets/road.png");
    this.load.image("column", "assets/column.png");
    this.load.spritesheet("bird", "assets/bird.png", { frameWidth: 64, frameHeight: 96});
    this.load.spritesheet("evilBird" , "assets/evilBird.png", { frameWidth: 64, frameHeight: 96});
    this.load.audio("music", "assets/swing.mp3");
    this.load.audio("victory", "assets/victory.mp3");    
}

function create(){    
    this.music = this.sound.add("music");    
    this.music.play(musicConfig); 

    const background = this.add.image(0,0,"background").setOrigin(0,0);
    const roads = this.physics.add.staticGroup(); 

    const topColumns = this.physics.add.staticGroup({
        key: "column",
        repeat: 1,
        setXY: { x: 200, y: 0, stepX: 300 }
    });

    const bottomColumns = this.physics.add.staticGroup({
        key: "column",
        repeat: 1,
        setXY: {x: 350, y: 400, stepX: 300}
    })

    const road = roads.create(400, 568, "road").setScale(2).refreshBody();

    bird = this.physics.add.sprite(0, 50, 'bird').setScale(2);
    bird.setBounce(0.2);
    bird.setCollideWorldBounds(true);

    evilBird = [ // Adding 2 "evil birds" to make the game harder
        this.physics.add.sprite(110, 0, "evilBird").setScale(2),
        this.physics.add.sprite(425, 0, "evilBird").setScale(2)
    ]

    this.physics.add.overlap(bird, road, () => hasLanded = true, null, this);
    this.physics.add.collider(bird, road);
    
    this.physics.add.overlap(bird, topColumns, () => hasBumped = true, null, this)
    this.physics.add.overlap(bird, bottomColumns, () => hasBumped = true, null, this)
    this.physics.add.collider(topColumns, bird);
    this.physics.add.collider(bottomColumns, bird);

    for (const i of evilBird){ // Adding collision with player and the road to evil birds
        this.physics.add.overlap(bird, i, () => hasBumped = true, null, this)    
        this.physics.add.collider(i, road);  
    }

    cursors = this.input.keyboard.createCursorKeys();

    messageToPlayer = this.add.text(0 ,0, "Instructions: Press space to start", 
    {fontFamily: '"Comic Sans MS", Times, serif', fontSize: "20px", color: "white", backgroundColor: "black"});
    Phaser.Display.Align.In.BottomCenter(messageToPlayer, background, 0, 50);    
}

function update(){ 
    if (cursors.space.isDown && !isGameStarted) {
        isGameStarted = true;
        messageToPlayer.text = "";
    }

    !isGameStarted ? bird.setVelocityY(-160) : null;
    
    cursors.up.isDown && !hasLanded && !hasBumped ? bird.setVelocityY(-160) : null;

    !hasLanded && !hasBumped && isGameStarted ?  bird.body.velocity.x = 50 : bird.body.velocity.x = 0;

    if (hasLanded || hasBumped){ // When player dies you can press shift and retry
        messageToPlayer.text = 'You crashed! Press "shift" to try again!';

        if (cursors.shift.isDown){
            if(once == true){  
                deaths++;
            }
            hasLanded = false;
            hasBumped = false;            
            bird.x = 0;
            bird.y = 0;
            messageToPlayer.text = "";
        }
    }    

    if (bird.x > 750){
        bird.setVelocityY(40);              
        messageToPlayer.text = "Congrats! You reached the end! \n            You have " + deaths + " deaths";

        this.music.stop();   // When player wins the music stops and the program plays the victory sound.

        if (once == true){ // Using the once variable to make sure the sound only plays 1 time, and the 
                           // deaths don't keep counting
            this.soundVictory = this.sound.add("victory");
            this.soundVictory.play();            
            once = false;
        }                       
    }  

    for (const i of evilBird){
        i.y > 450 ? i.setVelocityY(-500) : null;
        i.y < 1 ? i.setVelocityY(400) : null;
    }  
}


