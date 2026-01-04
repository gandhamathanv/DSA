// N-Queens Backtracking Visualizer
let steps = [];
let currentStepIndex = 0;
let autoPlayInterval = null;
let N = 4;
let board = [];

// DOM Elements
const visualizeBtn = document.getElementById('visualizeBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const autoPlayBtn = document.getElementById('autoPlayBtn');
const resetBtn = document.getElementById('resetBtn');
const controls = document.getElementById('controls');
const phaseIndicator = document.getElementById('phaseIndicator');
const phaseText = document.getElementById('phaseText');
const mainContent = document.getElementById('mainContent');
const explanationSection = document.getElementById('explanationSection');
const resultSection = document.getElementById('resultSection');
const chessboard = document.getElementById('chessboard');
const explanationContent = document.getElementById('explanationContent');
const resultContent = document.getElementById('resultContent');
const currentStepSpan = document.getElementById('currentStep');
const totalStepsSpan = document.getElementById('totalSteps');
const codeDisplay = document.getElementById('codeDisplay');

// Event Listeners
visualizeBtn.addEventListener('click', startVisualization);
prevBtn.addEventListener('click', previousStep);
nextBtn.addEventListener('click', nextStep);
autoPlayBtn.addEventListener('click', toggleAutoPlay);
resetBtn.addEventListener('click', resetVisualization);

function startVisualization() {
    N = parseInt(document.getElementById('boardSize').value);

    if (isNaN(N) || N < 4 || N > 8) {
        alert('Please enter a valid board size (4-8).');
        return;
    }

    // Reset state
    steps = [];
    currentStepIndex = 0;
    board = Array(N).fill(null).map(() => Array(N).fill(0));

    // Generate steps
    generateSteps();

    // Show UI elements
    controls.style.display = 'flex';
    phaseIndicator.style.display = 'flex';
    mainContent.style.display = 'grid';
    explanationSection.style.display = 'block';
    resultSection.style.display = 'none';

    // Update step counter
    totalStepsSpan.textContent = steps.length;

    // Initialize board
    renderBoard();
    updateExplanation();
    updateCodeHighlight();
    updateButtons();
}

function generateSteps() {
    let stepNumber = 1;

    // ============================================================
    // STEP 1: INITIALIZATION PHASE
    // ============================================================
    steps.push({
        type: 'init',
        stepNumber: stepNumber++,
        phase: 'INITIALIZATION',
        board: board.map(row => [...row]),
        explanation: `
            <div class="phase-header">PHASE 1: INITIALIZATION</div>
            <div class="step-detail">
                <p><strong>Setup:</strong> Create an ${N}x${N} chessboard</p>
                <p><strong>Initial State:</strong> All cells are empty (0 = empty, 1 = queen)</p>
                <hr class="explanation-hr">
                <p><strong>Goal:</strong> Place ${N} queens so no two attack each other</p>
                <p><strong>Strategy:</strong> Place one queen per row using backtracking</p>
                <hr class="explanation-hr">
                <p><strong>Starting Point:</strong> Row 0 (top row)</p>
                <p class="indent">→ We'll try placing a queen in each column of row 0</p>
                <p class="indent">→ For each position, check if it's safe</p>
                <p class="indent">→ If safe, move to next row</p>
                <p class="indent">→ If not safe or no solution found, backtrack</p>
            </div>
        `,
        codeLine: 2
    });

    // ============================================================
    // STEP 2: RECURSIVE BACKTRACKING
    // ============================================================
    solveNQueenRecursive(0, stepNumber);
}

function solveNQueenRecursive(row, stepNumber) {
    // Base case: all queens placed
    if (row === N) {
        steps.push({
            type: 'success',
            stepNumber: stepNumber,
            phase: 'SUCCESS_ALL_QUEENS_PLACED',
            board: board.map(row => [...row]),
            explanation: `
                <div class="success">SUCCESS: All ${N} queens placed!</div>
                <div class="step-detail">
                    <p><strong>Base Case Reached:</strong> row == N (${row} == ${N})</p>
                    <p><strong>Meaning:</strong> All queens have been successfully placed!</p>
                    <hr class="explanation-hr">
                    <p><strong>Board State:</strong></p>
                    ${getBoardString()}
                    <hr class="explanation-hr">
                    <p><strong>Verification:</strong></p>
                    <p class="indent">✓ No two queens in same row</p>
                    <p class="indent">✓ No two queens in same column</p>
                    <p class="indent">✓ No two queens on same diagonal</p>
                    <hr class="explanation-hr">
                    <p><strong>Result:</strong> Solution found!</p>
                    <p class="indent">→ Returning TRUE to signal success</p>
                    <p class="indent">→ All recursive calls will unwind</p>
                </div>
            `,
            codeLine: 2
        });
        return stepNumber + 1;
    }

    // Add step for entering row loop
    steps.push({
        type: 'row_start',
        stepNumber: stepNumber,
        phase: `ROW_${row}_START`,
        row: row,
        board: board.map(row => [...row]),
        explanation: `
            <div class="loop-indicator">ROW ${row}: Starting column loop</div>
            <div class="step-detail">
                <p><strong>Current Row:</strong> ${row}</p>
                <p><strong>Queens Placed So Far:</strong> ${row}</p>
                <p><strong>Remaining Queens:</strong> ${N - row}</p>
                <hr class="explanation-hr">
                <p><strong>Goal:</strong> Try placing a queen in each column (0 to ${N - 1})</p>
                <p class="indent">→ For each column, check if position (${row}, col) is safe</p>
                <p class="indent">→ If safe, place queen and recurse to row ${row + 1}</p>
                <p class="indent">→ If recursive call fails, backtrack and try next column</p>
                <hr class="explanation-hr">
                <p><strong>for (int col = 0; col < N; col++)</p>
                <p class="indent">→ Iterating through columns 0 to ${N - 1}</p>
            </div>
        `,
        codeLine: 5
    });
    stepNumber++;

    // Try each column
    for (let col = 0; col < N; col++) {
        const safe = isSafe(row, col);

        // Step: Check if safe
        steps.push({
            type: 'check_safe',
            stepNumber: stepNumber,
            phase: `CHECK_ROW_${row}_COL_${col}`,
            row: row,
            col: col,
            safe: safe,
            board: board.map(row => [...row]),
            explanation: `
                <div class="loop-indicator">Checking position (${row}, ${col})</div>
                <div class="step-detail">
                    <p><strong>Current Row:</strong> ${row}</p>
                    <p><strong>Current Column:</strong> ${col}</p>
                    <p><strong>Checking:</strong> isSafe(${row}, ${col})?</p>
                    <hr class="explanation-hr">
                    ${getSafetyChecksHTML(row, col)}
                    <hr class="explanation-hr">
                    <p><strong>Result:</strong> Position (${row}, ${col}) is <strong>${safe ? 'SAFE ✓' : 'NOT SAFE ✗'}</strong></p>
                    ${safe ? '<p class="indent">→ Can place queen here</p>' : '<p class="indent">→ Cannot place queen here</p>'}
                </div>
            `,
            codeLine: 7
        });
        stepNumber++;

        if (safe) {
            // Place queen
            board[row][col] = 1;

            steps.push({
                type: 'place_queen',
                stepNumber: stepNumber,
                phase: `PLACE_QUEEN_AT_${row}_${col}`,
                row: row,
                col: col,
                board: board.map(row => [...row]),
                explanation: `
                    <div class="condition-pass">SAFE: Placing queen at (${row}, ${col})</div>
                    <div class="step-detail">
                        <p><strong>Action:</strong> board[${row}][${col}] = 1</p>
                        <hr class="explanation-hr">
                        <p><strong>Board State After Placing Queen:</strong></p>
                        ${getBoardString(row, col)}
                        <hr class="explanation-hr">
                        <p><strong>Next:</strong> Recursively try to place queen in row ${row + 1}</p>
                        <p class="indent">→ solveNQueen(${row + 1})</p>
                    </div>
                `,
                codeLine: 9
            });
            stepNumber++;

            // Recursive call
            const newStepNumber = solveNQueenRecursive(row + 1, stepNumber);
            stepNumber = newStepNumber;

            // Check if we found a solution
            const lastStep = steps[steps.length - 1];
            if (lastStep.type === 'success') {
                // Solution found, return
                return stepNumber;
            }

            // Backtrack
            board[row][col] = 0;

            steps.push({
                type: 'backtrack',
                stepNumber: stepNumber,
                phase: `BACKTRACK_FROM_${row}_${col}`,
                row: row,
                col: col,
                board: board.map(row => [...row]),
                explanation: `
                    <div class="backtrack">BACKTRACK: Removing queen from (${row}, ${col})</div>
                    <div class="step-detail">
                        <p><strong>What happened:</strong> Recursive call for row ${row + 1} failed</p>
                        <p class="indent">→ No valid position found in row ${row + 1}</p>
                        <p class="indent">→ Or deeper recursion failed</p>
                        <hr class="explanation-hr">
                        <p><strong>Backtracking Action:</strong></p>
                        <p class="indent">→ board[${row}][${col}] = 0</p>
                        <p class="indent">→ Removing queen from (${row}, ${col})</p>
                        <hr class="explanation-hr">
                        <p><strong>Board State After Backtracking:</strong></p>
                        ${getBoardString()}
                        <hr class="explanation-hr">
                        <p><strong>Next:</strong> Try next column in row ${row}</p>
                        ${col < N - 1 ? `<p class="indent">→ Will check position (${row}, ${col + 1})</p>` : '<p class="indent">→ No more columns to try</p>'}
                    </div>
                `,
                codeLine: 14
            });
            stepNumber++;
        } else {
            // Skip unsafe position
            steps.push({
                type: 'skip_unsafe',
                stepNumber: stepNumber,
                phase: `SKIP_UNSAFE_${row}_${col}`,
                row: row,
                col: col,
                board: board.map(row => [...row]),
                explanation: `
                    <div class="condition-fail">UNSAFE: Cannot place queen at (${row}, ${col})</div>
                    <div class="step-detail">
                        <p><strong>Position (${row}, ${col}) is under attack!</strong></p>
                        <hr class="explanation-hr">
                        ${getSafetyChecksHTML(row, col)}
                        <hr class="explanation-hr">
                        <p><strong>Action:</strong> Skip this position</p>
                        <p class="indent">→ Do NOT place queen here</p>
                        <p class="indent">→ Continue to next column</p>
                        ${col < N - 1 ? `<p class="indent">→ Next: Check position (${row}, ${col + 1})</p>` : '<p class="indent">→ No more columns in this row</p>'}
                    </div>
                `,
                codeLine: 7
            });
            stepNumber++;
        }
    }

    // All columns failed - return from this row
    steps.push({
        type: 'row_fail',
        stepNumber: stepNumber,
        phase: `ROW_${row}_FAILED`,
        row: row,
        board: board.map(row => [...row]),
        explanation: `
            <div class="condition-fail">ROW ${row} FAILED: No valid position found</div>
            <div class="step-detail">
                <p><strong>Tried all columns 0 to ${N - 1} in row ${row}</p>
                <p><strong>Result:</strong> No safe position found</p>
                <hr class="explanation-hr">
                <p><strong>What this means:</strong></p>
                <p class="indent">→ Cannot place queen in row ${row}</p>
                <p class="indent">→ Previous placement(s) must be incorrect</p>
                <p class="indent">→ Need to backtrack to row ${row - 1}</p>
                <hr class="explanation-hr">
                <p><strong>Action:</strong> Return FALSE</p>
                <p class="indent">→ Signals parent call that this path failed</p>
                <p class="indent">→ Parent will backtrack and try next column</p>
            </div>
        `,
        codeLine: 17
    });

    return stepNumber + 1;
}

function isSafe(row, col) {
    // Check column
    for (let i = 0; i < row; i++) {
        if (board[i][col]) return false;
    }

    // Check left diagonal
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
        if (board[i][j]) return false;
    }

    // Check right diagonal
    for (let i = row, j = col; i >= 0 && j < N; i--, j++) {
        if (board[i][j]) return false;
    }

    return true;
}

