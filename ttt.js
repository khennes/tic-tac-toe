(function() {
    'use strict';

    // define globals 
    var game,
        currentPlayer,
        gamestate,
        movesMade,
        gameboard = document.getElementById('gameboard'),
        userMessage = document.getElementById('message');

    (function initialize() {
        console.log("Initializing!");
        game = false;
        movesMade = {
            'O': [],
            'X': []
        };

        // represent current state of gameboard with 'X', 'O', and '-'
        gamestate = ['-', '-', '-', '-', '-', '-', '-', '-', '-'];
        userMessage.innerHTML = "Click 'Play game' to start";

        // clear the gameboard element
        for (var i = 0; i < gameboard.childNodes.length; i++) {
            gameboard.childNodes[i].innerHTML = "";
        }
    }())
    

    // HELPER FUNCTIONS //

    // computer pseudorandomly chooses a corner or middle square to start 
    function seedBoard() {
        console.log("Seeding the board...");
        var randomCorner = Math.floor(Math.random()*4),
            corners = {
                0: 's0',
                1: 's2',
                2: 's4',
                3: 's6',
                4: 's8'
            },
            firstMove = document.getElementById(corners[randomCorner]);
        makeMove('computer', firstMove);
        currentPlayer = 'user';
    }

    // return array of available moves
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

    // check for winning combinations 
    function checkWinner() {
        console.log("Checking if we have a winner...");
        console.log("X: " + movesMade['X'] + ", O: " + movesMade['O']);
        var winner,
            possibleWins = [ [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
                            [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6] ];

        for (var i = 0; i < possibleWins.length; i++) {
            if (possibleWins[i] in movesMade['O'].sort) {
                return 'computer';
            } else if (possibleWins[i] in movesMade['X'].sort) {
                return 'user';
            }
        }
    } 

    // print currentPlayer's next move to the gameboard;
    // check for wins after a player has taken at least 3 turns
    function makeMove(player, nextMove) {
        console.log("Making a move...");
        var moveIndex = nextMove.id.replace('s', '');
        console.log("Global gamestate not updating! What is moveIndex? " + moveIndex);
        if (player === 'user') {
            nextMove.innerHTML = 'X';
            gamestate[moveIndex] = 'X';
            movesMade['X'].push(moveIndex);
            if (movesMade['X'].length >= 3) {
                var winner = checkWinner();
                if (winner) endGame();
            }
        } else if (player === 'computer') {
            nextMove.innerHTML = 'O';
            gamestate[moveIndex] = 'O';
            movesMade['O'].push(moveIndex);
            if (movesMade['O'].length >= 3) {
                var winner = checkWinner();
                if (winner) endGame();
            }
        }
    }

    // undo moves (for negamax speculative gameboards)
    function undoMove(player, lastMove) {
        console.log("Undoing last move...");
        var moveIndex = lastMove.id.replace('s', '');
        lastMove.innerHTML = '';
        gamestate[moveIndex] = '-';
        if (game === true && player === 'user') {
            movesMade['X'].pop();
        } else if (player === 'computer') {
            movesMade['O'].pop();
        }
        console.log("Gamestate: " + gamestate);
    }

    // allow user to reset game by clicking "Restart"
    var restartButton = document.getElementById('restart');
    restartButton.addEventListener('click', function(e) {
        if (game === true) {
            game = false;
            initialize();
            console.log("Restarting!");
        }
    });

    // report game result to user
    function endGame() {
        console.log("Ending the game...");
        var endGameMessage,
            winner = checkWinner();
        game = false;
        if (winner) {
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
                makeMove('user', nextMove);
                currentPlayer = 'computer';
                computerNextMove();
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
                'val': -1000000
            };
        console.log("GAMESTATE: " + gamestate);

        // if no empty squares, game is over
        if (openSquares.length === 0) endGame();

        console.log("Open squares: " + openSquares);
        for (var i = 0; i < openSquares.length; i++) {
            var gamestateCopy = gamestate;  // make a copy of the global gamestate
            gamestateCopy[i] = 'O';
            console.log("Compare gamestates: " + gamestate + "versus " + gamestateCopy);
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
        makeMove('computer', bestMove);
        console.log("Current gamestate after computer's move: " + gamestate);
        currentPlayer = 'user';
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
            console.log("WINNER: " + winner);
            if (winner === 'computer') return 1;
            else if (winner === 'user') return -1;
            else if (winner === 'none') return 0;
        }

        // toggle between players
        if (player === 'user') {
            player = 'computer';
        } else player = 'user';
        console.log("PLAYER IS " + player);

        // recurse!
        for (var i = 0; i < possibleMoves.length; i++) {
            var newGamestate = gamestateCopy;

            // mark speculative move on gameboard copy
            if (player === 'user') {
                newGamestate[possibleMoves[i]] = 'X';
                movesMade['X'].push(possibleMoves[i]);
            } else if (player === 'computer') {
                newGamestate[possibleMoves[i]] = 'O';
                movesMade['O'].push(possibleMoves[i]);
            } else console.log("WTF is player, then?");

            console.log("Gamestate: " + newGamestate);
            var bestScore = -negamax(newGamestate, depth - 1, player);

            // undo speculative move after recursing
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
