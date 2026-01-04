// Coin Change DP Visualizer
let steps = [];
let currentStepIndex = 0;
let autoPlayInterval = null;
let dp = [];
let coins = [];
let amount = 0;

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
const dpTableBody = document.getElementById('dpTableBody');
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
    // Parse inputs
    const coinsInput = document.getElementById('coins').value;
    coins = coinsInput.split(',').map(c => parseInt(c.trim())).filter(c => !isNaN(c) && c > 0);
    amount = parseInt(document.getElementById('amount').value);

    if (coins.length === 0) {
        alert('Please enter valid coin denominations.');
        return;
    }

    if (isNaN(amount) || amount < 1 || amount > 20) {
        alert('Please enter a valid amount (1-20).');
        return;
    }

    // Sort coins
    coins.sort((a, b) => a - b);

    // Reset state
    steps = [];
    currentStepIndex = 0;
    dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;

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

    // Initialize table
    renderTable();
    updateExplanation();
    updateCodeHighlight();
    updateButtons();
}

function generateSteps() {
    // Track loop state for better explanations
    let stepNumber = 1;

    // ============================================================
    // STEP 1: INITIALIZATION PHASE
    // ============================================================
    steps.push({
        type: 'init',
        stepNumber: stepNumber++,
        phase: 'INITIALIZATION',
        dp: [...dp],
        explanation: `
            <div class="phase-header">PHASE 1: INITIALIZATION</div>
            <div class="step-detail">
                <p><strong>Loop:</strong> None (Setup)</p>
                <p><strong>Action:</strong> Initialize DP array of size ${amount + 1}</p>
                <hr class="explanation-hr">
                <p><strong>Base Case:</strong> dp[0] = 0</p>
                <p class="indent">→ Zero coins needed to make amount 0</p>
                <p><strong>Initial Values:</strong> For all i from 1 to ${amount}, set dp[i] = Infinity</p>
                <p class="indent">→ Represents that these amounts are initially "unreachable"</p>
                <p class="indent">→ Will be updated when we find valid coin combinations</p>
                <hr class="explanation-hr">
                <div class="dp-state">
                    <strong>Current DP Array State:</strong><br>
                    ${dp.map((v, idx) => `dp[${idx}] = ${v === Infinity ? '∞' : v}`).join('<br>')}
                </div>
            </div>
        `,
        codeLine: 6
    });

    // ============================================================
    // STEP 2: MAIN DP FILLING PHASE
    // ============================================================
    steps.push({
        type: 'phase_start',
        stepNumber: stepNumber++,
        phase: 'MAIN_DP_FILL',
        dp: [...dp],
        explanation: `
            <div class="phase-header">PHASE 2: MAIN DP ARRAY FILLING</div>
            <div class="step-detail">
                <p><strong>Outer Loop:</strong> for (int i = 1; i <= amount; i++)</p>
                <p class="indent">→ Iterates through each amount from 1 to ${amount}</p>
                <p><strong>Inner Loop:</strong> for (int j = 0; j < n; j++)</p>
                <p class="indent">→ Checks each coin: ${coins.join(', ')}</p>
                <hr class="explanation-hr">
                <p><strong>For each amount i, we try each coin to find the minimum:</strong></p>
                <div class="formula">
                    dp[i] = min(dp[i], dp[i - coin] + 1)
                </div>
                <p><strong>Where:</strong></p>
                <p class="indent">• dp[i] = current minimum coins for amount i</p>
                <p class="indent">• coin = the coin we're currently testing</p>
                <p class="indent">• dp[i - coin] = minimum coins needed for remaining amount</p>
                <p class="indent">• +1 = adding the current coin</p>
            </div>
        `,
        codeLine: 11
    });

    // ============================================================
    // OUTER LOOP: For each amount i
    // ============================================================
    for (let i = 1; i <= amount; i++) {
        // Add step to show entering outer loop
        steps.push({
            type: 'outer_loop_start',
            stepNumber: stepNumber++,
            phase: `OUTER_LOOP_i=${i}`,
            i: i,
            dp: [...dp],
            explanation: `
                <div class="phase-header">OUTER LOOP: i = ${i} (Computing dp[${i}])</div>
                <div class="step-detail">
                    <p><strong>Target Amount:</strong> ${i}</p>
                    <p><strong>Goal:</strong> Find minimum coins to make amount ${i}</p>
                    <p><strong>Current dp[${i}]:</strong> ${dp[i] === Infinity ? '∞ (not yet computed)' : dp[i]}</p>
                    <hr class="explanation-hr">
                    <p><strong>Now entering INNER LOOP to check each coin:</strong></p>
                    <p class="indent">Available coins: ${coins.join(', ')}</p>
                    <p class="indent">For each coin, we check if it can be used to make amount ${i}</p>
                </div>
            `,
            codeLine: 11
        });

        // ========================================================
        // INNER LOOP: For each coin
        // ========================================================
        for (let j = 0; j < coins.length; j++) {
            const coin = coins[j];
            const prevDp = [...dp];

            // Add step to show entering inner loop
            steps.push({
                type: 'inner_loop_start',
                stepNumber: stepNumber++,
                phase: `INNER_LOOP_i=${i}_coin=${coin}`,
                i: i,
                coin: coin,
                j: j,
                dp: [...dp],
                explanation: `
                    <div class="loop-indicator">INNER LOOP (j = ${j}): Checking coin ${coin}</div>
                    <div class="step-detail">
                        <p><strong>Outer Loop (i):</strong> ${i} (target amount)</p>
                        <p><strong>Inner Loop (j):</strong> ${j} (coin index)</p>
                        <p><strong>Current Coin:</strong> ${coin}</p>
                        <p><strong>Target dp[${i}]:</strong> Currently ${dp[i] === Infinity ? '∞' : dp[i]}</p>
                        <hr class="explanation-hr">
                        <p><strong>Checking Condition:</strong></p>
                        <div class="formula">
                            if (coins[${j}] <= ${i} && dp[${i} - coins[${j}]] != INT_MAX)
                        </div>
                        <p class="indent">Condition 1: ${coin} <= ${i} ? <strong>${coin <= i ? 'TRUE ✓' : 'FALSE ✗'}</strong></p>
                        ${coin > i ? '<p class="indent fail-reason">→ Coin ${coin} is larger than target amount ${i}, cannot use this coin</p>' : ''}
                        ${coin <= i ? `<p class="indent">Condition 2: dp[${i} - ${coin}] != INT_MAX ?</p>` : ''}
                    </div>
                `,
                codeLine: 13
            });

            if (coin > i) {
                // Skip: coin too large
                steps.push({
                    type: 'skip_coin_too_large',
                    stepNumber: stepNumber++,
                    phase: `SKIP_coin=${coin}_too_large`,
                    i: i,
                    coin: coin,
                    j: j,
                    reason: `Coin ${coin} > Amount ${i}`,
                    dp: [...dp],
                    explanation: `
                        <div class="condition-fail">CONDITION FAILED: Coin value too large</div>
                        <div class="step-detail">
                            <p><strong>Outer Loop (i):</strong> ${i}</p>
                            <p><strong>Inner Loop (j):</strong> ${j} (coin = ${coin})</p>
                            <hr class="explanation-hr">
                            <p><strong>Condition Check:</strong> coins[${j}] <= i</p>
                            <p class="indent">coins[${j}] = ${coin}</p>
                            <p class="indent">i = ${i}</p>
                            <p class="indent">${coin} <= ${i} → <strong>FALSE</strong></p>
                            <hr class="explanation-hr">
                            <p><strong>Reason:</strong> Coin ${coin} has greater value than the target amount ${i}</p>
                            <p class="indent">→ We cannot use a coin of value ${coin} to make amount ${i}</p>
                            <p><strong>Result:</strong> Skip this coin, move to next coin</p>
                            <p><strong>dp[${i}] remains:</strong> ${dp[i] === Infinity ? '∞' : dp[i]}</p>
                        </div>
                    `,
                    codeLine: 13
                });
                continue;
            }

            const subproblemIndex = i - coin;
            if (dp[subproblemIndex] === Infinity) {
                // Skip: subproblem unreachable
                steps.push({
                    type: 'skip_subproblem_infinity',
                    stepNumber: stepNumber++,
                    phase: `SKIP_subproblem_dp[${subproblemIndex}]_unreachable`,
                    i: i,
                    coin: coin,
                    j: j,
                    subproblemIndex: subproblemIndex,
                    reason: `dp[${subproblemIndex}] is Infinity`,
                    dp: [...dp],
                    explanation: `
                        <div class="condition-fail">CONDITION FAILED: Subproblem unreachable</div>
                        <div class="step-detail">
                            <p><strong>Outer Loop (i):</strong> ${i}</p>
                            <p><strong>Inner Loop (j):</strong> ${j} (coin = ${coin})</p>
                            <hr class="explanation-hr">
                            <p><strong>First Condition:</strong> coins[${j}] <= i → ${coin} <= ${i} → <strong>TRUE ✓</strong></p>
                            <hr class="explanation-hr">
                            <p><strong>Second Condition:</strong> dp[i - coins[${j}]] != INT_MAX</p>
                            <p class="indent">dp[${i} - ${coin}] = dp[${subproblemIndex}]</p>
                            <p class="indent">dp[${subproblemIndex}] = <strong>Infinity</strong></p>
                            <p class="indent">→ This means amount ${subproblemIndex} cannot be made with given coins</p>
                            <hr class="explanation-hr">
                            <p><strong>Why this matters:</strong></p>
                            <p class="indent">→ If we use coin ${coin}, we still need amount ${subproblemIndex}</p>
                            <p class="indent">→ But dp[${subproblemIndex}] = Infinity means ${subproblemIndex} is unreachable</p>
                            <p class="indent">→ So we cannot use coin ${coin} to make amount ${i}</p>
                            <hr class="explanation-hr">
                            <p><strong>Result:</strong> Skip this coin, dp[${i}] remains ${dp[i] === Infinity ? '∞' : dp[i]}</p>
                        </div>
                    `,
                    codeLine: 13
                });
                continue;
            }

            // Condition passed - can use this coin
            const newValue = dp[subproblemIndex] + 1;
            const oldDpI = dp[i];

            steps.push({
                type: 'condition_passed',
                stepNumber: stepNumber++,
                phase: `CONDITION_passed_coin=${coin}`,
                i: i,
                coin: coin,
                j: j,
                subproblemIndex: subproblemIndex,
                subproblemValue: dp[subproblemIndex],
                dp: [...dp],
                explanation: `
                    <div class="condition-pass">CONDITION PASSED: Can use coin ${coin}</div>
                    <div class="step-detail">
                        <p><strong>Outer Loop (i):</strong> ${i}</p>
                        <p><strong>Inner Loop (j):</strong> ${j} (coin = ${coin})</p>
                        <hr class="explanation-hr">
                        <p><strong>Both conditions are TRUE:</strong></p>
                        <p class="indent">1. ${coin} <= ${i} → TRUE ✓ (coin fits within target amount)</p>
                        <p class="indent">2. dp[${i} - ${coin}] != INT_MAX → TRUE ✓ (subproblem reachable)</p>
                        <hr class="explanation-hr">
                        <p><strong>Subproblem Analysis:</strong></p>
                        <p class="indent">If we use coin ${coin}, remaining amount = ${i} - ${coin} = ${subproblemIndex}</p>
                        <p class="indent">dp[${subproblemIndex}] = ${dp[subproblemIndex]} (minimum coins for amount ${subproblemIndex})</p>
                        <p class="indent">Adding current coin: dp[${subproblemIndex}] + 1 = ${dp[subproblemIndex]} + 1 = <strong>${newValue}</strong></p>
                        <hr class="explanation-hr">
                        <p><strong>Current dp[${i}]:</strong> ${oldDpI === Infinity ? '∞' : oldDpI}</p>
                        <p><strong>Candidate value:</strong> ${newValue}</p>
                        <p><strong>Comparison:</strong> Is ${newValue} < ${oldDpI === Infinity ? '∞' : oldDpI}?</p>
                    </div>
                `,
                codeLine: 13
            });

            if (newValue < dp[i]) {
                // Update dp[i]
                dp[i] = newValue;

                steps.push({
                    type: 'update',
                    stepNumber: stepNumber++,
                    phase: `UPDATE_dp[${i}]=${newValue}_using_coin=${coin}`,
                    i: i,
                    coin: coin,
                    j: j,
                    subproblemIndex: subproblemIndex,
                    oldValue: oldDpI,
                    newValue: newValue,
                    dp: [...dp],
                    explanation: `
                        <div class="update-happened">UPDATE: dp[${i}] changed! ✨</div>
                        <div class="step-detail">
                            <p><strong>Outer Loop (i):</strong> ${i}</p>
                            <p><strong>Inner Loop (j):</strong> ${j} (coin = ${coin})</p>
                            <hr class="explanation-hr">
                            <p><strong>Comparison Result:</strong> ${newValue} < ${oldDpI === Infinity ? '∞' : oldDpI} → <strong>TRUE ✓</strong></p>
                            <hr class="explanation-hr">
                            <p><strong>Update Calculation:</strong></p>
                            <div class="formula">
                                dp[${i}] = min(dp[${i}], dp[${subproblemIndex}] + 1)<br>
                                dp[${i}] = min(${oldDpI === Infinity ? '∞' : oldDpI}, ${dp[subproblemIndex]} + 1)<br>
                                dp[${i}] = min(${oldDpI === Infinity ? '∞' : oldDpI}, ${newValue})<br>
                                <strong>dp[${i}] = ${newValue}</strong> ✓
                            </div>
                            <hr class="explanation-hr">
                            <p><strong>Interpretation:</strong></p>
                            <p class="indent">→ Using coin ${coin} gives us a better solution!</p>
                            <p class="indent">→ Amount ${i} can be made with ${newValue} coin(s)</p>
                            <p class="indent">→ Strategy: Use coin ${coin} + solution for amount ${subproblemIndex}</p>
                            <p class="indent">→ dp[${subproblemIndex}] = ${dp[subproblemIndex]} coin(s) for remaining amount ${subproblemIndex}</p>
                            <p class="indent">→ +1 coin (value ${coin}) = total ${newValue} coin(s)</p>
                            <hr class="explanation-hr">
                            <div class="dp-update">
                                <strong>dp[${i}]:</strong> ${oldDpI === Infinity ? '∞' : oldDpI} → <span class="updated-value">${newValue}</span>
                            </div>
                        </div>
                    `,
                    codeLine: 16
                });
            } else {
                // No update - current value is already minimum
                steps.push({
                    type: 'no_update',
                    stepNumber: stepNumber++,
                    phase: `NO_UPDATE_dp[${i}]_stays_${dp[i]}_coin=${coin}_not_better`,
                    i: i,
                    coin: coin,
                    j: j,
                    subproblemIndex: subproblemIndex,
                    currentValue: dp[i],
                    candidate: newValue,
                    dp: [...dp],
                    explanation: `
                        <div class="no-update">NO UPDATE: Current value is already minimum</div>
                        <div class="step-detail">
                            <p><strong>Outer Loop (i):</strong> ${i}</p>
                            <p><strong>Inner Loop (j):</strong> ${j} (coin = ${coin})</p>
                            <hr class="explanation-hr">
                            <p><strong>Comparison Result:</strong> ${newValue} < ${dp[i]} → <strong>FALSE ✗</strong></p>
                            <p class="indent">→ ${newValue} is NOT less than ${dp[i]}</p>
                            <hr class="explanation-hr">
                            <p><strong>Why no update?</strong></p>
                            <div class="formula">
                                dp[${i}] = min(dp[${i}], dp[${subproblemIndex}] + 1)<br>
                                dp[${i}] = min(${dp[i]}, ${newValue})<br>
                                <strong>dp[${i}] = ${dp[i]} (no change)</strong>
                            </div>
                            <hr class="explanation-hr">
                            <p><strong>Interpretation:</strong></p>
                            <p class="indent">→ Using coin ${coin} requires ${newValue} coin(s)</p>
                            <p class="indent">→ But dp[${i}] is already ${dp[i]} (better or equal)</p>
                            <p class="indent">→ Current solution for amount ${i} is already optimal</p>
                            <p class="indent">→ Coin ${coin} does not improve the solution</p>
                            <hr class="explanation-hr">
                            <p><strong>dp[${i}] remains:</strong> ${dp[i]}</p>
                        </div>
                    `,
                    codeLine: 16
                });
            }

            // Show dp array state after inner loop iteration
            steps.push({
                type: 'inner_loop_end',
                stepNumber: stepNumber++,
                phase: `INNER_LOOP_END_coin=${coin}`,
                i: i,
                coin: coin,
                j: j,
                dp: [...dp],
                explanation: `
                    <div class="loop-end">INNER LOOP iteration complete (coin ${coin})</div>
                    <div class="step-detail">
                        <p><strong>Completed checking:</strong> coin ${coin}</p>
                        <hr class="explanation-hr">
                        <div class="dp-state">
                            <strong>Current DP Array:</strong><br>
                            ${dp.map((v, idx) => {
                                const display = v === Infinity ? '∞' : v;
                                const highlight = idx === i ? ' ← current' : '';
                                return `dp[${idx}] = ${display}${highlight}`;
                            }).join('<br>')}
                        </div>
                        <hr class="explanation-hr">
                        <p>${j < coins.length - 1 ? `Next: Will check coin ${coins[j + 1]}` : 'Inner loop complete for this amount'}</p>
                    </div>
                `,
                codeLine: 11
            });
        }

        // Show dp array state after completing inner loop for amount i
        steps.push({
            type: 'outer_loop_end',
            stepNumber: stepNumber++,
            phase: `OUTER_LOOP_END_dp[${i}]=${dp[i]}`,
            i: i,
            finalValue: dp[i],
            dp: [...dp],
            explanation: `
                <div class="loop-end">OUTER LOOP complete for i = ${i}</div>
                <div class="step-detail">
                    <p><strong>Amount ${i} computation:</strong> COMPLETE ✓</p>
                    <p><strong>Final dp[${i}]:</strong> ${dp[i] === Infinity ? '∞ (unreachable)' : dp[i] + ' coin(s)'}</p>
                    ${dp[i] !== Infinity ? `<p class="indent">→ Minimum coins to make amount ${i}: <strong>${dp[i]}</strong></p>` : '<p class="indent">→ Amount ' + i + ' cannot be made with given coins</p>'}
                    <hr class="explanation-hr">
                    <div class="dp-state">
                        <strong>DP Array after computing amount ${i}:</strong><br>
                        ${dp.map((v, idx) => {
                            const display = v === Infinity ? '∞' : v;
                            const highlight = idx === i ? ' ← just computed' : '';
                            return `dp[${idx}] = ${display}${highlight}`;
                        }).join('<br>')}
                    </div>
                    <hr class="explanation-hr">
                    <p>${i < amount ? `Next: Will compute dp[${i + 1}]` : 'All amounts computed!'}</p>
                </div>
            `,
            codeLine: 11
        });
    }

    // ============================================================
    // STEP 3: FINAL RESULT PHASE
    // ============================================================
    const finalResult = dp[amount] === Infinity ? -1 : dp[amount];

    steps.push({
        type: 'final_result',
        stepNumber: stepNumber++,
        phase: 'FINAL_RESULT',
        dp: [...dp],
        result: finalResult,
        explanation: `
            <div class="phase-header">PHASE 3: FINAL RESULT</div>
            <div class="step-detail">
                <p><strong>Algorithm Complete!</strong></p>
                <hr class="explanation-hr">
                <p><strong>Final DP Array:</strong></p>
                <div class="dp-state">
                    ${dp.map((v, idx) => `dp[${idx}] = ${v === Infinity ? '∞ (unreachable)' : v}`).join('<br>')}
                </div>
                <hr class="explanation-hr">
                <p><strong>Answer:</strong></p>
                <p class="indent">Target amount = ${amount}</p>
                <p class="indent">dp[${amount}] = ${finalResult === -1 ? 'Infinity (no valid combination)' : finalResult}</p>
                ${finalResult !== -1 ? `<p class="result-final"><strong>Minimum coins needed: ${finalResult}</strong></p>` : '<p class="result-final">No valid coin combination exists!</p>'}
            </div>
        `,
        codeLine: 25
    });
}

