// Wait for the DOM to be fully loaded before executing code
jQuery(() => {
    var game = null;
    let board = null; 

    jQuery.getScript("assets/chess/chess.min.js", ()=>{
        game = new Chess(); 
    });

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
            return;
        }
        var move = getBestMove(game, 'b', globalSum)[0];
        globalSum = evaluateBoard(game, move, globalSum, 'b');
        game.move(move);
        board.position(game.fen());
        if (game.game_over()) {
            alert('Checkmate! Thanks for playing. Email us if you would like to join our team!');
            return;
        }
    }

    // Function to handle the start of a drag position
    const onDragStart = (source, piece) => {
        // Allow the user to drag only their own pieces based on color
        jQuery(".headline").css('visibility', 'hidden');
        jQuery(".chess").addClass("active");
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

    const data = {
        "wK":"data:image/png;base64, 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",
        "bK":"data:image/png;base64, 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",
        "wN":"data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAMAAABOo35HAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURUxpcUNDQ0REREREREVFRUVFRf////j4+O3t7eHh4dPT076+vqampo+Pj3d3d11dXUZGRjGGiMcAAAAGdFJOUwAxZYyw2+P01pYAAApnSURBVHja7Z3ZdtvIDkWbI6pQ4/9/7Y2dXJ+VlGmRFGihaOyHfuxobeMcgoOo/wzDMAzDMAzDMAzDMAzDMAzDMAzDMAzDMAzDMLQzTvMvRhPxkGGqfzBbj3hTZbb2Mddqtnay1Gq29s+V2drfV2ZrJ0P9Q4mezda+EGa3rqvZ2jVYmdZfkNnaMViF1tVsPaL+Jqy/IbP1MIVl/QOZrW3G+k78kGW2Hi5ZvJqt3Wc6BFlmaxNU1h/IbD3o9wRZZLYe9jtkma0HKylDFpmt3f2+ktn6ut/zupqtvZWV/nHV2lqWeRrHwVbSWsOnsmALLPPPNVZ/47dkEZfaskw/0diElRSyHtiCsJ953S82sr6yBebxB94BcxuyYMt8zRWDBaiBU87lC1/DzymsWmjTFXCOQ0wbzpbp/ivWH/jBYAHnmQOM/Zjxgqu0yxV8vQmLufwcXchgzXRAFgaMQ2p8LcO9u70Wd8AV8PxGzD9BF1z5w64wXpivG4dxWJ53hfEKuf7FZK6+0sV/j9cy3u0cp3VFp3D8TixNdd3MlWtciemabuYq03OqgIeuWw0XXKVmrIR1jfd50jYKukIWOVUw32W/CrKuMFwh3yWKI1wBEsIxsniHKF7pCsPF+Q5Hxalu3PgSH67uiwtP2l7lCrZC7ru40O6+dSUfxdTY6v5WDsnj2ygO3TZWocbVRVEssNXrPhoudgVbnLu1NTaDRXS1rdTrwjVvPeIHXEi55BSusDX0WO9u29XH6l1YzFaErf7qPW+6crmCKG9rGXqt91aWL7VK2vKtrd5SWGjDlSv1b/in2kIK09Zg5foPmeRtzX1db+ANV6E2MD0LN7bGLr8nt26FEES5BQIbxNBRCuOGrFRbEskFkTMOid2k0G8MVq2SkwX4g9JPbY1fpzDWT2C6xNbU3akO/U2pLYWARBADaqvrFLL4YAFuDolL3ylMtSVIX4BAyU8dpbCVVRuyJyl8W1vDnVJYAgHB0QoIovoU5i+OhSmwZw4xpRg8AdnRSghirynMNTm6EO4oiLjst7U4MF2Kb4M493rZzzm6FscgaR+t2lz2+2Z8G8RF+5L1MlmOQdR9sWZp6v3b4V5Ga9y4q/OqHAbNo7VsvD7lVTnkrHe0phcOFuAuRmuo1wyWO55D/aM1XzNYnv0xtz2M1tg+kiXVQXQI7mC0FuknZ5AqdzaHGK1BZQiD/GCxO5tDjNasMYRZuN35OVkYLY1fK/TyIWT2xwWDgopX+4oLyaXJHzcMIipeawhJBC8gi5VV/FCvCaFjyDpdWpx1XV9ergqhgCxtFT9dFEJ3Uhax1opHCIuTdUUsJCth1VITQpZu99OyvNIcYmtI4iGUkYUcDmq2hkLSIRSShRxO+raGCy4PuzND2eZwUbc1kAyO5WQhh8q2BpIbLHDOdJvD8a5bg6isiOXh9SEM0q5qZOCflIXzQ1VbA8ng3/wflwVYX2lhaxBzha8V5PP9To61lRa2BhZ39QaC+GzlYXmYb7c15PpOOS/LcQM2rTttDXieOZ2uLOKt0tKyNZAMsX6Aynp+sjIaXsHWQDKEChJS+JwsbFqTgq1B3hVaywvIQsPfY2uAKxClZKHh77E1wBXIqKznZKHhFWwN0q5G5JBJQhYa/sVbg7yr4eNlB6dSSJ5Zyw6PEDpJVxGu8NVhZickK0JW/1tDQgZxAEnMdEqWksMhQpiucoXhzezpBAzAa2T9szVIPBfq/nn7FWQ5YVnLa1YshqtdByfvaAtu36v2f1kkIwu7wysfdpe4C9+8sQ+T5Z+92QHyC2QNh4+EDBy1+ObNmfhXkjvZ70oWrenMYAG3PVboE6wOJCcrQdZrflf1RIH4rbaqc5v1IFZZWLReUFlwdbhAMFycKxg/y3rnsipOdM58cuhyIVewDJ9kPdPpfldwRQvNe2awgPchVYAISqTQ86eEl8o68clDjDE1v8nXZGMSSKEuWUc/eUylgu2xQmMlOitLxfkOtsX1YH+0ptBWm2/8pjM4JbJQ8OXkL5mA7V9kGp8bLK9FFrrXH4lEOvKjobhaRqdgLbKQkXggEnlrqIYvL1nT+RRquewwHskhXO38YWgUVqZzeAWyQN2/A7l/Mvj+k/bjMAw7fqzHSw8WF8j67hwWv++vHDcK6oGrQOfwumThIYc9f+XQbAi7XCU6CeuShVZxO/7KuaIq9rvKAg85q+gsHNsLP/zg8YirpeLPcBKvTBa2xgdXMpnxoyXDoR8kdc8Mlo49C0z1g+i2PzhCOF7sqh0sRc/RzLBVoqdPYYRw3jWtyKDAYKm46gBbIDO1+EMhnARcYbC0XPxrJwHjdT6Es4grx0DPww7oGJD/9sVY3ZcD/6sk8n0fLXd32uECJQWHzx3rzhAOQu+FdwxU3Ddsm6YVxkSO4Wrc7bwwPQMDBbfvW4apAlAKrrLPu+uqeBIIoaKdtGVc6lcsF1c7YKBozWrH6wtfw/XVjsHSuDm0DHP9nHFvtQcC4u3ePlOqcb7Gi6sdMNB4MGwZxnlpbnLtcuVJIISqD4bbxpY3U/MocIYjFUIcDLtkaqr9uhCi3+fOXUWi60OIfu+QWeQwiBBK9Lt+V0wiIRTod/WuCtOVIQSh236fsDKIudKwv+t35XgPudN+H0VdEfOByhq6deVIKoR3XUkHsblCCO+6kg6LqCticLuVFHfoZVx5vnFlzdhFhUJ428pCuQcpV7etLJR7JLEQ3nTLQmFlMVf3rawJC5YIDO52YogQeqnBunFlLSh3oXa/a2UhhIlkYL5vZQ3CheX5tpWFdZS/PYR4Z3cvjMIh9Axud/l9kQ2h4wPU33Q3WEGu3e+7OCxY3eUG65aXZzBY/P2DhcXBButuiwN2LC99KLzjTbBZfrBue64zCDeW5xsvDqPsYBGfSOHSWb0HuRTe7FxH5PVO7g3vvXsHKRRYHPpMofPMIcSYUsq/KL+oDyjv5F+klGKMIdxncZiRQggKeNmRCO/2UoK4Ts91kMJ3RzB0FW/aYuh5cSip1O+llBxD6W1xeD1LL66W+nrmLiI4n2nqkkH6TQY4YB5gmYbuh+rPISyGwOydo/UA5LB15PzY36xZ17BsG0pvejytorwvJDjaAujqKIAlJyi6Euc3VpSpj0NgjkzrN0PcrCvLoPXuM0T59WVwzBUoXE/nCnKg9cW4WCqY1LrKvKogFKW24Cojfpp0jRr7KqyaoIQ3Aij8UsD6PLSu9PGfZ8HrB/U9N7rLBa0kwT6bvug6V5zgalvQ5az0wNag65G1xtEJ5K0xgqhnsFhAkyBQFhUdEaV/9lBeWNbSWnhJNUTpAkEctBwK40p6ydjjldxOVUxAxeu4naqaghyquJ2qGiWPTS5Iof4cTioWh0K6cSpKa8D3AnooLRX9Hkk5WUPDT3gaUjVJg6wZzyT30PCjhoMhEdnhcKesQtphk7Ufr+HCA052dONM1gFM1gE0rPBY4LtY4Rc72zFZJstkmSyTZbJMlskyWSar1uzUo0JWN5gsk2WyTJbJMllXMffF9J9hGIZhGIZhGIZhGIZhGIZhGIZhGIZhGMbd+R9BdZQJObP47gAAAABJRU5ErkJggg==",
        "bN":"data:image/png;base64, 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",
        "wB":"data:image/png;base64, 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",
        "bB":"data:image/png;base64, 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",
        "bR":"data:image/png;base64, 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",
        "wR":"data:image/png;base64, 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",
        "wP":"data:image/png;base64, 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",
        "bQ":"data:image/png;base64, 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",
        "bP":"data:image/png;base64, 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",
        "wQ":"data:image/png;base64, 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",
    };

    function pieceFunction(p) {
        return data[p];
    }

    // Configuration options for the chessboard
    const boardConfig = {
        pieceTheme: pieceFunction,
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
    jQuery.getScript("assets/chess/chessboard-1.0.0.min.js", ()=>{
        board = Chessboard('board', boardConfig);
    })
    jQuery(".chess .button").on("click", ()=>{
        jQuery(".chess").removeClass("active").addClass("disabled");
        jQuery(".headline").css('visibility', 'visible');
    });
});