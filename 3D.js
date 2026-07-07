//  "Low poly Miku Hatsune" (https://skfb.ly/opxv6) 
//  by emanueler is licensed under Creative Commons Attribution-NonCommercial (http://creativecommons.org/licenses/by-nc/4.0/).

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

xcen = canvas.width/2;
ycen = canvas.height/2;
moving_speed = 0.2;
FOV = 120;
zdist = canvas.width/2*Math.tan((90-FOV/2)*Math.PI/180);

let keys = {};

Wpress = false;
Spress = false;
Apress = false;
Dpress = false;
space = false;
shift = false;
moveZ = 0;
Zmsum = 10;
moveX = 0;
Xmsum = 0;
moveY = 0;
Ymsum = 0;

Yrot = 0;
Xrot = 0;
Yrotsum = 0;
Xrotsum = 0;

distarr = [];

dots = [
[1,1,1],
[0,1,1],
[0,0,1],
[1,0,1],
[1,1,0],
[0,1,0],
[0,0,0],
[1,0,0],
[4,4,4],
[3,4,4],
[3,3,4],
[4,3,4],
[4,4,3],
[3,4,3],
[3,3,3],
[4,3,3]
];

c1 = "rgb(50 220 60 / 255%)";
c2 = "white";

trilist = [
[0,1,2,c1],
[2,3,0,c1],
[1,5,6,c1],
[6,2,1,c1],
[5,4,7,c1],
[7,6,5,c1],
[4,0,3,c1],
[3,7,4,c1],
[4,5,1,c1],
[1,0,4,c1],
[3,2,6,c1],
[6,7,3,c1],
[8,9,10,c2],
[10,11,8,c2],
[9,13,14,c2],
[14,10,9,c2],
[13,12,15,c2],
[15,14,13,c2],
[12,8,11,c2],
[11,15,12,c2],
[12,13,9,c2],
[9,8,12,c2],
[11,10,14,c2],
[14,15,11,c2]];

tris = [];
lights = [];

findots = JSON.parse(JSON.stringify(dots));



function triangle(a,b,c,d,e,f) {
    ctx.beginPath();
    ctx.moveTo(a, b);
    ctx.lineTo(c, d);
    ctx.lineTo(e, f);
    ctx.lineTo(a, b);
    ctx.fill();
    ctx.stroke();
}

function drawtri(a,b,c) {
    AB = [findots[b][0]-findots[a][0], findots[b][1]-findots[a][1],findots[b][2]-findots[a][2]]
    AC = [findots[c][0]-findots[a][0], findots[c][1]-findots[a][1],findots[c][2]-findots[a][2]]
    cross_prod = [AB[1]*AC[2]-AB[2]*AC[1], AB[2]*AC[0]-AB[0]*AC[2], AB[0]*AC[1]-AB[1]*AC[0]]
    magnitude = Math.sqrt(cross_prod[0]*cross_prod[0] + cross_prod[1]*cross_prod[1] + cross_prod[2]*cross_prod[2])
    normal = [cross_prod[0]/magnitude, cross_prod[1]/magnitude, cross_prod[2]/magnitude]
    if (normal[0]*findots[a][0] + 
        normal[1]*findots[a][1] + 
        normal[2]*findots[a][2] < 0 &&
        findots[a][2] > 0 && 
        findots[b][2] > 0 && 
        findots[c][2] > 0) {
        x1 = xcen + findots[a][0]*zdist/findots[a][2];
        y1 = ycen - findots[a][1]*zdist/findots[a][2];
        x2 = xcen + findots[b][0]*zdist/findots[b][2];
        y2 = ycen - findots[b][1]*zdist/findots[b][2];
        x3 = xcen + findots[c][0]*zdist/findots[c][2];
        y3 = ycen - findots[c][1]*zdist/findots[c][2];
        triangle(x1,y1,x2,y2,x3,y3);
    }
}
  

function draw() {
    applyRot_move();
    if (Xrotsum > Math.PI/2) {
        Xrotsum = Math.PI/2;
        Xrot = 0;
    }
    if (Xrotsum < -Math.PI/2) {
        Xrotsum = -Math.PI/2;
        Xrot = 0;
    }
    getdist();
    distsort();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 1; i < trilist.length+1; i++) {
        ctx.fillStyle = trilist[tris[tris.length- i].num][3];
        ctx.strokeStyle = trilist[tris[tris.length- i].num][3];
        drawtri(trilist[tris[tris.length - i].num][0],trilist[tris[tris.length - i].num][1],trilist[tris[tris.length - i].num][2]);
    }

    Xrotsum = Xrotsum + Xrot;
    Yrotsum = Yrotsum + Yrot;
    
    requestAnimationFrame(draw);
}

