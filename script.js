const display = document.getElementById('display');
const introScreen = document.getElementById('introScreen');
const calculatorContainer = document.getElementById('calculatorContainer');
const buttons = document.querySelectorAll('.buttons .btn');

let currentInput = '0';
let previousValue = null;
let operation = null;
let waitingForNewValue = true; 
let isAppStarted = false;

let introTitleTimer;

function updateDisplay() {
    currentInput = currentInput.slice(0, 10);
    display.value = currentInput;
}

function clearAll() {
    currentInput = '0';
    previousValue = null;
    operation = null;
    waitingForNewValue = true;
    highlightActiveOperator(null);
    updateDisplay();
}

function handlePlusMinus() {
    if (currentInput === '0') return;
    currentInput = (parseFloat(currentInput) * -1).toString();
    updateDisplay();
}

function handlePercent() {
    currentInput = (parseFloat(currentInput) / 100).toString();
    updateDisplay();
}

/**
 * Handles number and decimal point input.
 * @param {string} value - The number or '.' pressed.
 */
function inputDigit(value) {
    if (waitingForNewValue) {
        currentInput = value === '.' ? '0.' : value;
        waitingForNewValue = false;
    } else if (value === '.') {
        if (!currentInput.includes('.')) {
            currentInput += '.';
        }
    } else {
        currentInput = currentInput === '0' ? value : currentInput + value;
    }
    updateDisplay();
}

function calculate(first, second, op) {
    if (op === '+') return first + second;
    if (op === '-') return first - second;
    if (op === '*') return first * second;
    if (op === '/') {
        if (second === 0) return 'Error'; 
        return first / second;
    }
    return second;
}

/**
 * Performs the pending operation and updates the state.
 * @param {string} nextOperation - The operator pressed (+, -, *, / or =)
 */
function handleOperation(nextOperation) {
    const inputValue = parseFloat(currentInput);

    if (previousValue === null) {
        previousValue = inputValue;
    }
    else if (operation) {
        const result = calculate(previousValue, inputValue, operation);
        
        if (result === 'Error') {
            currentInput = 'Error';
            previousValue = null;
            operation = null;
        } else {
            const roundedResult = Math.round(result * 100000000000) / 100000000000;
            currentInput = String(roundedResult);
            previousValue = roundedResult;
        }
    }

    waitingForNewValue = true;
    operation = nextOperation === '=' ? null : nextOperation;

    highlightActiveOperator(nextOperation);
    updateDisplay();
}

/**
 * Main function to handle all button clicks.
 * @param {string} value - The data-value attribute of the pressed button.
 */
function handleButtonClick(value) {
    if (currentInput === 'Error') {
        if (value === 'C') {
            clearAll();
            return;
        }
        return;
    }

    if (!isNaN(parseFloat(value)) || value === '.') {
        inputDigit(value);
    } else if (['+', '-', '*', '/', '='].includes(value)) {
        handleOperation(value);
    } else if (value === 'C') {
        clearAll();
    } else if (value === '±') {
        handlePlusMinus();
    } else if (value === '%') {
        handlePercent();
    }
}

/**
 * Highlights the currently active operator button (white background, orange text).
 * @param {string} activeOp - The active operator.
 */
function highlightActiveOperator(activeOp) {
 
    document.querySelectorAll('.operator').forEach(btn => {
        btn.style.backgroundColor = '#ff9500';
        btn.style.color = 'white';
    });

    if (activeOp && activeOp !== '=') {
        const activeBtn = document.querySelector(`.operator[data-value="${activeOp}"]`);
        if (activeBtn) {
            activeBtn.style.backgroundColor = 'white';
            activeBtn.style.color = '#ff9500';
        }
    }
}

function startApp() {
    if (isAppStarted) return;
    isAppStarted = true;

    clearTimeout(introTitleTimer);

    introScreen.style.opacity = '0';

    setTimeout(() => {
        introScreen.style.display = 'none';

        calculatorContainer.style.display = 'block';
        setTimeout(() => {
            calculatorContainer.style.opacity = '1';
        }, 10);
    }, 600);
}

function hideTitle() {
    if (isAppStarted) return;

    const welcomeTitle = document.querySelector('.intro h1');
    welcomeTitle.style.opacity = '0';

    setTimeout(() => {
        welcomeTitle.style.display = 'none';
    }, 600);
}

introTitleTimer = setTimeout(hideTitle, 5000);

introScreen.addEventListener('click', startApp);

document.addEventListener('keydown', (event) => {
    startApp();

    let key = event.key;
    if (key === 'Enter') key = '=';
    if (key === 'x') key = '*'; 
    if (key === 'Escape') key = 'C';
    
    const button = document.querySelector(`.btn[data-value="${key}"]`);
    
    if (button) {
        button.click();
        event.preventDefault(); 
    }
});

buttons.forEach(button => {
    button.addEventListener('click', (event) => {
        if (!isNaN(parseFloat(event.target.dataset.value)) || event.target.dataset.value === '.') {
            highlightActiveOperator(null);
        }

        handleButtonClick(event.target.dataset.value);
    });
});

updateDisplay();