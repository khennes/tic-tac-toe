(function() {
    'use strict';

    /**
     * Define global variables.
     **/

    var i,
        game = false,
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
     * Define gameboard's initial (empty) state.
     **/

    (function initialize() {
        console.log("Initializing!");
        movesMade[computer] = [];
        movesMade[user] = [];

        // represent current state of gameboard with 'X', 'O', and '-'
        gamestate = ['-', '-', '-', '-', '-', '-', '-', '-', '-'];
        userMessage.innerHTML = "Click 'Play game' to start";

        // clear the gameboard DOM element
        for (i = 0; i < SQUARES; i++) {
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


    /**
     * Check for winners.
     * Loop through 8 possible winning "triplets" and check if any is contained
     * within User's or Computer's movesMade. 
     * To do this, make copies of movesMade[computer] and movesMade[user], passing
     * by value.
     **/

    function checkWinner() {
        console.log("Checking if we have a winner...");
        console.log("X: " + movesMade[user] + ", O: " + movesMade[computer]);

        var move, i, j,
            computerMoves = [],
            userMoves = [],
            COMPMOVES = movesMade[computer].length,
            USERMOVES = movesMade[user].length,
            WINS = possibleWins.length;

        // make copies of movesMade, passing by value, and sort
        for (move = 0; move < COMPMOVES; move++) {
            computerMoves.push(movesMade[computer][move]);
        }
        for (move = 0; move < USERMOVES; move++) {
            userMoves.push(movesMade[user][move]);
        }
        computerMoves.sort();
        userMoves.sort();

        // improve this
        for (i = 0; i < WINS; i++) {
            console.log("Triplet: " + possibleWins[i]);
            var count = 0;
            // var win = parseInt(possibleWins[i].join());
            if (computerMoves.indexOf(possibleWins[i][0]) !== -1) count++;
            else continue;
            if (computerMoves.indexOf(possibleWins[i][1]) !== -1) count++;
            else continue;
            if (computerMoves.indexOf(possibleWins[i][2]) !== -1) count++;
            else continue;
            if (count === 3) {
                console.log("Computer wins");
                return computer;
            }
        }
        for (i = 0; i < WINS; i++) {
            var count = 0;
            if (userMoves.indexOf(possibleWins[i][0]) !== -1) count++;
            else continue;
            if (userMoves.indexOf(possibleWins[i][1]) !== -1) count++;
            else continue;
            if (userMoves.indexOf(possibleWins[i][2]) !== -1) count++;
            else continue;
            if (count === 3) {
                console.log("User wins");
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

            if (gamestate[moveIndex] === '-') {
                makeMove(user, nextMove);
                currentPlayer = computer;
                computerNextMove();
            } else {
                console.log("Square occupied by a: " + gamestate[moveIndex]);
                userMessage.innerHTML = "That square's taken!";
            }
        }
    });

    
    /**
     * Negamax algorithm
     * Calculate utility of each available square
     * and return the square with the highest score.
     *
     * computerNextMove() calls negamax()
     **/

    function computerNextMove() {
        console.log("Calculating computer's next move...");
        var i,
            score,
            maxDepth = 8,
            openSquares = getOpenSquares(gamestate),
            OPEN = openSquares.length,
            player,
            bestMove,
            bestScore = {
                'val': -1000000,
            },
            gamestateCopy;

        // if no empty squares, game is over
        if (OPEN === 0) {
            endGame();
        } else {
            gamestateCopy = gamestate;  // make local copy of global gamestate
            for (i = 0; i < OPEN; i++) {

                // make speculative move
                gamestateCopy[openSquares[i]] = computer;
                console.log("Open squares: " + openSquares);
                console.log("Gamestate copy after first speculative move: " + gamestateCopy);
                movesMade[computer].push(openSquares[i]);
                console.log("MAIN LOOP. What square am I pushing to movesMade? " + openSquares[i]);
                console.log("MAIN LOOP. Computer's moves made: " + movesMade[computer]);

                // call negamax 
                score = negamax(gamestateCopy, maxDepth, computer);
                console.log("MAIN LOOP. score: " + score);

                // undo speculative move after recursing
                gamestateCopy[openSquares[i]] = '-';
                var pop = movesMade[computer].pop();
                console.log("MAIN LOOP. pop: " + pop);
                
                if (score > bestScore['val']) {
                    bestScore['val'] = score;
                    bestScore['square'] = openSquares[i];
                }
            }
            bestMove = document.getElementById('s' + bestScore['square']);
            console.log("bestMove: " + bestMove);
            makeMove(computer, bestMove);  // add delay of 400 here
            currentPlayer = user;
        }
    }

    // calculate utility of each free square on the board
    function negamax(gamestateCopy, depth, player) {
        console.log("Negamaxing!");
        var i,
            winner,
            max = -1000000,
            possibleMoves = [],
            MOVES;

        // getOpenSquares(), passing in speculative gamestate
        possibleMoves = getOpenSquares(gamestateCopy);
        console.log("Possible moves: " + possibleMoves);
        console.log("GamestateCopy after calculating open squares: " + gamestateCopy);
        
        MOVES = possibleMoves.length;

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
                // console.log("Move: " + possibleMoves[i]);
                movesMade[user].push(possibleMoves[i]);
                // console.log("User's moves made: " + movesMade[user]);
                // console.log("Speculative gamestate: " + gamestateCopy);
            } else if (player === computer) {
                gamestateCopy[possibleMoves[i]] = computer;
                movesMade[computer].push(possibleMoves[i]);
                // console.log("Computer's moves made: " + movesMade[computer]);
                // console.log("Speculative gamestate: " + gamestateCopy);
            }

            var bestScore = -negamax(gamestateCopy, depth - 1, player);

            // undo speculative move after recursing
            gamestateCopy[possibleMoves[i]] = '-';
            if (player === user) {
                // console.log("User's stack: " + movesMade[user]);
                var popc = movesMade[user].pop();
                // console.log("Pop from user's stack: " + popc);
                // console.log("User's stack post-pop: " + movesMade[user]);
            } else if (player === computer) {
                // console.log("Computer's stack: " + movesMade[computer]);
                var popu = movesMade[computer].pop();
                // console.log("Pop: " + popu);
                // console.log("Computer's stack post-pop: " + movesMade[computer]);
            }

            if (bestScore > max) {
                max = bestScore;
            }
        console.log("Max: " + max);
        return max;
        }
    }
}())
