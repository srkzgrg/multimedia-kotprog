$('#game').hide();
$('#start').show();
$('#gameOver').hide();

getTopList();
let blokkok = new Map(); //kulcs: oszlop, érték: oszlopban lévő blokkok (String tömb)
const szinek = ["#3bcc3e", "#386eeb", "#db1832", "#e69730"]; //z: zöld, k: kék, p: piros, s: sárga
let mozgasiT = [0, 1, 2, 3, 4, 5, 6, 7,8,9];
let html = $('html')
html.css({
     backgroundImage: 'url("./assets/Img/bg.jpeg")',
     backgroundSize: 'cover'
})

let canvas = document.getElementById("myCanvas");
let time = document.getElementById("pbar");
let stat = document.getElementById("addstat");
let ctx = canvas.getContext("2d");
let fog = false;
let fog_color = "";
let fog_db = 1;

//SOUND EFFECTS
let tictac = new Audio("./assets/audio/bomb_tictac.mp3");
let music = document.getElementById("bgmusic");

let score = 0;
let img = new Image();
img.src = "./assets/Img/dora.png"
let bomb = new Image();
bomb.src = "./assets/Img/bomb.png";
canvas.addEventListener('mousemove', charMouseMove, false);
canvas.addEventListener('click', brickClick, false);
let charX = 0;
let oszlop = 0;

let sec = 0;
let duration = 50;
let lvl = 1;
let nextPoint = 1250
let lvlscore = 0;



function timer() {
     time.setAttribute('value', sec++);
     if(lvlscore >= nextPoint){
          nexLevel();
     }
     else if(sec >= duration){
          dropBlock()
     }
}

function dropBlock(){
     sec = 0;
     for(let i = 0; i < 10; i++){
          var randomNumber = Math.floor(Math.random()*szinek.length);
          blokkok.get(i).unshift(szinek[randomNumber]);
     }
     draw();
}

function gameOver(){
     $('#game').hide();
     $('#gameOver').show();
     html.css({
          backgroundImage: 'none'
     })
     setInterval(timer);
     music.pause()
}

function nexLevel(){
     lvl++;
     mozgasiT = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
     $('#level').text("Szint: " + lvl);
     $('#level').css("color", "#FFA500");
     $('#level').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
     $('#level').animate({'font-size': '40px'});
     $('#level').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
     $('#level').animate({'font-size': '25px'});
     $('#level').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
     setTimeout(
         function()
         {
              $('#level').css("color", "darkgrey");
         }, 2000);

     if(lvl < 8){
          nextPoint+=150;
     }
     lvlscore=0;
     generate();
     sec = 0;
     if(duration > 10){
          duration -= 10;
     }
     time.setAttribute('max', duration);

}

function generate(){
     let sorok = 0;
     if(lvl < 5)  sorok = 5;
     else if (lvl < 10) sorok = 7
     else if (lvl < 15) sorok = 8
     else sorok = 9;
     for(let i = 0; i < 10; i++){
          let oszlop = [];
          for(let j = 0; j < sorok; j++){
               var randomNumber = Math.floor(Math.random()*szinek.length);
               oszlop[j] = szinek[randomNumber];
          }
          blokkok.set(i, oszlop);
     }
     draw();
}
function draw(map){
     for(let item of blokkok){
          if(item[1].length >= 16) gameOver()
     }
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     ctx.shadowOffsetX = 0;
     ctx.shadowBlur = 0;
     ctx.globalAlpha=0.50;
     ctx.fillStyle="#d6d2d2"
     let i = 0;
     if(charX === 0){
          i = 0;
     }else i = 1
     ctx.fillRect(charX + i * 20, 0, 90, 650);
     ctx.globalAlpha=1;
     ctx.drawImage(img, charX, 490, 127.2, 160);
     drawBlocks(map);
     mozgasiTerulet()
}



