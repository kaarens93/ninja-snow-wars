var socket = io();
var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 500;
var ctx = canvas.getContext('2d');

var player = 0;
var players = {};

socket.on('state', data => {
    players = data;
    ctx.clearRect(0, 0, 800, 500);
    var playerOne = players.playerOne;
    var playerTwo = players.playerTwo;
    var imgPlayerOne = new Image();
    var imgPlayerTwo = new Image();
    var imgSnowball = new Image();
    imgPlayerOne.src = '/static/images/' + playerOne.direction + playerOne.walkVal + '.png';
    imgPlayerTwo.src = '/static/images/' + playerTwo.direction + playerTwo.walkVal + '.png';
    imgSnowball.src = '/static/images/snowball.png';

    ctx.drawImage(imgPlayerOne, playerOne.x, playerOne.y, 58, 86);
    ctx.drawImage(imgPlayerTwo, playerTwo.x, playerTwo.y, 58, 86);
  
    for (var i = 0; i < playerOne.snowballs.length; i++) {
        var snowball = playerOne.snowballs[i];
        console.log('player1 snowball: ' + snowball);
        ctx.drawImage(imgSnowball, snowball.x, snowball.y, 47, 47);
    }
    for (var i = 0; i < playerTwo.snowballs.length; i++) {
        var snowball = playerTwo.snowballs[i];
        console.log('player2 snowball: ' + snowball);
        ctx.drawImage(imgSnowball, snowball.x, snowball.y, 47, 47);
    }
    showScore();
    showInventory();

});

function showScore(){
    content = `<div>${players.playerOne.name}: ${players.playerOne.score}</div>
    <div>${players.playerTwo.name}: ${players.playerTwo.score}</div>`
    document.getElementById('scoreboard').innerHTML = content;
}
function showInventory(){
    content = `<div>${players.playerOne.name}: ${players.playerOne.inventory}</div>
    <div>${players.playerTwo.name}: ${players.playerTwo.inventory}</div>`
    document.getElementById('inventory').innerHTML = content; 
}

$('#player1_form').submit( () => {
    var name = $('input[name=player1_name]').val();
    player = 1;
    socket.emit('enterPlayer1', name);
    return false;
});

socket.on('enablePlayer2', data => {
    // enables player 2 form
    content = `<input type="text" name='player2_name'>
    <input type="submit" value='play'>`
    $('#disableP2').html(content)

    // disables player 1 form
    html = `<input type="text" disabled value=${data}>
    <input type="submit" disabled value='play'>`
    $('#disableP1').html(html)
})

$('#player2_form').submit( () => {
    var name = $('input[name=player2_name]').val();
    player = 2;
    socket.emit('enterPlayer2', name);
    return false;
});

socket.on('hideForms', () => {
    $('#forms').html('<div></div>');
})

var movement = {
    upP1: false,
    downP1: false,
    shootP1: false,
    walkP1: 1,
    upP2: false,
    downP2: false,
    shootP2: false,
    walkP2: 1,
}

document.addEventListener('keydown', event => {

    var playerOne = players.playerOne;
    var playerTwo = players.playerTwo;
    
    if (player == 1) {
    
        if (movement.walkP1 == 1) {
            movement.walkP1 = 2;
        } else {
            movement.walkP1 = 1;
        }
        // if (playerOne.walkVal == 1) {
        //     playerOne.walkVal = 2;
        // } else {
        //     playerOne.walkVal = 1;
        // }

        if (event.keyCode == 38) {
            movement.upP1 = true;
        }
        if (event.keyCode == 40) {
            movement.downP1 = true;
        }
        if (event.keyCode == 32 && !movement.shootP1) {
            event.preventDefault();
            movement.shootP1 = true;
            socket.emit('throwP1Snowball', {x: playerOne.x + 60, y: playerOne.y + 20});
        }
        
    } else if (player == 2) {

        if (movement.walkP2 == 1) {
            movement.walkP2 = 2;
        } else {
            movement.walkP2 = 1;
        }
        // if (playerTwo.walkVal == 1) {
        //     playerTwo.walkVal = 2;
        // } else {
        //     playerTwo.walkVal = 1;
        // }

        if (event.keyCode == 38) {
            movement.upP2 = true;
        }
        if (event.keyCode == 40) {
            movement.downP2 = true;
        }
        if (event.keyCode == 32) {
            event.preventDefault();
            movement.shootP2 = true;
            socket.emit('throwP2Snowball', { x: playerTwo.x - 50, y: playerTwo.y + 20 })
        }
    }
});

document.addEventListener('keyup', event => {

    if (player == 1) {
        if (event.keyCode == 38) {
            movement.upP1 = false;
        }
        if (event.keyCode == 40) {
            movement.downP1 = false;
        }
        if (event.keyCode == 32) {
            movement.shootP1 = false;
        }

    } else if (player == 2) {
        if (event.keyCode == 38) {
            movement.upP2 = false;
        }
        if (event.keyCode == 40) {
            movement.downP2 = false;
        }
        if (event.keyCode == 32) {
            movement.shootP2 = false;
        }

    }
});

setInterval( () => {

    if (players.startGame) {
        socket.emit('movement', movement);
    }

}, 1000/60);