function renderTable() {
    dpTableBody.innerHTML = '';

    for (let i = 0; i <= amount; i++) {
        const row = document.createElement('tr');
        row.id = `row-${i}`;

        const indexCell = document.createElement('td');
        indexCell.textContent = i;
        row.appendChild(indexCell);

        const valueCell = document.createElement('td');
        valueCell.id = `cell-${i}`;
        const value = steps[currentStepIndex].dp[i];
        valueCell.textContent = value === Infinity ? 'Infinity' : value;
        if (value === Infinity) {
            valueCell.classList.add('infinity');
        }
        row.appendChild(valueCell);

        dpTableBody.appendChild(row);
    }
}

function updateTable() {
    const step = steps[currentStepIndex];

    for (let i = 0; i <= amount; i++) {
        const row = document.getElementById(`row-${i}`);
        const cell = document.getElementById(`cell-${i}`);

        // Remove old classes
        row.classList.remove('current-row');
        cell.classList.remove('updated', 'current-cell');

        // Update value
        const value = step.dp[i];
        cell.textContent = value === Infinity ? 'Infinity' : value;
        if (value === Infinity) {
            cell.classList.add('infinity');
        } else {
            cell.classList.remove('infinity');
        }
    }

    // Highlight current row
    if (step.i !== undefined) {
        document.getElementById(`row-${step.i}`).classList.add('current-row');
    }

    // Highlight updated cell
    if (step.type === 'update') {
        const cell = document.getElementById(`cell-${step.i}`);
        cell.classList.add('updated');
    }
}

