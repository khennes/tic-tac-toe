(function() {
    'use strict';

    // define globals - gamestate should stay local?
    var game = false,
        currentPlayer,
        gamestate = ['-', '-', '-', '-', '-', '-', '-', '-', '-'],
        movesMade = {
            'O': [],
            'X': []
        },
        gameboard = document.getElementById('gameboard'),
        userMessage = document.getElementById('message');

    userMessage.innerHTML = "Click 'Play game' to start.";


    // HELPER FUNCTIONS //

    // computer will pseudorandomly choose a corner square to start 
    function seedBoard() {
        var randomDiv = Math.floor(Math.random()*3),
            firstMove;
        if (randomDiv === 0) {
            firstMove = document.getElementById('s0');
        } else if (randomDiv === 1) {
            firstMove = document.getElementById('s2');
        } else if (randomDiv === 2) {
            firstMove = document.getElementById('s6');
        } else if (randomDiv === 3) {
            firstMove = document.getElementById('s8');
        }
        playSquare(firstMove);
    }

    // return array of available moves
    function getOpenSquares() {
        var openSquares = [];
        for (var i = 0; i < gamestate.length; i++) {
            if (gamestate[i] === "-") {
                openSquares.push(i);
            }
        }
        if (openSquares.length === 0) {
             endGame();
        } else {
            return openSquares;
        }
    }

    // begin checking for wins after players have taken at least 3 turns
    function checkWinner() {
        var winningTriplets = [ [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
                            [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6] ];
        for (var i = 0; i < winningTriplets.length; i++) {
            if (movesMade['O'].sort.contains(winningTriplets[i])) {
                return 'computer';
            } else if (movesMade['X'].sort.contains(winningTriplets[i])) {
                return 'user';
            }
        }
        console.log("No winners yet. Keep playing!");
        return 'none';
    } 

    // print currentPlayer's next move to the gameboard
    function playSquare(nextMove) {
        var moveIndex = nextMove.id.replace('s', '');
        if (game === true && currentPlayer === 'user') {
            nextMove.innerHTML = 'X';
            gamestate[moveIndex] = 'X';
            movesMade['X'].push(moveIndex);
            if (movesMade['X'].length >= 3) checkWinner();
            currentPlayer = 'computer';
        } else if (game === true && currentPlayer === 'computer') {
            nextMove.innerHTML = 'O';
            gamestate[moveIndex] = 'O';
            movesMade['O'].push(moveIndex);
            if (movesMade['O'].length >= 3) checkWinner();
            currentPlayer = 'user';
        }
    }

    // allow user to reset game by clicking "Restart"
    var restartButton = document.getElementById('restart');
    restartButton.addEventListener('click', function(e) {
        if (game === true) {
            game = false;    
            console.log("Restarting!");

            // clear the gameboard
            gamestate = ['-', '-', '-', '-', '-', '-', '-', '-', '-'];
            movesMade = {
                'O': [],
                'X': []
            };
            for (var i = 0; i < gameboard.childNodes.length; i++) {
                gameboard.childNodes[i].innerHTML = "";
            }
            userMessage.innerHTML = "Click 'Play game' to start";
        }
    });

    // report game result to user
    function endGame() {
        var endGameMessage,
            winner = checkWinner();
        game = false;
        if (winner !== 'none') {
            if (winner === 'computer') {
                endGameMessage = "You lose.";
            } else if (winner === 'user') {
                endGameMessage = "You win!";
            } 
        } else {
            endGameMessage = "It's a draw.";
        }
        userMessage.innerHTML = "Game over! " + endGameMessage;
    }
 

    // TAKING TURNS //

    // start game when user clicks "Play game"
    var playButton = document.getElementById('play');
    playButton.addEventListener('click', function(e) {
        if (game === false) {
            game = true;
            currentPlayer = 'computer';
            console.log("New game starting!");
            userMessage.innerHTML = "";
            window.setTimeout(seedBoard, 400);
        }
    });

    // event delegation (to listen for user's turns)
    gameboard.addEventListener('click', function(e) {
        if (e.target && currentPlayer === 'user') {
            userMessage.innerHTML = "";
            var nextMove = document.getElementById(e.target.id),
                openSquares = getOpenSquares(gamestate),
                moveIndex = nextMove.id.replace('s', '');
            if (gamestate[moveIndex] !== '-') {
                userMessage.innerHTML = "That square's taken!";
            } else {
                playSquare(nextMove);
            }
        }
    });

    
    // NEGAMAX //

    // calculate computer's next move
    function computerNextMove(gamestate) {
        openSquares = getOpenSquares(gamestate);
        console.log("Available moves: " + openSquares);
        var maxDepth = 6,
            winner = getWinner();
    }

    function negamax(gamestate, maxDepth) {
        if (depth === 0) {
            return evaluate();
        }
        openSquares = getOpenSquares(gamestate);
        max = -1000000

        // calculate utility of each free square on the board
        for (var i = 0; i < openSquares.length; i++) {
            gamestateCopy = gamestate;
            var score = -negamax(gamestateCopy, depth - 1);
            if (score > max) {
                max = score;
            }
        return max;
        }
    }

    function evaluate() {}
}())
