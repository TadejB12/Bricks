function drawIt() {
  var x = 399;
  var y = 660;
  var dx = 0;
  var dy = 4;
  var WIDTH;
  var HEIGHT;
  var r = 10;
  var ctx;
  var paused;
  //paddle variables
  var paddlex;
  var paddleh;
  var paddlew = 150;
  //brisanje opek
  var rowheight;
  var colwidth;
  var row;
  var col;
  //barve
  var rowcolors = ["#000000", "#000000", "#000000", "#000000", "#000000"]; //za vsako vrstico svoja barva
  var paddlecolor = "#000000";
  var ballcolor = "#000000";
  //premikanje
  var rightDown = false;
  var leftDown = false;
  //opeke
  var bricks;
  var NROWS;
  var NCOLS;
  var BRICKWIDTH;
  var BRICKHEIGHT;
  var PADDING;
  //timer
  var sekunde;
  var sekundeI;
  var minuteI;
  var initTimer;
  var izpisTimer;
  var start;
  //deklaracija spremenljivke
  var tocke; 
  var maxTocke,bestScore=0;
  var newBestScore = false;
  //inicializacija
  var text;
  //deklaracija in inicializacija slike
  var cannon_ball = new Image();
  var pirate_ship = new Image();
  var plank = new Image();

  // Track loading state
  var imagesLoaded = 0;
  var totalImages = 3; // Number of images to load

  // Set up onload event handlers for each image
  cannon_ball.src = "slike/cannon_ball.png";
  cannon_ball.onload = function() {
      imagesLoaded++;
      checkImagesLoaded();
  };

  pirate_ship.src = "slike/pirate_ship.png";
  pirate_ship.onload = function() {
      imagesLoaded++;
      checkImagesLoaded();
  };

  plank.src = "slike/plank.png";
  plank.onload = function() {
      imagesLoaded++;
      checkImagesLoaded();
  };

  // Function to check if all images are loaded
  function checkImagesLoaded() {
      if (imagesLoaded === totalImages) {
          init();
      }
  }
  
  const hitSound = new Audio('js/explosion.mp3');
  hitSound.preload = 'auto';


  function init() {
    ctx = $("#canvas")[0].getContext("2d");
    WIDTH = $("#canvas").width();
    HEIGHT = $("#canvas").height();
    sekunde = 0;
    izpisTimer = "00:00";
    tocke = 0;
    maxTocke = 20;
    $("#tocke").html(tocke);
    start = false;
    paused = true;
    document.getElementById("btnStart").disabled = false;
    document.getElementById("btnPause").disabled = true;
    document.getElementById("btnEnd").disabled = true;
    document.getElementById("difficulty").disabled = false;
    init_paddle();
    initbricks();
    draw();
  }

  function circle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  }

  function rect(x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fill();
  }

  function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
  }
  //END LIBRARY CODE

  function init_paddle() {
    paddlex = WIDTH / 2 - paddlew / 2;
    paddleh = 10;
  }


  function draw() {
    clear();
    ctx.drawImage(cannon_ball, x, y, 20,20);

    //premik ploščice levo in desno
    if (rightDown && paddlex + paddlew + 5 <= WIDTH) {
      paddlex += 5;
    } else if (leftDown && paddlex - 5 >= 0) {
      paddlex -= 5;
    }
    ctx.drawImage(plank, paddlex, HEIGHT - paddleh, paddlew,paddleh);

    //riši opeke
    for (i = 0; i < NROWS; i++) {
      for (j = 0; j < NCOLS; j++) {
        if (bricks[i][j] == 1) {
          //vstavljanje slike
          ctx.drawImage(pirate_ship, (j * (BRICKWIDTH + PADDING)) + PADDING, (i * (BRICKHEIGHT + PADDING)) + PADDING, BRICKWIDTH, BRICKHEIGHT);
        }else if(bricks[i][j] == 2) {
          //Strong brick - add fog-like glow effect
          ctx.shadowColor = "rgba(0, 0, 0, 1)"; 
          ctx.shadowBlur = 60;
          ctx.shadowOffsetX = 0; // No offset for the shadow
          ctx.shadowOffsetY = 0;
          // Draw the pirate ship with the glow effect
          ctx.drawImage(pirate_ship, (j * (BRICKWIDTH + PADDING)) + PADDING, (i * (BRICKHEIGHT + PADDING)) + PADDING, BRICKWIDTH, BRICKHEIGHT);
          // Reset shadow properties to avoid affecting other drawings
          ctx.shadowColor = "transparent"; // Reset shadow
          ctx.shadowBlur = 0;  // Reset blur
        }
      }
    }

    //rušenje opek
    rowheight = BRICKHEIGHT + PADDING; //Smo zadeli opeko?
    colwidth = BRICKWIDTH + PADDING;
    row = Math.floor(y / rowheight);
    col = Math.floor(x / colwidth);
    //Če smo zadeli opeko, vrni povratno kroglo in označi v tabeli, da opeke ni več
    if (
      y < NROWS * rowheight &&
      row >= 0 &&
      col >= 0 &&
      bricks[row][col] > 0 
    ) {
      hitSound.pause();
      hitSound.currentTime = 0;  // Reset the audio to start from the beginning
      hitSound.play();
      dy = -dy;
      bricks[row][col] --;
      tocke += 1;
      $("#tocke").html(tocke);
    }

    //premikanje krogle
    if (x + dx > WIDTH - r || x + dx < r) dx = -dx;

    if (y + dy < r) dy = -dy;
    else if (y + dy > HEIGHT - r) {
      start = false;
      //Odboj kroglice, ki je odvisen od odboja od ploščka
      if (x > paddlex && x < paddlex + paddlew) {
        dx = 8 * ((x - (paddlex + paddlew / 2)) / paddlew);
        dy = -dy;
        start = true;
      } else {
        game_over();
        clearInterval(intervalId);

      }
    }
    if(start){
      x += dx;
      y += dy;  
    }
   
    if(tocke == maxTocke){
      victory();
    }

  }
  
    //nastavljanje leve in desne tipke
  function onKeyDown(evt) {
    if (evt.keyCode == 39) rightDown = true;
    else if (evt.keyCode == 37) leftDown = true;
    else if (evt.keyCode == 32) {
      var pauseBtn = document.getElementById("btnPause");
      if (!pauseBtn.disabled) {  // Only pause if the button is enabled
        pavza();
      }
    }
  }

  function onKeyUp(evt) {
    if (evt.keyCode == 39) rightDown = false;
    else if (evt.keyCode == 37) leftDown = false;
  }
  
  $(document).keydown(onKeyDown);
  $(document).keyup(onKeyUp);

    function initbricks() {
      var selectElement = document.getElementById('difficulty');
      var selectedValue = selectElement.value;
    
      PADDING = 5;
    
      // Default easy/medium random bricks
      if (selectedValue === "easy" || selectedValue === "medium") {
        if (selectedValue === "easy") {
          NROWS = 4;
          NCOLS = 5;
          BRICKHEIGHT = 60;
        } else {
          NROWS = 5;
          NCOLS = 7;
          BRICKHEIGHT = 50;
        }
    
        BRICKWIDTH = WIDTH / NCOLS - (PADDING + 1);
    
        bricks = new Array(NROWS);
        for (let i = 0; i < NROWS; i++) {
          bricks[i] = new Array(NCOLS);
          for (let j = 0; j < NCOLS; j++) {
            bricks[i][j] = Math.floor(Math.random() * 2) + 1;
            if (bricks[i][j] == 2)
              maxTocke++;
          }
        }
      }
    
      // Now special case for "hard"
      if (selectedValue === "hard") {
        // Hard mode -> Monster face pattern
        

        const pattern = [
          [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],  // Tentacle
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // Tentacle
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],  // Body
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],  // Body
          [1, 1, 0, 0, 1, 1, 1, 0, 0, 1],  // Tentacle
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],  // Body
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],  // Body
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // Tentacle
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // Tentacle
          [1, 1, 0, 0, 1, 1, 1, 0, 1, 1],  // Tentacle
          [1, 0, 0, 1, 1, 1, 0, 0, 1, 0],  // Tentacle
          [1, 0, 1, 1, 0, 0, 0, 1, 1, 0],  // Tentacle 
        ];

        maxTocke = 0;
        NROWS = pattern.length;
        NCOLS = pattern[0].length;
        BRICKHEIGHT = 30;
        BRICKWIDTH = WIDTH / NCOLS - (PADDING + 1);
    
        bricks = new Array(NROWS);
        for (let i = 0; i < NROWS; i++) {
          bricks[i] = new Array(NCOLS);
          for (let j = 0; j < NCOLS; j++) {
            if (pattern[i][j] === 1) {
              maxTocke++;
              bricks[i][j] = Math.floor(Math.random() * 2) + 1; // normal or strong brick
              if (bricks[i][j] == 2)
                maxTocke++;
            } else {
              bricks[i][j] = 0; // empty space
            }
          }
        }
      }
    }


  function timer() {
    if (start) {
      sekunde++;

      sekundeI = (sekundeI = sekunde % 60) > 9 ? sekundeI : "0" + sekundeI;
      minuteI =
        (minuteI = Math.floor(sekunde / 60)) > 9 ? minuteI : "0" + minuteI;
      izpisTimer = minuteI + ":" + sekundeI;

      $("#cas").html(izpisTimer);
    } else {
      sekunde = 0;
      izpisTimer = "00:00";
      $("#cas").html(izpisTimer);
    }
  }

  function setBestScore(){
    if(tocke > bestScore){
      newBestScore = true;
      bestScore = tocke;
    }else{
      newBestScore = false;
    }
    $("#bestScore").html(bestScore);
    
  }

  function resetBestScore(){
    bestScore = 0;
    $("#bestScore").html(bestScore);
  }


  function reset() {
    x = 400;
    y = 660;
    var selectElement = document.getElementById('difficulty');
    var selectedValue = selectElement.value;
    if (selectedValue === "easy") dy = 4;
    else if (selectedValue === "medium") dy = 5;
    else if (selectedValue === "hard") dy = 6;
    dx = 0;

    tocke = 0;
    sekunde = 0;
    izpisTimer = "00:00";
    $("#tocke").html(tocke);
    $("#cas").html(izpisTimer);

    start = false;
    paused = true;
    clearInterval(intervalId);
    clearInterval(initTimer);
    init_paddle();
    initbricks();
    draw();
    document.getElementById("btnStart").disabled = false;
    document.getElementById("btnPause").disabled = true;
    document.getElementById("btnEnd").disabled = true;
    document.getElementById("btnReset").disabled = false;
    document.getElementById("difficulty").disabled = false;
  }
  
  function victory(){
    setBestScore();
    if(newBestScore)
      text='Congratulations! New best score:'+tocke;
    else
      text='Congratulations! Your score:'+tocke;
    
    setTimeout(function() {
      clearInterval(intervalId);
      clearInterval(initTimer);
    }, 10);
    swal({
      title: 'You win:',
      text: text,
      icon: 'success',
      button: {
        text: 'OK',
      }
    }).then(() => {
      reset(); // Reset the game after clicking OK
    });
  }


  function game_over() {
    clearInterval(intervalId);
    clearInterval(initTimer);
    setBestScore();
    if(newBestScore)
      text='New best score:'+tocke;
    else
      text='Your score:'+tocke;

    swal({
      title: 'Game over:',
      text: text,
      icon: 'error',
      button: {
        text: 'OK',
      }
    }).then(() => {
      reset(); // Reset the game after clicking OK
    });
  }

  
  function start2(){
    initTimer = setInterval(timer, 1000);
    intervalId = setInterval(draw, 10);
  }

  function pavza(){
    paused = !paused;
    if(paused){
      clearInterval(initTimer);
      clearInterval(intervalId);
    }
    else{
      start2();
    }
  }

  function start_game(){
    paused = false;
    start = true;
    document.getElementById("btnStart").disabled = true;
    document.getElementById("btnPause").disabled = false;
    document.getElementById("btnEnd").disabled = false;
    document.getElementById("btnReset").disabled = true;
    document.getElementById("difficulty").disabled = true;
    start2();
  }

  document.getElementById('btnStart').addEventListener('click', function() {
    start_game(); // Call the inner function on button click
  });

  document.getElementById('btnPause').addEventListener('click', function() {
    pavza(); // Call the inner function on button click
  });

  document.getElementById('btnEnd').addEventListener('click', function() {
    game_over(); // Call the inner function on button click
  });

  document.getElementById('btnReset').addEventListener('click', function() {
    resetBestScore(); // Call the inner function on button click
  });

  document.getElementById('difficulty').addEventListener('change', function() {
    var selectElement = document.getElementById('difficulty');
    var selectedValue = selectElement.value;

    // Set variables depending on difficulty
    if (selectedValue === "easy") {
      dy = 4;
      paddlew = 150;
      maxTocke = 20;
    } else if (selectedValue === "medium") {
      dy = 5;
      paddlew = 100;
      maxTocke = 35;
    } else if (selectedValue === "hard") {
      dy = 6;
      paddlew = 80;
    }
    init_paddle();
    initbricks();
    draw(); // Optionally, redraw everything so it updates immediately
  });

}

function vizitka(){
  swal({
      title: 'Made by:',
      text: 'Tadej Bensa 4. RB',
      icon: 'info',
      button: {
          text: 'OK',
      }
  });
}