function getSafetyChecksHTML(row, col) {
    let html = '<p><strong>Safety Checks:</strong></p>';

    // Check column
    let columnSafe = true;
    let columnAttacker = -1;
    for (let i = 0; i < row; i++) {
        if (board[i][col]) {
            columnSafe = false;
            columnAttacker = i;
            break;
        }
    }
    html += `<div class="check-item ${columnSafe ? 'check-pass' : 'check-fail'}">
        <strong>1. Column Check:</strong> No queen in column ${col}? <strong>${columnSafe ? 'YES ✓' : 'NO ✗'}</strong>
        ${!columnSafe ? `<br>→ Queen found at (${columnAttacker}, ${col}) attacks this position` : ''}
    </div>`;

    // Check left diagonal
    let leftDiagSafe = true;
    let leftAttacker = null;
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
        if (board[i][j]) {
            leftDiagSafe = false;
            leftAttacker = { row: i, col: j };
            break;
        }
    }
    html += `<div class="check-item ${leftDiagSafe ? 'check-pass' : 'check-fail'}">
        <strong>2. Left Diagonal Check:</strong> No queen on left diagonal? <strong>${leftDiagSafe ? 'YES ✓' : 'NO ✗'}</strong>
        ${!leftDiagSafe ? `<br>→ Queen at (${leftAttacker.row}, ${leftAttacker.col}) is on same diagonal` : ''}
    </div>`;

    // Check right diagonal
    let rightDiagSafe = true;
    let rightAttacker = null;
    for (let i = row - 1, j = col + 1; i >= 0 && j < N; i--, j++) {
        if (board[i][j]) {
            rightDiagSafe = false;
            rightAttacker = { row: i, col: j };
            break;
        }
    }
    html += `<div class="check-item ${rightDiagSafe ? 'check-pass' : 'check-fail'}">
        <strong>3. Right Diagonal Check:</strong> No queen on right diagonal? <strong>${rightDiagSafe ? 'YES ✓' : 'NO ✗'}</strong>
        ${!rightDiagSafe ? `<br>→ Queen at (${rightAttacker.row}, ${rightAttacker.col}) is on same diagonal` : ''}
    </div>`;

    return html;
}