function brickClick(ev) {
     let clickaud = new Audio("./assets/audio/brickaud.wav");
     let explosion = new Audio("./assets/audio/explosion.mp3");
     let erroraud = new Audio("./assets/audio/clickerro.wav");
     erroraud.volume = 0.3;
     clickaud.volume = 0.2;
     if(blokkok.get(oszlop).length === 0 && !fog)  erroraud.play();
     else if(!fog && typeof blokkok.get(oszlop)[0] !== "undefined"){
         clickaud.play();

         fog_color = blokkok.get(oszlop).pop();
         fog_db = 1;
         for(let i = blokkok.get(oszlop).length -1; i>=0; i--){
              if(blokkok.get(oszlop)[i] === fog_color){
                   fog_db ++;
                   blokkok.get(oszlop).pop();
              }
              else break;
         }
          fog=true
         draw();
         if(fog_color === "bomb"){
              tictac.play()
              music.pause()
              ctx.drawImage(bomb, oszlop === 0 ? 15 : oszlop * 100, 556, 90, 30);

         }

    }else if(fog && fog_color === "bomb"){
          tictac.pause();
          explosion.play()
          music.play();
          fog=false;
          blokkok.get(oszlop).push(fog_color);
          boom();
          fog_color="";
     }
     else if(fog && fog_color !== "bomb"){
         clickaud.play();
         fog=false;
         for(let i = 0; i < fog_db; i++) blokkok.get(oszlop).push(fog_color);
         fog_db = 1;
         fog_color = "";
         check()
    }

}

function boom(){
     let seged = new Map();
     seged.clear()
     for (let [key, value] of blokkok) {
          seged.set(key, [...value]);
     }
     db = seged.get(oszlop).length;

     for(let i = seged.get(oszlop).length - 1; i >=0; i--){
          seged.get(oszlop)[i] = "#000000"
     }
     score+=db*50;
     lvlscore+=db*50;
     $('#pontszam').text("+" + db*50 + " PONT");
     $('#pontszam').css("color", "green");
     $('#pontszam').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
     $('#pontszam').animate({'font-size': '40px'});
     $('#pontszam').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
     $('#pontszam').animate({'font-size': '25px'});
     setTimeout(
         function()
         {
              $("#pontszam").text("Pontszám: " + score);
              $('#pontszam').css("color", "white");
         }, 2000);
     draw(seged)

}

