(function() {
    'use strict';

    /**
     * Define global variables.
     **/

    var game = false,
        currentPlayer,
        computer = 'O',
        user = 'X',
        gamestate,
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
        for (var i = 0; i < SQUARES; i++) {
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
     * Check gameboard for a winning three-in-a-row.
     *
     * Loop through 8 possible winning "triplets" and check if any 3 squares 
     * are all contained within User's or Computer's movesMade. 
     *
     * If a winner is found, whether or not the gameboard is full, terminate 
     * the game and return 'computer' or 'user'.
     * If the gameboard is full and no winner is found, terminate the game and 
     * return 'draw'; otherwise, the game continues & the function returns no value.
     **/

    function isGameOver(currentGamestate) {
        console.log("Checking if we have a winner...");
        console.log("X: " + movesMade[user] + ", O: " + movesMade[computer]);

        var win,
            draw = 'draw',
            WINS = possibleWins.length,
            openSquares = getOpenSquares(currentGamestate);

        // improve this verbose madness
        for (win = 0; win < WINS; win++) {

            // first, check if computer's moves contain the winning combination
            if ((movesMade[computer].indexOf(possibleWins[win][0]) !== -1) && 
                (movesMade[computer].indexOf(possibleWins[win][1]) !== -1) && 
                (movesMade[computer].indexOf(possibleWins[win][2]) !== -1)) {

                // TODO: Message should only print if actual game is over
                console.log("Computer wins!");
                game = false;
                userMessage.innerHTML = "Game over. You lose :)";
                return computer;
            
            // then, check if user's moves contain the winning combination
            } else if ((movesMade[user].indexOf(possibleWins[win][0]) !== -1) && 
                    (movesMade[user].indexOf(possibleWins[win][1]) !== -1) && 
                    (movesMade[user].indexOf(possibleWins[win][2]) !== -1)) {
                        console.log("You win :(");
                        game = false;
                        userMessage.innerHTML = "Game over. You win :(";
                        return user;

            // otherwise, if board is full, game ends in a draw 
            } else if (openSquares.length === 0) {
                console.log("It's a tie.");
                game = false;
                userMessage.innerHTML = "Game over. It's a draw.";
                return draw;
            }
        }
    }

    /**
     * Implement current player's move:
     * (1) Print to the gameboard DOM element
     * (2) Update global gamestate 
     * (3) Add square to player's list of moves made 
     *
     * If player has made at least 3 moves, call isGameOver() 
     * to check the gameboard for a possible win.
     **/

    function makeMove(player, nextMove) {
        console.log("Making a move...");
        var winner,
            moveIndex = parseInt(nextMove.id.replace('s', ''));

        nextMove.innerHTML = player;
        gamestate[moveIndex] = player;
        movesMade[player].push(moveIndex);

        if (movesMade[player].length >= 3) {
            console.log("More than 3, going to check for a winner.");
            isGameOver(gamestate);
        }
    }

    // allow user to reset game by clicking "Restart"
    var restartButton = document.getElementById('restart');
    restartButton.addEventListener('click', function(e) {
        if (game === true) {
            game = false;
            window.setTimeout(initialize, 1000);
            console.log("Restarting!");
        }
    });


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

            if (gamestate[moveIndex] === '-') {
                makeMove(user, nextMove);
                currentPlayer = computer;
                computerNextMove();
            } else {
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
            openSquares,
            OPEN,
            player,
            bestMove,
            bestScore = {
                'val': -1000000,
            },
            gamestateCopy;

        openSquares = getOpenSquares(gamestate);
        OPEN = openSquares.length;

        // if no empty squares, game is over
        if (OPEN === 0) {
            endGame();
        } else {
            gamestateCopy = gamestate;  // make local copy of global gamestate
            for (i = 0; i < OPEN; i++) {

                // make speculative move
                gamestateCopy[openSquares[i]] = computer;
                movesMade[computer].push(openSquares[i]);

                // call negamax 
                score = negamax(gamestateCopy, computer);
                console.log("MAIN LOOP. score: " + score);

                // undo speculative move after recursing
                gamestateCopy[openSquares[i]] = '-';
                movesMade[computer].pop();
                
                if (score > bestScore['val']) {
                    bestScore['val'] = score;
                    bestScore['square'] = openSquares[i];
                }
            }
            bestMove = document.getElementById('s' + bestScore['square']);
            window.setTimeout(makeMove, 800, computer, bestMove);
            currentPlayer = user;
        }
    }

    // calculate utility of each free square on the board
    function negamax(gamestateCopy, player) {
        console.log("Negamaxing!");
        var i,
            winner,
            bestScore,
            score,
            possibleMoves = [],
            MOVES;

        // getOpenSquares(), passing in speculative gamestate
        possibleMoves = getOpenSquares(gamestateCopy);
        MOVES = possibleMoves.length;

        // base case: if there are no plies left to explore (no open squares)
        winner = isGameOver(gamestateCopy);
        if (winner) {
            console.log("At base case, done recursing.");
            if (winner === computer) {
                console.log("returning 1");
                return 1;
            }
            else if (winner === user) { 
                console.log("returning -1");
                return -1;
            }
            else if (winner === draw) {
                console.log("tie, returning 0");
                return 0;
            }
        }

        bestScore = -1000000;

        // toggle between players
        if (player === user) player = computer;
        else player = user;
        console.log("Player is " + player);

        for (i = 0; i < MOVES; i++) {

            // mark speculative move on gameboard copy
            if (player === user) {
                gamestateCopy[possibleMoves[i]] = user;
                movesMade[user].push(possibleMoves[i]);
            } else if (player === computer) {
                gamestateCopy[possibleMoves[i]] = computer;
                movesMade[computer].push(possibleMoves[i]);
            }
            console.log("GamestateCopy: " + gamestateCopy);
            console.log("Moves made: O: " + movesMade[computer] + " X: " + movesMade[user]);

            // recurse!
            score = -negamax(gamestateCopy, player);

            // undo speculative move after recursing
            gamestateCopy[possibleMoves[i]] = '-';
            if (player === user) movesMade[user].pop();
            else if (player === computer) movesMade[computer].pop();

            if (score > bestScore) {
                bestScore = score;
            }

        console.log("bestScore: " + bestScore);
        return bestScore;
        }
    }
}())