function getBoardString(highlightRow = -1, highlightCol = -1) {
    let html = '<div class="board-string">';
    for (let i = 0; i < N; i++) {
        html += '<div style="display: flex; justify-content: center;">';
        for (let j = 0; j < N; j++) {
            const isHighlight = i === highlightRow && j === highlightCol;
            const cell = board[i][j] === 1 ? 'Q' : '.';
            html += `<span style="width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; border: 1px solid #ccc; ${board[i][j] === 1 ? 'background: #28a745; color: white;' : ''} ${isHighlight ? 'background: #ffc107 !important;' : ''}">${cell}</span>`;
        }
        html += '</div>';
    }
    html += '</div>';
    return html;
}

function renderBoard() {
    chessboard.innerHTML = '';
    chessboard.style.gridTemplateColumns = `repeat(${N}, 50px)`;

    const step = steps[currentStepIndex];

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const cell = document.createElement('div');
            cell.className = `cell ${(i + j) % 2 === 0 ? 'white' : 'black'}`;
            cell.id = `cell-${i}-${j}`;

            // Add queen if present
            if (step.board[i][j] === 1) {
                cell.classList.add('queen');
                cell.textContent = 'Q';
            }

            // Highlight current position
            if (step.row === i && step.col !== undefined) {
                if (step.type === 'place_queen') {
                    cell.classList.add('queen');
                    cell.textContent = 'Q';
                } else if (step.type === 'check_safe' || step.type === 'skip_unsafe') {
                    cell.classList.add('attempting');
                    cell.textContent = '?';
                }
            }

            // Show attacked cells
            if (step.row === i && step.col !== undefined && !step.safe) {
                // Mark attacking queen
                for (let r = 0; r < N; r++) {
                    if (step.board[r][step.col] === 1) {
                        document.getElementById(`cell-${r}-${step.col}`).classList.add('attacked');
                    }
                }
                // Check diagonals
                for (let r = 0, c = step.col - (i - r); r < N && c >= 0; r++, c--) {
                    if (step.board[r][c] === 1) {
                        const attackedCell = document.getElementById(`cell-${r}-${c}`);
                        if (attackedCell) attackedCell.classList.add('attacked');
                    }
                }
                for (let r = 0, c = step.col + (i - r); r < N && c < N; r++, c--) {
                    if (step.board[r][c] === 1) {
                        const attackedCell = document.getElementById(`cell-${r}-${c}`);
                        if (attackedCell) attackedCell.classList.add('attacked');
                    }
                }
            }

            chessboard.appendChild(cell);
        }
    }
}