function check(){
     let seged = new Map();
     seged.clear()
     for (let [key, value] of blokkok) {
          seged.set(key, [...value]);
     }
     let db = 0;
     let szin = blokkok.get(oszlop)[blokkok.get(oszlop).length - 1];

     for(let i = seged.get(oszlop).length - 1; i >= 0; i--){
          if(blokkok.get(oszlop)[i] === szin){
               seged.get(oszlop)[i] = "#000000"
               for(let j = oszlop + 1; j < 10; j++){
                    if(blokkok.get(j)[i] === szin){
                         for(let k = i - 1; k >= 0; k--){
                              if(blokkok.get(j)[k] === szin) {

                                   seged.get(j)[k] = "#000000"
                                   for(let h = j; h < 10; h++){
                                        if(blokkok.get(h)[k] === szin) {

                                             seged.get(h)[k] = "#000000"
                                             for(let v = k; k < 16; v++){
                                                  if(blokkok.get(h)[v] === szin){

                                                       seged.get(h)[v] = "#000000"
                                                  }else break;
                                             }
                                             for(let v = k; k >= 0; v--){
                                                  if(blokkok.get(h)[v] === szin){

                                                       seged.get(h)[v] = "#000000"
                                                  }else break;
                                             }
                                        }else break;
                                   }
                                   for(let h = j; h >= 0; h--){
                                        if(blokkok.get(h)[k] === szin) {

                                             seged.get(h)[k] = "#000000"
                                             for(let v = k; k < 16; v++){
                                                  if(blokkok.get(h)[v] === szin){

                                                       seged.get(h)[v] = "#000000"
                                                  }else break;
                                             }
                                             for(let v = k; k >= 0; v--){
                                                  if(blokkok.get(h)[v] === szin){

                                                       seged.get(h)[v] = "#000000"
                                                  }else break;
                                             }
                                        }else break;
                                   }
                              }
                              else break;
                         }
                         for(let k = i + 1; k < 16; k++){
                              if(blokkok.get(j)[k] === szin){

                                   seged.get(j)[k] = "#000000";
                                   for(let h = j; h < 10; h++){
                                        if(blokkok.get(h)[k] === szin) {

                                             seged.get(h)[k] = "#000000"
                                             for(let v = k; k < 16; v++){
                                                  if(blokkok.get(h)[v] === szin){

                                                       seged.get(h)[v] = "#000000"
                                                  }else break;
                                             }
                                             for(let v = k; k >= 0; v--){
                                                  if(blokkok.get(h)[v] === szin){

                                                       seged.get(h)[v] = "#000000"
                                                  }else break;
                                             }
                                        }else break;
                                   }
                                   for(let h = j; h >= 0; h--){
                                        if(blokkok.get(h)[k] === szin) {

                                             seged.get(h)[k] = "#000000"
                                             for(let v = k; k < 16; v++){
                                                  if(blokkok.get(h)[v] === szin){

                                                       seged.get(h)[v] = "#000000"
                                                  }else break;
                                             }
                                             for(let v = k; k >= 0; v--){
                                                  if(blokkok.get(h)[v] === szin){

                                                       seged.get(h)[v] = "#000000"
                                                  }else break;
                                             }
                                        }else break;
                                   }
                              }
                              else break;
                         }

                         seged.get(j)[i] ="#000000";
                    }
                    else break;
               }
               for(let j = oszlop - 1; j >= 0; j--){
                    if(blokkok.get(j)[i] === szin){
                         for(let k = i - 1; k >= 0; k--){
                              if(blokkok.get(j)[k] === szin) {

                                   seged.get(j)[k] = "#000000";
                                   for(let h = j; h < 10; h++){
                                        if(blokkok.get(h)[k] === szin) {

                                             seged.get(h)[k] = "#000000"
                                             for(let v = k; k < 16; v++){
                                                  if(blokkok.get(h)[v] === szin){

                                                       seged.get(h)[v] = "#000000"
                                                  }else break;
                                             }
                                             for(let v = k; k >= 0; v--){
                                                  if(blokkok.get(h)[v] === szin){

                                                       seged.get(h)[v] = "#000000"
                                                  }else break;
                                             }
                                        }else break;
                                   }
                                   for(let h = j; h >= 0; h--){
                                        if(blokkok.get(h)[k] === szin) {

                                             seged.get(h)[k] = "#000000"
                                             for(let v = k; k < 16; v++){
                                                  if(blokkok.get(h)[v] === szin){

                                                       seged.get(h)[v] = "#000000"
                                                  }else break;
                                             }
                                             for(let v = k; k >= 0; v--){
                                                  if(blokkok.get(h)[v] === szin){

                                                       seged.get(h)[v] = "#000000"
                                                  }else break;
                                             }
                                        }else break;
                                   }
                              }
                              else break;
                         }
                         for(let k = i + 1; k < 16; k++){
                              if(blokkok.get(j)[k] === szin) {

                                   seged.get(j)[k] = "#000000";
                                   for(let h = j; h < 10; h++){
                                        if(blokkok.get(h)[k] === szin) {

                                             seged.get(h)[k] = "#000000"
                                             for(let v = k; k < 16; v++){
                                                  if(blokkok.get(h)[v] === szin){

                                                       seged.get(h)[v] = "#000000"
                                                  }else break;
                                             }
                                             for(let v = k; k >= 0; v--){
                                                  if(blokkok.get(h)[v] === szin){

                                                       seged.get(h)[v] = "#000000"
                                                  }else break;
                                             }
                                        }else break;
                                   }
                                   for(let h = j; h >= 0; h--){
                                        if(blokkok.get(h)[k] === szin) {
                                             seged.get(h)[k] = "#000000"
                                             for(let v = k; k < 16; v++){
                                                  if(blokkok.get(h)[v] === szin){

                                                       seged.get(h)[v] = "#000000"
                                                  }else break;
                                             }
                                             for(let v = k; k >= 0; v--){
                                                  if(blokkok.get(h)[v] === szin){
                                                       seged.get(h)[v] = "#000000"
                                                  }else break;
                                             }
                                        }else break;
                                   }
                              }
                              else break;
                         }
                         seged.get(j)[i] ="#000000";
                    }
                    else break;
               }
          }
          else break;
     }

     for (let [key, value] of seged) {
          for (let i = 0; i < value.length; i++) {
               if(value[i] === "#000000") db++;
          }
     }
     if(db >= 4){
          score+=db*50;
          lvlscore+=db*50;
          $('#pontszam').text("+" + db*50 + " PONT");
          $('#pontszam').css("color", "yellow");
          $('#pontszam').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
          $('#pontszam').animate({'font-size': '40px'});
          $('#pontszam').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
          $('#pontszam').animate({'font-size': '25px'});
          setTimeout(
              function()
              {
                   $("#pontszam").text("Pontszám: " + score);
                   $('#pontszam').css("color", "white");
              }, 2000);
          draw(seged)
     }else{
          draw()
     }

}