function Mmove(event) {
    Yrot = event.movementX*0.006;
    Xrot = event.movementY*-0.006;
    if (Xrotsum > Math.PI/2) {
        Xrotsum = Math.PI/2;
        Xrot = 0;
    }
    if (Xrotsum < -Math.PI/2) {
        Xrotsum = -Math.PI/2;
        Xrot = 0;
    }
}

function applyRot_move() {
    if (isKeyPressed('KeyW')) {moveZ -= moving_speed;}
    if (isKeyPressed('KeyS')) {moveZ += moving_speed;}
    if (isKeyPressed('KeyA')) {moveX += moving_speed;}
    if (isKeyPressed('KeyD')) {moveX -= moving_speed;}
    if (isKeyPressed('Space')) {moveY -= moving_speed;}
    if (isKeyPressed('ShiftLeft')) {moveY += moving_speed;}
    if (moveX != 0 && moveZ != 0) {
        if (moveX < 0) {
            moveX = -Math.sqrt(Math.abs(moveX*10))/10;
        } else {
            moveX = Math.sqrt(moveX*10)/10;
        }
        if (moveZ < 0) {
            moveZ = -Math.sqrt(Math.abs(moveZ*10))/10;
        } else {
            moveZ = Math.sqrt(moveZ*10)/10;
        }
    }
    Xmsum += moveZ*Math.sin(Yrotsum) + moveX*Math.sin(Yrotsum+Math.PI/2);
    Zmsum += moveZ*Math.cos(Yrotsum) + moveX*Math.cos(Yrotsum+Math.PI/2);
    Ymsum += moveY;

    //here you add the code that calculates the brightness of the square. before any camera transformation when the values are raw
    //you get the distance from 
    //nah just apply rotation to the light too and calculate the dist at the last function

    for (let i = 0; i < dots.length; i++) {
        findots[i][0] = dots[i][0] + Xmsum;
        findots[i][1] = dots[i][1] + Ymsum;
        findots[i][2] = dots[i][2] + Zmsum;
        saveX = findots[i][0];
        findots[i][0] = findots[i][0]*Math.cos(Yrotsum)-findots[i][2]*Math.sin(Yrotsum);
        findots[i][2] = saveX*Math.sin(Yrotsum)+findots[i][2]*Math.cos(Yrotsum);
        saveY = findots[i][1]
        findots[i][1] = findots[i][1]*Math.cos(Xrotsum)-findots[i][2]*Math.sin(Xrotsum);
        findots[i][2] = saveY*Math.sin(Xrotsum)+findots[i][2]*Math.cos(Xrotsum);
    }
    Yrot = Yrot*0.8;
    Xrot = Xrot*0.8;
    moveZ = 0;
    moveX = 0;
    moveY = 0;
}

function getdist() {
    for (let i = 0; i < trilist.length; i++) {
        cx = (findots[trilist[i][0]][0] + findots[trilist[i][1]][0] + findots[trilist[i][2]][0])/3;
        cy = (findots[trilist[i][0]][1] + findots[trilist[i][1]][1] + findots[trilist[i][2]][1])/3;
        cz = (findots[trilist[i][0]][2] + findots[trilist[i][1]][2] + findots[trilist[i][2]][2])/3;
        dist = Math.sqrt(cx*cx + cy*cy + cz*cz); 
        distarr[i] = dist;
    }
}

function distsort() {
    for (let i = 0; i < trilist.length; i++) {
        tris[i] = {num: i, distance: distarr[i]}
    }
    tris.sort((firstItem, secondItem) => firstItem.distance - secondItem.distance);
}

canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
});
document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
        document.addEventListener('mousemove', Mmove);
    } else {
        document.removeEventListener('mousemove', Mmove);
    }
});
document.addEventListener('keydown', (event) => {
    keys[event.code] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

document.addEventListener('mousedown', (event) => {
    lights[lights.length] = 0;
});

function isKeyPressed(keyCode) {
    return !!keys[keyCode];
}

draw();