function updateBoard() {
    renderBoard();
}

function updateExplanation() {
    const step = steps[currentStepIndex];
    explanationContent.innerHTML = step.explanation;
    explanationContent.classList.add('fade-in');
    setTimeout(() => explanationContent.classList.remove('fade-in'), 300);

    // Update phase indicator
    if (step.phase) {
        let displayPhase = step.phase.replace(/_/g, ' ');
        phaseText.textContent = displayPhase;
    }
}

function updateCodeHighlight() {
    const step = steps[currentStepIndex];
    const lines = codeDisplay.innerHTML.split('\n');
    const highlightedLines = lines.map((line, index) => {
        if (index + 1 === step.codeLine) {
            return `<span class="highlight-line">${line}</span>`;
        }
        return line;
    });
    codeDisplay.innerHTML = highlightedLines.join('\n');
}

function updateButtons() {
    prevBtn.disabled = currentStepIndex === 0;
    nextBtn.disabled = currentStepIndex === steps.length - 1;
    currentStepSpan.textContent = currentStepIndex + 1;

    // Show result at the end
    if (currentStepIndex === steps.length - 1) {
        showResult();
        stopAutoPlay();
    } else {
        resultSection.style.display = 'none';
    }
}

function showResult() {
    resultSection.style.display = 'block';
    const step = steps[currentStepIndex];

    if (step.type === 'success') {
        resultContent.innerHTML = `
            <p>Solution Found! All ${N} queens placed successfully.</p>
        `;
    } else {
        resultContent.innerHTML = `
            <p>No solution exists for N=${N}</p>
        `;
    }
}

function nextStep() {
    if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        updateBoard();
        updateExplanation();
        updateCodeHighlight();
        updateButtons();
    }
}

function previousStep() {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        updateBoard();
        updateExplanation();
        updateCodeHighlight();
        updateButtons();
    }
}

function toggleAutoPlay() {
    if (autoPlayInterval) {
        stopAutoPlay();
    } else {
        startAutoPlay();
    }
}

function startAutoPlay() {
    autoPlayBtn.textContent = 'Pause';
    autoPlayInterval = setInterval(() => {
        if (currentStepIndex < steps.length - 1) {
            nextStep();
        } else {
            stopAutoPlay();
        }
    }, 1500);
}

function stopAutoPlay() {
    autoPlayBtn.textContent = 'Auto Play';
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
}

function resetVisualization() {
    stopAutoPlay();
    currentStepIndex = 0;
    steps = [];
    controls.style.display = 'none';
    phaseIndicator.style.display = 'none';
    mainContent.style.display = 'none';
    explanationSection.style.display = 'none';
    resultSection.style.display = 'none';
    chessboard.innerHTML = '';
    explanationContent.innerHTML = '<p>Click "Visualize" to start the algorithm visualization.</p>';
}