function charMouseMove(ev) {
     var rect = canvas.getBoundingClientRect();
     var mouseX = ev.clientX - rect.left - 20;
     let prev = charX;
     if(mouseX > -20 && mouseX <= 70 && mozgasiT.indexOf(0) > -1 && oszlop !== 0){
          charX = 0;
          oszlop = 0;
          draw();
     }else if(mouseX > 80 && mouseX <= 170 && mozgasiT.indexOf(1) > -1 && oszlop !== 1){
          charX = 80;
          oszlop = 1;
          draw();
     }else if(mouseX > 180 && mouseX <= 270 && mozgasiT.indexOf(2) > -1 && oszlop !== 2){
          charX = 180;
          oszlop = 2;
          draw();
     }else if(mouseX > 280 && mouseX <= 370 && mozgasiT.indexOf(3) > -1 && oszlop !== 3){
          charX = 280;
          oszlop = 3;
          draw();
     }else if(mouseX > 380 && mouseX <= 470 && mozgasiT.indexOf(4) > -1 && oszlop !== 4){
          charX = 380;
          oszlop = 4;
          draw();
     }else if(mouseX > 480 && mouseX <= 570 && mozgasiT.indexOf(5) > -1 && oszlop !== 5){
          charX = 480;
          oszlop = 5;
          draw();
     }else if(mouseX > 580 && mouseX <= 670 && mozgasiT.indexOf(6) > -1 && oszlop !== 6){
          charX = 580;
          oszlop = 6;
          draw();
     }else if(mouseX > 680 && mouseX <= 770 && mozgasiT.indexOf(7) > -1 && oszlop !== 7){
          charX = 680;
          oszlop = 7;
          draw();
     }else if(mouseX > 780 && mouseX <= 870 && mozgasiT.indexOf(8) > -1 && oszlop !== 8){
          charX = 780;
          oszlop = 8;
          draw();
     }else if(mouseX > 880 && mouseX <= 970 && mozgasiT.indexOf(9) > -1 && oszlop !== 9){
          charX = 880;
          oszlop = 9;
          draw();
     }

}

$(".startbtn").mouseenter(animatestart);

function animatestart(){
     $('#imgdiv').animate({margin: '+=25px'});
     $('#imgdiv').animate({margin: '-=25px'});

}

$(".startbtn").click(function(){
     let startaud = new Audio("./assets/audio/startaud.wav");
     startaud.volume = 0.2;
     startaud.play();


     $('#start').hide();
     $('#game').show();
     music.volume = 0.1
     music.play();
     music.loop = true;

     start()
     html.css({
          backgroundImage: 'url("./assets/Img/bg.png")'
     })
});

$("#backbtn").click(function (){
     let startaud = new Audio("./assets/audio/startaud.wav");
     startaud.volume = 0.2;
     startaud.play();


     $('#gameOver').hide();
     $('#game').show();
     music.volume = 0.1
     music.play();
     music.loop = true;

     start()
     html.css({
          backgroundImage: 'url("./assets/Img/bg.png")'
     })
})

$(".topplistabtn").click(function (){
     $('#start').hide();
     $('#gameOver').show();
     $('#addScore').hide();
     $('#gameOverImg').hide();
     html.css({
          backgroundImage: 'none'
     })
});
$(function () {
     $('#imgdiv').animate({margin: '+=25px'});
     $('#imgdiv').animate({margin: '-=25px'});
});


