title = "PogoJumper";

description = `
  [Press] to jump
  [hold] to spin
  release n' hold
  to spin other 
  way
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  theme: "shapeDark",
};

let p, v, r;
let floors;
let jumpWay;
let jumpPower;
let floorAppDist;
let scr;
let isFirstPressing, rDir;

function update() {
  if (!ticks) {
    p = vec(50, 50); //starting pos
    v = vec();
    r = 0   //controls rotation of the bar
    isFirstPressing = true;
    rDir = true;
    floors = [vec(95, 100)];
    jumpWay = jumpPower = floorAppDist = 1;
  }
  p.add(v);
  v.y += input.isPressed ? 0.05 : 0.2;
  score += scr = (p.y < 30 ? (30 - p.y) * 0.1 : 0) + difficulty * 0.1;
  if ((floorAppDist -= scr) < 0) {
    floorAppDist = rnd(99);
    floors.push(vec(rnd(99), -9));
    //floors.push(vec(100, -100));
  }
 
  p.y += scr; 
  color("blue");
  floors = floors.filter((f) => {
    //f.y += 1; //scr
    f.x -= 1;
    box(f, 10, 5);  //platforms
    if(f.x < 0){
      //f.y = 0;
      //f.x = rnd(35,45); //need to make two variables and randomly choose one, can't be having it spawn in the middle of the screen (impossible to dodge)
      f.y = 95;
      f.x = 100;
    }
    return f.y < 99;
  });

  color("red");
  box(vec(50,100),50,5) //ground
  color("transparent");
  for (;;) {
    let isGroundCollide = !bar(p, 10, 2,r,.5).isColliding.rect.red;
    let isObstCollide = bar(p, 10, 2,r,.5).isColliding.rect.blue;
    if (isGroundCollide) {  //collision (using characters bounds)
      break;
    }
    if(isObstCollide){
      //gameOver
      end();
    }
    p.y--;  //changes platforms y to get smaller
    v.set();  //sets players velocity to 0 (keep doing whenver not on plat)
    jumpPower = 1;  //resets players jump power
    isFirstPressing = true;
    rDir = true;
  
  }

  //player stuff
  color("green");
  bar(p, 10, 2,r,.5);  //character shape (pos, x, y, rotation, center)
  if (input.isPressed && !isFirstPressing && rDir) {
    r+=.1;
    jumpPower *= 1.1;
  }
  if(input.isJustReleased && !isFirstPressing){
    rDir = false;
  }
  if(input.isPressed && !isFirstPressing && !rDir){
    r-=.1;
    v.y += .3;
  }
  if(input.isJustPressed){
    if(isFirstPressing){
      isFirstPressing = false;
      play("jump");
      //v.x = jumpWay *= -1;
      v.y = -3 * jumpPower;
      jumpPower *= 0.7;
    }
  }

  if (p.y > 99) {
    play("explosion");
    end();
  }
}
/*
if (input.isPressed && !isFirstPressing) {
}
if (input.isJustReleased) {
    if (isFirstPressing) {
      isFirstPressing = false;
    } else {
      pt *= -1;
    }
  }

*/