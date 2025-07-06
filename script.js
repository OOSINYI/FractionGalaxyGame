document.addEventListener('DOMContentLoaded', () => {
    const gameModesDiv = document.getElementById('game-modes');
    const gameAreaDiv = document.getElementById('game-area');
    const gameOverDiv = document.getElementById('game-over');
    const startAdditionBtn = document.getElementById('start-addition');
    const startSubtractionBtn = document.getElementById('start-subtraction');
    const miniGameTitle = document.getElementById('mini-game-title');
    const questionDisplay = document.getElementById('question-display');
    const visualAidDiv = document.getElementById('visual-aid');
    const numeratorInput = document.getElementById('numerator-input');
    const denominatorInput = document.getElementById('denominator-input');
    const submitAnswerBtn = document.getElementById('submit-answer');
    const feedbackDisplay = document.getElementById('feedback-display');
    const nextQuestionBtn = document.getElementById('next-question');
    const scoreDisplay = document.getElementById('score-display');
    const restartGameBtn = document.getElementById('restart-game');

    let currentQuestion = null;
    let score = 0;
    let totalQuestions = 0;
    let gameMode = ''; // 'addition' or 'subtraction'
    const MAX_QUESTIONS = 5; // Number of questions per round

    // Helper function to find the greatest common divisor (GCD)
    function gcd(a, b) {
        if (b === 0) return a;
        return gcd(b, a % b);
    }

    // Helper function to simplify a fraction
    function simplifyFraction(numerator, denominator) {
        const common = gcd(numerator, denominator);
        return {
            numerator: numerator / common,
            denominator: denominator / common
        };
    }

    // Function to generate a random fraction
    function generateFraction(maxDenominator = 10) {
        let denominator = Math.floor(Math.random() * (maxDenominator - 2)) + 2; // Denominator from 2 to maxDenominator
        let numerator = Math.floor(Math.random() * (denominator - 1)) + 1; // Numerator from 1 to denominator-1
        return simplifyFraction(numerator, denominator);
    }

    // Function to display fractions visually (simplified)
    function displayVisualAid(fraction1, fraction2 = null, operation = null) {
        visualAidDiv.innerHTML = ''; // Clear previous visuals

        const createFractionBar = (num, den, label) => {
            const barContainer = document.createElement('div');
            barContainer.className = 'fraction-bar';
            barContainer.title = `${num}/${den}`;

            const fillWidth = (num / den) * 100;
            const fillDiv = document.createElement('div');
            fillDiv.className = 'fraction-fill';
            fillDiv.style.width = `${fillWidth}%`;
            
            const labelDiv = document.createElement('div');
            labelDiv.className = 'fraction-label';
            labelDiv.textContent = `${num}/${den}`;
            labelDiv.style.position = 'absolute';
            labelDiv.style.width = '100%';
            labelDiv.style.textAlign = 'center';
            labelDiv.style.lineHeight = '50px';
            labelDiv.style.color = '#fff';
            labelDiv.style.textShadow = '1px 1px 2px #000';

            barContainer.appendChild(fillDiv);
            barContainer.appendChild(labelDiv);
            return barContainer;
        };

        if (fraction1) {
            visualAidDiv.appendChild(createFractionBar(fraction1.numerator, fraction1.denominator, 'Fraction 1'));
        }
        if (fraction2 && operation === '+') {
            const plusSign = document.createElement('span');
            plusSign.textContent = '+';
            plusSign.style.fontSize = '2em';
            plusSign.style.margin = '0 10px';
            visualAidDiv.appendChild(plusSign);
            visualAidDiv.appendChild(createFractionBar(fraction2.numerator, fraction2.denominator, 'Fraction 2'));
        } else if (fraction2 && operation === '-') {
            const minusSign = document.createElement('span');
            minusSign.textContent = '-';
            minusSign.style.fontSize = '2em';
            minusSign.style.margin = '0 10px';
            visualAidDiv.appendChild(minusSign);
            visualAidDiv.appendChild(createFractionBar(fraction2.numerator, fraction2.denominator, 'Fraction to Subtract'));
        }
    }


    // Function to generate and display a new addition question
    function generateAdditionQuestion() {
        let f1 = generateFraction();
        let f2 = generateFraction();

        // Ensure denominators are sometimes different for complexity
        if (Math.random() < 0.5) { // 50% chance of different denominators
            let lcm = (f1.denominator * f2.denominator) / gcd(f1.denominator, f2.denominator);
            let n1 = f1.numerator * (lcm / f1.denominator);
            let n2 = f2.numerator * (lcm / f2.denominator);
            currentQuestion = {
                f1: f1,
                f2: f2,
                answer: simplifyFraction(n1 + n2, lcm)
            };
        } else { // Same denominators
            let commonDen = Math.floor(Math.random() * 8) + 2;
            f1 = { numerator: Math.floor(Math.random() * (commonDen - 1)) + 1, denominator: commonDen };
            f2 = { numerator: Math.floor(Math.random() * (commonDen - 1)) + 1, denominator: commonDen };
            currentQuestion = {
                f1: f1,
                f2: f2,
                answer: simplifyFraction(f1.numerator + f2.numerator, commonDen)
            };
        }

        questionDisplay.textContent = `Mix: ${currentQuestion.f1.numerator}/${currentQuestion.f1.denominator} + ${currentQuestion.f2.numerator}/${currentQuestion.f2.denominator} = ?`;
        displayVisualAid(currentQuestion.f1, currentQuestion.f2, '+');
    }

    // Function to generate and display a new subtraction question
    function generateSubtractionQuestion() {
        let f1, f2;
        let commonDen;
        let num1, num2;

        do {
            commonDen = Math.floor(Math.random() * 8) + 2; // Denominator from 2 to 9
            f1 = { numerator: Math.floor(Math.random() * (commonDen - 1)) + 1, denominator: commonDen };
            f2 = { numerator: Math.floor(Math.random() * (commonDen - 1)) + 1, denominator: commonDen };

            // For subtraction, ensure f1 >= f2
            if (f1.numerator < f2.numerator) {
                [f1, f2] = [f2, f1]; // Swap if f1 is smaller
            }
            num1 = f1.numerator;
            num2 = f2.numerator;
        } while (num1 - num2 <= 0); // Ensure result is positive

        // Introduce unlike denominators sometimes
        if (Math.random() < 0.5) {
            let lcm = (f1.denominator * f2.denominator) / gcd(f1.denominator, f2.denominator);
            num1 = f1.numerator * (lcm / f1.denominator);
            num2 = f2.numerator * (lcm / f2.denominator);
            f1 = { numerator: num1, denominator: lcm };
            f2 = { numerator: num2, denominator: lcm };

            if (f1.numerator < f2.numerator) { // Re-check after finding common denominator
                let temp = f1;
                f1 = f2;
                f2 = temp;
                num1 = f1.numerator;
                num2 = f2.numerator;
            }
        }


        currentQuestion = {
            f1: f1,
            f2: f2,
            answer: simplifyFraction(num1 - num2, f1.denominator)
        };
        
        questionDisplay.textContent = `Split: ${f1.numerator}/${f1.denominator} - ${f2.numerator}/${f2.denominator} = ?`;
        displayVisualAid(f1, f2, '-');
    }

    // Function to start a new game
    function startGame(mode) {
        gameMode = mode;
        score = 0;
        totalQuestions = 0;
        gameModesDiv.classList.add('hidden');
        gameOverDiv.classList.add('hidden');
        gameAreaDiv.classList.remove('hidden');
        feedbackDisplay.textContent = '';
        numeratorInput.value = '';
        denominatorInput.value = '';
        nextQuestionBtn.classList.add('hidden');
        submitAnswerBtn.disabled = false;

        miniGameTitle.textContent = gameMode === 'addition' ? "Planet Fuel Mix-Up" : "Asteroid Fraction Split";
        generateQuestion();
    }

    // Function to handle generating the next question based on game mode
    function generateQuestion() {
        totalQuestions++;
        if (totalQuestions > MAX_QUESTIONS) {
            endGame();
            return;
        }

        feedbackDisplay.textContent = '';
        numeratorInput.value = '';
        denominatorInput.value = '';
        submitAnswerBtn.disabled = false;
        nextQuestionBtn.classList.add('hidden');

        if (gameMode === 'addition') {
            generateAdditionQuestion();
        } else {
            generateSubtractionQuestion();
        }
    }

    // Function to check the player's answer
    function checkAnswer() {
        const playerNum = parseInt(numeratorInput.value);
        const playerDen = parseInt(denominatorInput.value);

        if (isNaN(playerNum) || isNaN(playerDen) || playerDen === 0) {
            feedbackDisplay.textContent = "Please enter valid numbers for numerator and denominator.";
            feedbackDisplay.className = 'feedback incorrect';
            return;
        }

        const playerAnswer = simplifyFraction(playerNum, playerDen);
        const correctAnswer = currentQuestion.answer;

        if (playerAnswer.numerator === correctAnswer.numerator && playerAnswer.denominator === correctAnswer.denominator) {
            feedbackDisplay.textContent = "Correct! Blast off!";
            feedbackDisplay.className = 'feedback correct';
            score++;
        } else {
            feedbackDisplay.textContent = `Incorrect. The correct answer was ${correctAnswer.numerator}/${correctAnswer.denominator}.`;
            feedbackDisplay.className = 'feedback incorrect';
        }
        submitAnswerBtn.disabled = true;
        nextQuestionBtn.classList.remove('hidden');
    }

    // Function to end the game
    function endGame() {
        gameAreaDiv.classList.add('hidden');
        gameOverDiv.classList.remove('hidden');
        scoreDisplay.textContent = `You answered ${score} out of ${MAX_QUESTIONS} questions correctly!`;
    }

    // Event Listeners
    startAdditionBtn.addEventListener('click', () => startGame('addition'));
    startSubtractionBtn.addEventListener('click', () => startGame('subtraction'));
    submitAnswerBtn.addEventListener('click', checkAnswer);
    nextQuestionBtn.addEventListener('click', generateQuestion);
    restartGameBtn.addEventListener('click', () => {
        gameOverDiv.classList.add('hidden');
        gameModesDiv.classList.remove('hidden');
        // Clear previous state for a fresh start
        feedbackDisplay.textContent = '';
        questionDisplay.textContent = '';
        visualAidDiv.innerHTML = '';
        numeratorInput.value = '';
        denominatorInput.value = '';
    });

    // Allow pressing Enter to submit answer
    numeratorInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !submitAnswerBtn.disabled) {
            submitAnswerBtn.click();
        }
    });
    denominatorInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !submitAnswerBtn.disabled) {
            submitAnswerBtn.click();
        }
    });
});