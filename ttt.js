(function() {
    'use strict';

    var game = false,
        currentPlayer,
        gameState = {
            'O': [],
            'X': []
        }
        gameboard = document.getElementById('gameboard'),
        userMessage = document.getElementById('message'),

        // list of possible winning threes-in-a-row
        winningTriplets = [ [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
                            [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6] ];

    userMessage.innerHTML = "Click 'Play game' to start.";


    // HELPER FUNCTIONS //

    // return array of available moves -- where is gameState used??
    function getOpenSquares(gameState) {
        var openSquares;
        for (var i = 0; i < gameboard.childNodes.length; i++) {
            if (gameboard.childNodes[i] === "") {
                openSquares.push(childNodes[i]);
            }
        }
        if (openSquares.length === 0) {
            return endGame();
        }
        return openSquares;
    }

    // begin checking for wins after players have taken at least 3 turns
    function checkWinner(gameState) {} 


    // report game result to user
    function endGame() {
        var endGameMessage,
            winner = checkWinner();
        game = false;
        if (winner === 'computer') {
            endGameMessage = "You lose.";
        } else if (winner === 'user') {
            endGameMessage = "You win!";
        } else {
            endGameMessage = "It's a draw.";
        }
        userMessage.innerHTML = "Game over! " + endGameMessage;
    }
    
    // allow user to reset game by clicking "Restart"
    function clearBoard() {
        var restartButton = document.getElementById('restart');
        restartButton.addEventListener('click', function(e) {
            if (game === true) {
                game = false;    
                console.log("Restarting!");

                // clear the gameboard
                for (var i = 0; i < gameboard.childNodes.length; i++) {
                    gameboard.childNodes[i].innerHTML = "";
                }
                userMessage.innerHTML = "Click 'Play game' to start";
            }
        }
    }


    // TAKING TURNS //

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
        firstMove.innerHTML = 'O';
        gameState[randomDiv] = 'O';
        currentPlayer = 'user';
    }

    // start game when user clicks "Play game"
    function startGame() {
        var playButton = document.getElementById('play');
        playButton.addEventListener('click', function(e) {
            if (game === false) {
                game = true;
                console.log("New game starting!");
                userMessage.innerHTML = "";
                for (var i = 0; i < gameboard.childNodes.length; i++) {
                    gameState.push("-");
                }
                window.setTimeout(seedBoard, 400);

                // event delegation (to listen for user's turns)
                gameboard.addEventListener('click', function(e) {
                    if (e.target && currentPlayer === 'user') {
                        userMessage.innerHTML = "";
                        var nextMove = document.getElementById(e.target.id),
                            openSquares = getOpenSquares(gameState);
                        if (!(nextMove in openSquares) {
                            userMessage.innerHTML = "That square's taken!";
                        } else {
                            playSquare(nextMove);
                        }
                    }
                });
            }
        }
    }

    // print currentPlayer's next move to the gameboard
    function playSquare(nextMove) {
        var moveIndex = nextMove.replace('s', '');
        if (game === true && currentPlayer === 'user') {
            nextMove.innerHTML = 'X';
            gameState[moveIndex] = 'X';
            currentPlayer = 'computer';
        } else if (game === true && currentPlayer === 'computer') {
            nextMove.innerHTML = 'O';
            gameState[moveIndex] = 'O';
            currentPlayer = 'user';
        }
    }


    // NEGAMAX //

    // calculate computer's next move
    function computerNextMove(gameState) {
        openSquares = getOpenSquares(gameState);
        console.log("Available moves: " + openSquares);
        var maxDepth = 6,
            winner = getWinner();
    }

    function negamax(depth) {
        if (depth === 0) {
            return evaluate();
        }
        openSquares = getOpenSquares(gameState);
        max = -1000000

        // calculate utility of each free square on the board
        for (var i = 0; i < openSquares.length; i++) {
            var score = -negamax(depth - 1);
            if (score > max) {
                max = score;
            }
        return max;
        }
    }
}())
