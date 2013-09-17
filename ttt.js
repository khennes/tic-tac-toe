(function() {
    'use strict';

    // define globals
    var game = false,
        currentPlayer,
        movesMade = {
            'O': [],
            'X': []
        },

        // represent current state of gameboard with 'X', 'O', and '-'
        gamestate = ['-', '-', '-', '-', '-', '-', '-', '-', '-'],
        gameboard = document.getElementById('gameboard'),
        userMessage = document.getElementById('message');

    userMessage.innerHTML = "Click 'Play game' to start.";


    // HELPER FUNCTIONS //

    // computer will pseudorandomly choose a corner square to start 
    function seedBoard() {
        console.log("Seeding the board...");
        var randomCorner = Math.floor(Math.random()*3),
            corners = {
                0: 's0',
                1: 's2',
                2: 's6',
                3: 's8'
            },
            firstMove = document.getElementById(corners[randomCorner]);
        makeMove(firstMove);
    }

    // return array of available moves (if none, end game)
    function getOpenSquares(currentGamestate) {
        console.log("Checking for open squares...");
        var openSquares = [];
        for (var i = 0; i < currentGamestate.length; i++) {
            if (currentGamestate[i] === "-") {
                openSquares.push(i);
            }
        }
        return openSquares;
    }

    // begin checking for wins after players have taken at least 3 turns
    function checkWinner() {
        console.log("Checking if we have a winner...");
        var winner,
            possibleWins = [ [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
                            [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6] ];
        for (var i = 0; i < possibleWins.length; i++) {
            if (possibleWins[i] in movesMade['O'].sort) {
                game = false;
                winner = 'computer';
            } else if (possibleWins[i] in movesMade['X'].sort) {
                game = false;
                winner = 'user';
            } else winner = 'none';
        }
        return winner;
    } 

    // print currentPlayer's next move to the gameboard
    function makeMove(nextMove) {
        console.log("Making a move...");
        var moveIndex = nextMove.id.replace('s', '');
        if (game === true && currentPlayer === 'user') {
            nextMove.innerHTML = 'X';
            gamestate[moveIndex] = 'X';
            movesMade['X'].push(moveIndex);
            if (movesMade['X'].length >= 3) {
                var winner = checkWinner();
                if (winner !== 'none') endGame();
            }
            currentPlayer = 'computer';
            computerNextMove();
        } else if (game === true && currentPlayer === 'computer') {
            nextMove.innerHTML = 'O';
            gamestate[moveIndex] = 'O';
            movesMade['O'].push(moveIndex);
            if (movesMade['O'].length >= 3) {
                var winner = checkWinner();
                if (winner !== 'none') endGame();
            }
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
        console.log("Ending the game...");
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
            if (openSquares.length === 0) endGame();
            if (gamestate[moveIndex] !== '-') {
                userMessage.innerHTML = "That square's taken!";
            } else {
                makeMove(nextMove);
            }
        }
    });

    
    // NEGAMAX //

    // calculate computer's next move
    function computerNextMove() {
        console.log("Calculating computer's next move...");
        var maxDepth = 8,
            openSquares = getOpenSquares(gamestate),
            player = 'computer',
            bestScore = {
                'val': -9999
            };
        console.log("GAMESTATE: " + gamestate);
        if (openSquares.length === 0) endGame();
        for (var i = 0; i < openSquares.length; i++) {
            var gamestateCopy = gamestate;  // make a local copy of the gamestate
            gamestateCopy[i] = 'O';
            movesMade['O'].push(openSquares[i]);
            var score = negamax(gamestateCopy, maxDepth, 'user');
            console.log("SCORE: " + score);
            gamestateCopy[i] = '-';
            movesMade['O'].pop();
            if (score > bestScore['val']) {
                bestScore['val'] = score;
                bestScore['square'] = openSquares[i];
            }
        }
        console.log("Best score: " + bestScore['val'] + ", " + bestScore['square']);
        var bestMove = document.getElementById('s' + bestScore['square']);
        makeMove(bestMove);
    }

    // calculate utility of each free square on the board
    // player is either 1 (computer) or -1 (user)
    function negamax(gamestateCopy, depth, player) {
        console.log("Negamaxing!");
        var max = -1000000,
            possibleMoves = [];

        // getOpenSquares(), passing in speculative gamestate
        possibleMoves = getOpenSquares(gamestateCopy);
        console.log("Possible moves: " + possibleMoves);

        // base case: if there are no plies left to explore (no open squares)
        if (possibleMoves.length === 0 || depth === 0) {
            console.log("At base case, done recursing.");
            var winner = checkWinner();
            if (winner === 'computer') return 1;
            else if (winner === 'user') return -1;
            else if (winner === 'none') return 0;
        }

        if (player === 'user') {
            player = 'computer';
        } else player = 'user';

        console.log("PLAYER IS " + player);

        // otherwise, recurse
        for (var i = 0; i < possibleMoves.length; i++) {
            var newGamestate = gamestateCopy;
            if (player === 'user') {
                newGamestate[possibleMoves[i]] = 'X';
                movesMade['X'].push(possibleMoves[i]);
            } else if (player === 'computer') {
                newGamestate[possibleMoves[i]] = 'O';
                movesMade['O'].push(possibleMoves[i]);
            } else console.log("WTF is player, then?");
            console.log("Gamestate: " + newGamestate);
            var bestScore = -negamax(newGamestate, depth - 1, player);
            newGamestate[possibleMoves[i]] = '-';
            if (player === 'user') movesMade['X'].pop();
            else if (player === 'computer') movesMade['O'].pop();
            if (bestScore > max) {
                max = bestScore;
            }
        return max;
        }
    }
}())
