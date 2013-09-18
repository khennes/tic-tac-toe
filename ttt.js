(function() {
    'use strict';

    /**
     * Define global variables.
     **/

    var game = false,
        currentPlayer,
        gamestate,
        computer = 'O',
        user = 'X',
        movesMade = {},
        gameboard = document.getElementById('gameboard'),
        userMessage = document.getElementById('message'),
        possibleWins = [ [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
                        [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6] ],
        SQUARES = gameboard.childNodes.length;


    /**
     * Reset gameboard to initial (empty) state.
     **/

    (function initialize() {
        console.log("Initializing!");
        movesMade[computer] = [];
        movesMade[user] = [];

        // represent current state of gameboard with 'X', 'O', and '-'
        gamestate = ['-', '-', '-', '-', '-', '-', '-', '-', '-'];
        userMessage.innerHTML = "Click 'Play game' to start";

        // clear the gameboard DOM element
        for (var i = 0; i < gameboard.childNodes.length; i++) {
            gameboard.childNodes[i].innerHTML = "";
        }
    }())
    

    /**
     * HELPER FUNCTIONS 
     **/

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
        makeMove(computer, firstMove);
        currentPlayer = user;
    }

    // return array of available moves
    function getOpenSquares(currentGamestate) {
        console.log("Checking for open squares...");
        var i, openSquares = [];

        for (i = 0; i < SQUARES; i++) {
            if (currentGamestate[i] === "-") {
                openSquares.push(i);
            }
        }
        return openSquares;
    }

    // check for winning combinations 
    function checkWinner() {
        console.log("Checking if we have a winner...");
        console.log("X: " + movesMade[user] + ", O: " + movesMade[computer]);

        var i, WINS = possibleWins.length;

        for (i = 0; i < WINS; i++) {
            if (possibleWins[i] in movesMade[computer].sort()) {
                return computer;
            } else if (possibleWins[i] in movesMade[user].sort()) {
                return user;
            }
        }
    } 

    /**
     * Implement current player's move:
     * (1) Print to the gameboard DOM element
     * (2) Update global gamestate 
     * (3) Add square to player's list of moves made 
     *
     * If player has made at least 3 moves, check the gameboard
     * for a possible win.
     **/

    function makeMove(player, nextMove) {
        console.log("Making a move...");
        var moveIndex = nextMove.id.replace('s', '');
        if (player === user) {
            nextMove.innerHTML = user;
            gamestate[moveIndex] = user;
            movesMade[user].push(moveIndex);

            if (movesMade[user].length >= 3) {
                var winner = checkWinner();
                if (winner) endGame();
            }

        } else if (player === computer) {
            nextMove.innerHTML = computer;
            gamestate[moveIndex] = computer;
            movesMade[computer].push(moveIndex);

            if (movesMade[computer].length >= 3) {
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
        if (game === true && player === user) {
            movesMade[user].pop();
        } else if (player === computer) {
            movesMade[computer].pop();
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
            if (winner === computer) {
                endGameMessage = "You lose.";
            } else if (winner === user) {
                endGameMessage = "You win!";
            } 
        } else {
            endGameMessage = "It's a draw.";
        }
        userMessage.innerHTML = "Game over! " + endGameMessage;
    }
 

    /**
     * Taking turns
     **/

    // start game when user clicks "Play game"
    var playButton = document.getElementById('play');
    playButton.addEventListener('click', function(e) {
        if (game === false) {
            game = true;
            currentPlayer = computer;
            console.log("New game starting!");
            userMessage.innerHTML = "";
            window.setTimeout(seedBoard, 400);
        }
    });

    // event delegation (to listen for user's turns)
    gameboard.addEventListener('click', function(e) {
        if (e.target && currentPlayer === user) {
            userMessage.innerHTML = "";
            var nextMove = document.getElementById(e.target.id),
                openSquares = getOpenSquares(gamestate),
                moveIndex = nextMove.id.replace('s', '');
            if (openSquares.length === 0) endGame();

            if (gamestate[moveIndex] !== '-') {
                console.log("Square occupied by a: " + gamestate[moveIndex]);
                userMessage.innerHTML = "That square's taken!";
            } else {
                makeMove(user, nextMove);
                currentPlayer = computer;
                computerNextMove();
            }
        }
    });

    
    /**
     * Negamax algorithm
     * Calculate utility of each available square
     * and return the square with the highest score.
     **/

    function computerNextMove() {
        console.log("Calculating computer's next move...");
        var i,
            score,
            maxDepth = 8,
            openSquares = getOpenSquares(gamestate),
            OPEN = openSquares.length,
            player = computer,
            bestScore = {
                'val': -1000000,
                'square': 10
            },
            gamestateCopy = gamestate;  // make a copy of the global gamestate

        // if no empty squares, game is over
        if (OPEN === 0) endGame();

        console.log("Open squares: " + openSquares);
        for (i = 0; i < OPEN; i++) {

            // make speculative move
            gamestateCopy[i] = computer;
            movesMade[computer].push(openSquares[i]);

            // call negamax 
            score = negamax(gamestateCopy, maxDepth, computer);
            console.log("SCORE: " + score);

            // undo speculative move after recursing
            gamestateCopy[i] = '-';
            movesMade[computer].pop();
            
            if (score > bestScore['val']) {
                bestScore['val'] = score;
                bestScore['square'] = openSquares[i];
            }
        }
        bestMove = 's' + bestScore['square'],
        console.log("Best move for computer: " + bestMove);
        window.setTimeout(makeMove(computer, bestMove));
        currentPlayer = user;
    }

    // calculate utility of each free square on the board
    function negamax(gamestateCopy, depth, player) {
        console.log("Negamaxing!");
        var i,
            winner,
            max = -1000000,
            possibleMoves = [];

        // getOpenSquares(), passing in speculative gamestate
        possibleMoves = getOpenSquares(gamestateCopy);
        console.log("GamestateCopy: " + gamestateCopy);
        console.log("Possible moves: " + possibleMoves);
        
        var MOVES = possibleMoves.length;

        // base case: if there are no plies left to explore (no open squares)
        if (MOVES === 0 || depth === 0) {
            console.log("At base case, done recursing.");
            winner = checkWinner();
            console.log("WINNER: " + winner);
            if (winner === computer) return 1;
            else if (winner === user) return -1;
            else if (!winner) return 0;
        }

        // toggle between players
        if (player === user) {
            player = computer;
        } else player = user;
        console.log("PLAYER IS " + player);

        // recurse!
        for (i = 0; i < MOVES; i++) {
            // var newGamestate = gamestateCopy;

            // mark speculative move on gameboard copy
            if (player === user) {
                gamestateCopy[possibleMoves[i]] = user;
                movesMade[user].push(possibleMoves[i]);
                console.log("Adding to user's pile: " + possibleMoves[i]);
            } else if (player === computer) {
                gamestateCopy[possibleMoves[i]] = computer;
                movesMade[computer].push(possibleMoves[i]);
                console.log("Adding to computer's pile: " + possibleMoves[i]);
            }

            console.log("Gamestate: " + gamestateCopy);
            var bestScore = -negamax(gamestateCopy, depth - 1, player);

            // undo speculative move after recursing
            gamestateCopy[possibleMoves[i]] = '-';
            if (player === user) movesMade[user].pop();
            else if (player === computer) movesMade[computer].pop();

            if (bestScore > max) {
                max = bestScore;
            }
        console.log("Max: " + max);
        return max;
        }
    }
}())
