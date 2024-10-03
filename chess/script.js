// Wait for the DOM to be fully loaded before executing code
document.addEventListener('DOMContentLoaded', () => {
    let board = null; // Initialize the chessboard
    const game = new Chess(); // Create new Chess.js game instance
    let userColor = 'w'; // Initialize the user's color as white

    var globalSum = 0; // always from black's perspective. Negative for white's perspective.
    var weights = { p: 100, n: 280, b: 320, r: 479, q: 929, k: 60000, k_e: 60000 };
    var pst_w = {
    p: [
        [100, 100, 100, 100, 105, 100, 100, 100],
        [78, 83, 86, 73, 102, 82, 85, 90],
        [7, 29, 21, 44, 40, 31, 44, 7],
        [-17, 16, -2, 15, 14, 0, 15, -13],
        [-26, 3, 10, 9, 6, 1, 0, -23],
        [-22, 9, 5, -11, -10, -2, 3, -19],
        [-31, 8, -7, -37, -36, -14, 3, -31],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    n: [
        [-66, -53, -75, -75, -10, -55, -58, -70],
        [-3, -6, 100, -36, 4, 62, -4, -14],
        [10, 67, 1, 74, 73, 27, 62, -2],
        [24, 24, 45, 37, 33, 41, 25, 17],
        [-1, 5, 31, 21, 22, 35, 2, 0],
        [-18, 10, 13, 22, 18, 15, 11, -14],
        [-23, -15, 2, 0, 2, 0, -23, -20],
        [-74, -23, -26, -24, -19, -35, -22, -69],
    ],
    b: [
        [-59, -78, -82, -76, -23, -107, -37, -50],
        [-11, 20, 35, -42, -39, 31, 2, -22],
        [-9, 39, -32, 41, 52, -10, 28, -14],
        [25, 17, 20, 34, 26, 25, 15, 10],
        [13, 10, 17, 23, 17, 16, 0, 7],
        [14, 25, 24, 15, 8, 25, 20, 15],
        [19, 20, 11, 6, 7, 6, 20, 16],
        [-7, 2, -15, -12, -14, -15, -10, -10],
    ],
    r: [
        [35, 29, 33, 4, 37, 33, 56, 50],
        [55, 29, 56, 67, 55, 62, 34, 60],
        [19, 35, 28, 33, 45, 27, 25, 15],
        [0, 5, 16, 13, 18, -4, -9, -6],
        [-28, -35, -16, -21, -13, -29, -46, -30],
        [-42, -28, -42, -25, -25, -35, -26, -46],
        [-53, -38, -31, -26, -29, -43, -44, -53],
        [-30, -24, -18, 5, -2, -18, -31, -32],
    ],
    q: [
        [6, 1, -8, -104, 69, 24, 88, 26],
        [14, 32, 60, -10, 20, 76, 57, 24],
        [-2, 43, 32, 60, 72, 63, 43, 2],
        [1, -16, 22, 17, 25, 20, -13, -6],
        [-14, -15, -2, -5, -1, -10, -20, -22],
        [-30, -6, -13, -11, -16, -11, -16, -27],
        [-36, -18, 0, -19, -15, -15, -21, -38],
        [-39, -30, -31, -13, -31, -36, -34, -42],
    ],
    k: [
        [4, 54, 47, -99, -99, 60, 83, -62],
        [-32, 10, 55, 56, 56, 55, 10, 3],
        [-62, 12, -57, 44, -67, 28, 37, -31],
        [-55, 50, 11, -4, -19, 13, 0, -49],
        [-55, -43, -52, -28, -51, -47, -8, -50],
        [-47, -42, -43, -79, -64, -32, -29, -32],
        [-4, 3, -14, -50, -57, -18, 13, 4],
        [17, 30, -3, -14, 6, -1, 40, 18],
    ],

    // Endgame King Table
    k_e: [
        [-50, -40, -30, -20, -20, -30, -40, -50],
        [-30, -20, -10, 0, 0, -10, -20, -30],
        [-30, -10, 20, 30, 30, 20, -10, -30],
        [-30, -10, 30, 40, 40, 30, -10, -30],
        [-30, -10, 30, 40, 40, 30, -10, -30],
        [-30, -10, 20, 30, 30, 20, -10, -30],
        [-30, -30, 0, 0, 0, 0, -30, -30],
        [-50, -30, -30, -30, -30, -30, -30, -50],
    ],
    };
    var pst_b = {
        p: pst_w['p'].slice().reverse(),
        n: pst_w['n'].slice().reverse(),
        b: pst_w['b'].slice().reverse(),
        r: pst_w['r'].slice().reverse(),
        q: pst_w['q'].slice().reverse(),
        k: pst_w['k'].slice().reverse(),
        k_e: pst_w['k_e'].slice().reverse(),
    };

    var pstOpponent = { w: pst_b, b: pst_w };
    var pstSelf = { w: pst_w, b: pst_b };

    function evaluateBoard(game, move, prevSum, color) {
        const isOurMove = move.color === color;
        const checkmateValue = 10 ** 10;
    
        if (game.in_checkmate()) {
            return isOurMove ? checkmateValue : -checkmateValue;
        }
    
        if (game.in_draw() || game.in_threefold_repetition() || game.in_stalemate()) {
            return 0;
        }
    
        if (game.in_check()) {
            prevSum += isOurMove ? 50 : -50;
        }
    
        const from = [8 - parseInt(move.from[1]), move.from.charCodeAt(0) - 'a'.charCodeAt(0)];
        const to = [8 - parseInt(move.to[1]), move.to.charCodeAt(0) - 'a'.charCodeAt(0)];
    
        // Adjust for endgame behavior
        if (prevSum < -1500 && move.piece === 'k') {
            move.piece = 'k_e';
        }
    
        // Handle captures
        if (move.captured) {
            const capturedValue = weights[move.captured] + (isOurMove ? pstOpponent : pstSelf)[move.color][move.captured][to[0]][to[1]];
            prevSum += isOurMove ? capturedValue : -capturedValue;
        }
    
        // Handle promotions
        if (move.flags.includes('p')) {
            move.promotion = 'q';
            const promotionValue = weights[move.promotion] + pstSelf[move.color][move.promotion][to[0]][to[1]];
            prevSum += isOurMove ? promotionValue : -promotionValue;
    
            const pieceValue = weights[move.piece] + pstSelf[move.color][move.piece][from[0]][from[1]];
            prevSum += isOurMove ? -pieceValue : pieceValue;
        } else {
            // Handle piece movement
            const pieceMovementValue = pstSelf[move.color][move.piece][to[0]][to[1]] - pstSelf[move.color][move.piece][from[0]][from[1]];
            prevSum += isOurMove ? pieceMovementValue : -pieceMovementValue;
        }
    
        return prevSum;
    }


    function minimax(game, depth, alpha, beta, isMaximizingPlayer, sum, color) {
        const children = game.moves({ verbose: true });
    
        // Exit conditions: max depth or no moves
        if (depth === 0 || children.length === 0) {
            return [null, sum];
        }
    
        // Randomize moves to avoid picking the same on ties
        children.sort(() => 0.5 - Math.random());
    
        let bestMove;
        let bestValue = isMaximizingPlayer ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    
        for (const move of children) {
            const currMove = game.move(move);
            const newSum = evaluateBoard(game, currMove, sum, color);
            const [, childValue] = minimax(
                game, depth - 1, alpha, beta, !isMaximizingPlayer, newSum, color
            );
            game.undo();
            if (isMaximizingPlayer) {
                if (childValue > bestValue) {
                    bestValue = childValue;
                    bestMove = currMove;
                }
                alpha = Math.max(alpha, childValue);
            } else {
                if (childValue < bestValue) {
                    bestValue = childValue;
                    bestMove = currMove;
                }
                beta = Math.min(beta, childValue);
            }
            // Alpha-beta pruning
            if (alpha >= beta) { break; }
        }
    
        return [bestMove, bestValue];
    }
    
    function getBestMove(game, color, currSum) {
        const depth = 2;
        return minimax(game, depth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true, currSum, color);
    }

    function makeBestMove() {
        if (game.game_over()) {
            alert('Checkmate! Thanks for playing. Email us if you would like to join our team!');
            jQuery(".banner").show();
            return;
        }
        var move = getBestMove(game, 'b', globalSum)[0];
        globalSum = evaluateBoard(game, move, globalSum, 'b');
        game.move(move);
        board.position(game.fen());
        if (game.game_over()) {
            alert('Checkmate! Thanks for playing. Email us if you would like to join our team!');
            jQuery(".banner").show();
            return;
        }
    }

    // Function to handle the start of a drag position
    const onDragStart = (source, piece) => {
        // Allow the user to drag only their own pieces based on color
        jQuery(".banner").hide();
        return !game.game_over() && piece.search(userColor) === 0;
    };

    // Function to handle a piece drop on the board
    const onDrop = (source, target) => {
        const move = game.move({
            from: source,
            to: target,
            promotion: 'q',
        });
        if (move === null) return 'snapback';
        window.setTimeout(makeBestMove, 250);
    };

    // Function to handle the end of a piece snap animation
    const onSnapEnd = () => {
        board.position(game.fen());
    };

    // Configuration options for the chessboard
    const boardConfig = {
        pieceTheme: 'chess/chesspieces/neo/{piece}.png',
        orientation: 'white',
        position: 'start',
        showNotation: false,
        draggable: true,
        onDragStart,
        onDrop,
        onSnapEnd,
        moveSpeed: 'fast',
        snapBackSpeed: 500,
        snapSpeed: 100,
    };

    // Initialize the chessboard
    board = Chessboard('board', boardConfig);

});