function updateExplanation() {
    const step = steps[currentStepIndex];
    explanationContent.innerHTML = step.explanation;
    explanationContent.classList.add('fade-in');
    setTimeout(() => explanationContent.classList.remove('fade-in'), 300);

    // Update phase indicator
    if (step.phase) {
        // Format the phase name for display
        let displayPhase = step.phase
            .replace(/_/g, ' ')
            .replace(/i=/g, 'i=')
            .replace(/coin=/g, 'coin=')
            .replace(/dp\[/g, 'dp[');

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
    const step = steps[currentStepIndex];
    resultSection.style.display = 'block';

    if (step.result === -1) {
        resultContent.innerHTML = `
            <p>It's not possible to make amount ${amount} with the given coins: ${coins.join(', ')}</p>
        `;
    } else {
        // Find actual coin combination (backtrack)
        const combination = findCoinCombination();
        resultContent.innerHTML = `
            <p>Minimum coins needed: ${step.result}</p>
            <div class="coin-display">
                ${combination.map(c => `<div class="coin">${c}</div>`).join('')}
            </div>
        `;
    }
}

function findCoinCombination() {
    const result = [];
    let remaining = amount;
    const dpCopy = [...dp];

    while (remaining > 0) {
        for (const coin of coins) {
            if (coin <= remaining && dpCopy[remaining - coin] !== Infinity) {
                if (dpCopy[remaining - coin] + 1 === dpCopy[remaining]) {
                    result.push(coin);
                    remaining -= coin;
                    break;
                }
            }
        }
    }

    return result;
}

function nextStep() {
    if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        updateTable();
        updateExplanation();
        updateCodeHighlight();
        updateButtons();
    }
}

function previousStep() {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        updateTable();
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
    dpTableBody.innerHTML = '';
    explanationContent.innerHTML = '<p>Click "Visualize" to start the algorithm visualization.</p>';
}
