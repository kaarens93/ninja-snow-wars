var express = require('express')
var app = express()
var server = app.listen(8000)
var path = require('path')
var io = require('socket.io')(server)
app.use('/static', express.static(__dirname+'/static'))


app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

var players = {
    playerOne: {
        name: '',
        x: 10, // left
        y: 200, // top
        snowballs: [],
        walkVal: 1,
        direction: 'down', 
        inventory: 20,
        score: 0,
    },
    playerTwo: {
        name: '',
        x: 735, // left
        y: 200, // top
        snowballs: [],
        walkVal: 1,
        direction: 'down', 
        inventory: 20,
        score: 0,
    },
    startGame: false,
};

io.on('connection', socket => {
    
    setInterval( () => {
        if (players.startGame) {
            var playerOne = players.playerOne;
            var playerTwo = players.playerTwo;

            for (var i = 0; i < playerOne.snowballs.length; i++) {
                var snowball = playerOne.snowballs[i];
                snowball.x += 2;
                // remove snowballs that go off screen
                if (snowball.x > 750) {
                    playerOne.snowballs.splice(i, 1);
                }
                // check if player 1's snowballs collide with player 2
                if ((playerTwo.x + 58 > snowball.x) && (playerTwo.y + 86 > snowball.y) && (snowball.y + 46 > playerTwo.y) && (playerTwo.x < snowball.x + 46)) {
                    playerOne.snowballs.splice(i, 1);
                    console.log(`player 2 has been hit; player1: ${playerOne.score} - player2: ${playerTwo.score}`);
                    playerTwo.score -= 10;
                    playerOne.score += 5;
                }
            }
            for (var i = 0; i < playerTwo.snowballs.length; i++) {
                var snowball = playerTwo.snowballs[i];
                snowball.x -= 2;
                if (snowball.x < 50) {
                    playerTwo.snowballs.splice(i, 1);
                }
                if ((playerOne.x + 58 > snowball.x) && (playerOne.y + 86 > snowball.y) && (snowball.y + 46 > playerOne.y) && (playerOne.x < snowball.x + 46)) {
                    playerTwo.snowballs.splice(i, 1);
                    console.log(`player 1 has been hit; player1: ${playerOne.score} - player2: ${playerTwo.score}`);
                    playerOne.score -= 10;
                    playerTwo.score += 5;
                }     
            }
            io.sockets.emit('state', players);
        }

    }, 1000/60);

    socket.on('enterPlayer1', data => {
        players.playerOne.name = data;
        socket.broadcast.emit('enablePlayer2', players.playerOne.name);
    })

    socket.on('enterPlayer2', data => {
        players.playerTwo.name = data;
        players.startGame = true;
        io.sockets.emit('hideForms')
    })

    socket.on('movement', data => {

        var playerOne = players.playerOne;
        var playerTwo = players.playerTwo;

        if (data.upP1 && playerOne.y > 10) {
            playerOne.y -= 5;
            playerOne.direction = 'top';
            playerOne.walkVal = data.walkP1;
        }
        if (data.downP1 && playerOne.y < 410) {
            playerOne.y += 5;
            playerOne.direction = 'down';
            playerOne.walkVal = data.walkP1;
        }
        if (data.upP2 && playerTwo.y > 10) {
            playerTwo.y -= 5;
            playerTwo.direction = 'top';
            playerTwo.walkVal = data.walkP2;
        }
        if (data.downP2 && playerTwo.y < 410) {
            playerTwo.y += 5;
            playerTwo.direction = 'down';
            playerTwo.walkVal = data.walkP2;
        }
    });

    socket.on('throwP1Snowball', data => {
        players.playerOne.snowballs.push(data);
        players.playerOne.inventory--;
    });

    socket.on('throwP2Snowball', data => {
        players.playerTwo.snowballs.push(data);
        players.playerTwo.inventory--;
    });

})

// 1. ask client for name and store user input into 'var name'
// 2. client emits 'sign_in' and passes 'name' to server
// 3. server listens for 'sign_in' and broadcasts 'new_player', stores name/sessionid of new player into 'var players', emits 'current_players' with all players data to new player
// 4. client listens for 'new_player' and emits 'movement' and passes 'move' to server
// 5. server listens for 'movement' and broadcasts 'change_position', store move 