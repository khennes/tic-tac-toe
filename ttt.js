// one giant function wrapper to avoid global variables
(function() {
    'use strict';
    var gamestate = false,
        compMoves,
        userMoves,
        numMoves,  // probably a nicer way to do this
        lastMove,  // to keep track of who made the last move
        message = document.getElementById('message'),  // print messages to user
        playButton = document.getElementById('play'),
        restartButton = document.getElementById('restart'),
        gameboard = document.getElementById('gameboard'),
        squaresPlayed = {
            'X': [],
            'O': []
        },

        // list of possible winning threes-in-a-row
        winningTriplets = [ [1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 4, 7],
                                 [2, 5, 8], [3, 6, 9], [1, 5, 9], [3, 5, 7] ];

    message.innerHTML = "Click 'Play game' to start.";

    // computer makes first move (pseudorandomly seed board)
    function seedBoard() {
        gamestate = true;
        var randomDiv = Math.floor(Math.random()*9)+1;
        var firstMove = document.getElementById('sq' + randomDiv);
        firstMove.innerHTML = 'O';
        compMoves++;
        squaresPlayed['O'].push(randomDiv);
        lastMove = 'computer';
    }

    // begin game when user clicks "Play game"
    function startGame() {
        seedBoard();
        // event delegation: add eventListener to parent div
        message.innerHTML = "";
        gameboard.addEventListener('click', function(e){
            if (e.target && lastMove === 'computer') {
                var nextMove = document.getElementById(e.target.id);
                if (nextMove.innerHTML === "") {
                    playSquare(nextMove);
                } else {
                    message.innerHTML = "Sorry, looks like that square is taken.";
                }
            }
        });
    }

    function endGame() {
        var endGameMessage;
        if (squaresPlayed['O'].sort in winningTriplets) {
            endGameMessage = "Computer wins";
        } else if (squaresPlayed['X'].sort in winningTriplets) {
            endGameMessage = "You win!";
        }
        // if a tie
        endGameMessage = "...and it's a tie. Boring.";
        message.innerHTML = "Game over! " + endGameMessage;
    }

    // allow user to reset board
    function clearBoard() {
        console.log("Starting new game!");
        gamestate = false;    
        compMoves = 0;
        userMoves = 0;

        squaresPlayed = {
            'X': [],
            'O': []
        };

        message.innerHTML = "Click 'Play game' to start";

        // clear the gameboard
        for (var i = 0; i < gameboard.childNodes.length; i++) {
            i.innerHTML = "";
        }
    }

    // button handlers
    if (gamestate === false) {
        playButton.onclick = startGame;
    }
    if (gamestate === true) {
        restartButton.onclick = clearBoard;
    }

    // print X to board
    function playSquare(nextMove) {
        if (gamestate === true) {
            console.log("You clicked: " + nextMove.id);
            nextMove.innerHTML = 'X';
            squaresPlayed['X'].push(nextMove.id);
            userMoves++;
            lastMove = 'user';
        }
    }
}())