function mozgasiTerulet(){
    mozgasiT = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
     for(let i = 0; i < 10; i++){
          if(blokkok.get(i).length >= 13){
               if(oszlop > i){
                    for(let j = i; j >= 0; j--){
                         const index = mozgasiT.indexOf(j);
                         if (index > -1) {
                              mozgasiT.splice(index, 1);
                         }
                    }
               }
               if(oszlop < i){
                    for(let j = i; j < 10; j++){
                         const index = mozgasiT.indexOf(j);
                         if (index > -1) {
                              mozgasiT.splice(index, 1);
                         }
                    }
               }
          }
     }
}
function drawBlocks(map){
     let seged = new Map();
     for(let i = 0; i < 10; i++){
          for (let j = 0; j < blokkok.get(i).length; j++){
               ctx.shadowColor = "gray";
               ctx.shadowOffsetX = 3;
               ctx.shadowBlur = 3;
               drawBrick(90, 30, blokkok.get(i)[j], i * 90 + i * 10, j * 30 + j * 10, ctx)
          }
     }if(typeof map !== "undefined"){
          for(let i = 0; i < 10; i++){
               let o = []
               for (let j = 0; j < map.get(i).length; j++){
                    if(map.get(i)[j] === "#000000"){

                         drawBrick(90, 30, map.get(i)[j], i * 90 + i * 10, j * 30 + j * 10, ctx)

                    }else o[j] = map.get(i)[j];
               }
               seged.set(i, o);
          }
          blokkok.clear();
          for (let [key, value] of seged) {
               let oszlop = [];
               let j = 0;
               for (let i = 0; i < value.length; i++) {
                    if(value[i]){
                         oszlop[j] = value[i];
                         j++;
                    }
               }
               blokkok.set(key, oszlop);
          }
     }

     if(fog){
          if(fog_color === "bomb"){
               ctx.drawImage(bomb,oszlop === 0 ? 15 : oszlop * 100, 556, 90, 30);
          }else
          {
               for(let i = 0; i < fog_db; i++){

                    ctx.fillStyle = fog_color;
                    ctx.fillRect(oszlop === 0 ? 15 : oszlop * 100, 556 - (i * 35), 90, 30);
               }
               //ctx.fillStyle = fog_color;
               //ctx.fillRect(oszlop === 0 ? 15 : oszlop * 100, 556, 90, 30);
          }
     }
}
function drawBrick(width, height, color, x, y, mctx) {
    if(color === "bomb"){

        mctx.drawImage(bomb, x, y, width, height);

    }else{
         mctx.fillStyle = color;
         mctx.fillRect(x, y, width, height);
    }

}
function start(){
     lvl = 1;
     charX = 480;
     sec=0;

     setInterval(timer, 1000);
     for(let i = 0; i < 10; i++){
          let oszlop = [];
          for(let j = 0; j < 5; j++){
               let randomNumber = Math.floor(Math.random()*szinek.length);
               let bomb = Math.floor(Math.random()*100);
               if(bomb > 95){
                   oszlop[j] = "bomb";
               }else{
                   oszlop[j] = szinek[randomNumber];
               }

          }
          blokkok.set(i, oszlop);
     }
     draw();
}

function getTopList(){
    $("table tbody").empty();
    let lista = JSON.parse(localStorage.getItem("TopLista"));
    let sortedlist = [];
    if(lista) sortedlist = lista.sort((p1, p2) => (p1.score > p2.score) ? -1 : (p1.score < p2.score) ? 1 : 0);

    for(let i = 0; sortedlist.length < 8 ? i < sortedlist.length : i < 8; i++){
        let markup = "<tr><td>" +  (i+1) +".</td><td>" + sortedlist[i].name +"</td><td>" + sortedlist[i].score + "</td></tr>";
        tableBody = $("table tbody");
        tableBody.append(markup);
    }
}


stat.addEventListener("submit", (e) => {
     e.preventDefault();

     let name = document.getElementById("name");
     if(name.value === ""){
         window.alert("A név értéke nem lehet üres");
     }else{

          let lista = JSON.parse(localStorage.getItem("TopLista"));
          if(!lista){
               lista = [];
          }

          const myScore = {
               "name": name.value,
               "score": score
          }
          let volt = false

          for(let i = 0; i < lista.length; i++){
               if(lista[i].name === name.value)  volt = true;
               if(lista[i].name === name.value && lista[i].score < score){
                    lista[i].score = score;
               }
          }

          if(!volt) lista.push(myScore);

          localStorage.setItem("TopLista", JSON.stringify(lista));

     }
     getTopList()

});

