class MemoryGame {
  constructor() {
    // Get references to DOM elements
    this.cards = document.querySelectorAll(".memory-card");
    this.gameContainer = document.querySelector(".game-container");
    this.introPage = document.querySelector(".introBlock");
    this.btnBlock = document.querySelector(".btnBlock");
    this.matchedAllCardsMessage = document.querySelector("#victoryMessage");
    this.displayGameOverMessage = document.querySelector("#gameOver");
    this.scoreElement = document.querySelector(".score");
    this.scoreElement.style.display = "none";
    this.timeBoard = document.querySelector(".timer");
    this.timeBoard.style.display = "none";
    this.moveElement = document.querySelector(".moves");
    this.moveElement.style.display = "none";
    this.startBtn = document.querySelector("#startBtn");
    this.restartBtn = document.querySelector("#restartBtn");
    this.goBackBtn = document.querySelector("#goBackToHomePageBtn");
    this.scoreHistoryList = document.getElementById("scoreHistoryList");
    this.scoreHistoryList.style.display = "none";
    this.scoreHistorySection = document.querySelector(".score-history");
    this.scoreHistorySection.style.display = "none";

    this.playerNameInput = document.getElementById("playerName");

    this.restartBtn.addEventListener("click", () => this.startGame());
    this.startBtn.addEventListener("click", () => this.startGame());
    this.goBackBtn.addEventListener("click", () => this.homePage());

    this.moveCount = 0;

    this.matchOccurred = false;
    this.cardFlipped = false;
    this.boardLocked = false;
    this.firstCardClicked = null;
    this.secondCardClicked = null;
    this.duration = 90;
    this.timerInterval = null; // Single timer instance for better control
    this.scoreHistory = [];
  }

  // Methods

  // Display home page
  homePage() {
    this.gameContainer.style.display = "none";
    this.introPage.style.display = "flex";
    this.btnBlock.style.display = "none";
    this.startBtn.style.display = "block";
    this.matchedAllCardsMessage.style.display = "none";
    this.restartBtn.style.display = "none";
    this.scoreElement.style.display = "none";
    this.timeBoard.style.display = "none";
    this.moveElement.style.display = "none";
    this.scoreHistorySection.style.display = "none";
  }

  // Start the game
  startGame() {
    const playerName = this.playerNameInput.value.trim();
    if (playerName === "") {
      alert("Please enter your name to start the game.");
      return;
    }

    this.introPage.style.display = "none";
    this.startBtn.style.display = "none";
    this.gameContainer.style.display = "grid"; // This line controls the grid container visibility
    this.btnBlock.style.display = "flex";
    this.scoreElement.style.display = "block";
    this.timeBoard.style.display = "block";
    this.moveElement.style.display = "block";
    this.matchedAllCardsMessage.style.display = "none";
    this.displayGameOverMessage.style.display = "none";
    this.scoreHistorySection.style.display = "none";

    this.moveCount = 0;
    const moveDisplay = document.getElementById("moveDisplay");
    moveDisplay.textContent = this.moveCount;

    this.shuffleCards();

    // Temporarily flip all cards to reveal images
    this.cards.forEach((card) => card.classList.add("flip"));
    let isCardRevealDone = false;

    setTimeout(() => {
      this.resetBoard();
      this.cards.forEach((card) => card.classList.remove("flip"));
      isCardRevealDone = true; // Set flag before adding event listener

      // Ensure listeners are attached after reveal
      this.cards.forEach((card) => {
        if (isCardRevealDone) {
          card.addEventListener("click", (event) => this.flipCard(event));
        }
      });

      this.startTimer();
    }, 1500); // Adjust the delay as needed

    // Clear any existing timer interval before starting a new one
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.duration = 90; // Reset duration
  }

  // Shuffle cards
  shuffleCards() {
    // Randomly order cards using Math.floor and requestAnimationFrame for smoother shuffling
    this.cards.forEach((card) => {
      card.style.order = Math.floor(Math.random() * this.cards.length);
      window.requestAnimationFrame(() => {
        card.style.transition = "transform 0.5s ease-in-out"; // Smooth shuffling animation
      });
    });
  }

  // Handle card match
  handleCardMatch() {
    const timeTaken = 90 - this.duration;
    const score = this.calculateScore(timeTaken, this.moveCount);

    if (this.allCardsMatched()) {
      this.displayMotivationalMessage(score);
      clearInterval(this.timerInterval); // Stop the timer on win
      this.timeBoard.style.display = "none";
      this.saveScore(score);
    } else {
      // Update the score display
      const scoreDisplay = document.getElementById("scoreDisplay");
      scoreDisplay.innerText = score;
    }
  }

  // Disable cards
  disableCards() {
    const disabledCards = [this.firstCardClicked, this.secondCardClicked];
    disabledCards.forEach((card) =>
      card.removeEventListener("click", this.flipCard)
    );

    this.resetBoard();
  }

  // Unflip cards
  unflipCards() {
    this.boardLocked = true;
    setTimeout(() => {
      this.firstCardClicked.classList.remove("flip");
      this.secondCardClicked.classList.remove("flip");
      this.resetBoard();
    }, 1300);
  }

  // Flip card
  flipCard(event) {
    const card = event.currentTarget;
    if (
      this.boardLocked ||
      card === this.firstCardClicked ||
      card.classList.contains("flip")
    )
      return;

    card.classList.add("flip");

    if (!this.firstCardClicked) {
      this.firstCardClicked = card;
    } else {
      this.secondCardClicked = card;
      this.handleCardMatch();
    }

    this.moveCount += 1;
    const moveDisplay = document.getElementById("moveDisplay");
    moveDisplay.textContent = `${this.moveCount}`;
  }

  // Reset board
  resetBoard() {
    this.cardFlipped = false;
    this.boardLocked = false;
    this.firstCardClicked = null;
    this.secondCardClicked = null;
  }

  // Check if all cards are matched
  allCardsMatched() {
    return [...this.cards].every((card) => card.classList.contains("flip"));
  }

  // Start timer
  startTimer() {
    this.timerInterval = setInterval(() => {
      this.updateTimerDisplay();
      if (this.duration <= 0) {
        this.gameOverByTime();
        clearInterval(this.timerInterval);
      }
      this.duration--;
    }, 1000); // Update every second
  }

  // Update timer display
  updateTimerDisplay() {
    const minutes = Math.floor(this.duration / 60);
    const seconds = Math.floor(this.duration % 60);
    const formattedTime =
      minutes.toString().padStart(2, "0") +
      ":" +
      seconds.toString().padStart(2, "0");
    this.timeBoard.innerText = formattedTime;
  }

  // Display game over message
  displayMotivationalMessage(score) {
    this.gameContainer.style.display = "none";
    this.matchedAllCardsMessage.style.display = "block";
    this.restartBtn.style.display = "block";
    this.displayGameOverMessage.style.display = "none";
    this.displayScoreHistory();

    // Check if the 'emoji' element exists before updating its textContent
    const emoji = document.getElementById("emoji");
    if (emoji) {
      if (score >= 30) {
        emoji.textContent = "🎉";
      } else {
        emoji.textContent = ""; // Clear emoji if score is below 30
      }
    } else {
      console.error("Emoji element not found.");
    }
  }

  // Game over by time
  gameOverByTime() {
    this.displayGameOverMessage.style.display = "block";
    this.gameContainer.style.display = "none";
    this.scoreElement.style.display = "none";
    this.timeBoard.style.display = "none";
    this.restartBtn.style.display = "block";
    this.moveElement.style.display = "none";
    this.saveScore(); // Score is 0 because the game ended due to time
    this.displayScoreHistory();
  }

  // Save score
  saveScore(score) {
    const playerName = this.playerNameInput.value.trim();
    if (!playerName) {
      console.error("Player name is required.");
      return;
    }

    const scoreEntry = {
      name: playerName,
      score: score,
      moves: this.moveCount,
      timeTaken: 90 - this.duration, // Calculate time taken
      timestamp: new Date().toISOString(), // Add timestamp
    };

    // Initialize scoreHistory if not already initialized
    if (!this.scoreHistory) {
      this.scoreHistory = [];
    }

    // Push the new score entry
    this.scoreHistory.push(scoreEntry);

    try {
      // Save to localStorage (conditionally)
      if (this.gameOver) {
        localStorage.setItem("scoreHistory", JSON.stringify(this.scoreHistory));
        console.log("Score saved to localStorage.");
      }
    } catch (error) {
      console.error("Error saving score to localStorage:", error);
    }

    // Display score history immediately after saving the new score
    this.displayScoreHistory();
  }

  // Display score history
  displayScoreHistory() {
    // Display score history section
    this.scoreHistorySection.style.display = "block";

    // Retrieve score history from localStorage
    const storedHistory = JSON.parse(localStorage.getItem("scoreHistory"));
    if (storedHistory) {
      this.scoreHistory = storedHistory;
    }

    // Populate score history list
    const scoreHistoryList = document.getElementById("scoreHistoryList");
    scoreHistoryList.textContent = ""; // Clear existing list items

    // Add new score entries to the list
    this.scoreHistory.forEach((entry) => {
      const listItem = document.createElement("li");
      listItem.textContent =
        `Name: ${entry.name} with ${entry.score} points` +
        ` in ${entry.moves} moves - ${entry.timeTaken} seconds`;

      // Adding style to the list item
      listItem.style.color = "blue"; // Change the color as desired

      scoreHistoryList.appendChild(listItem);
    });

    // Show score history list
    scoreHistoryList.style.display = "block";
  }

  // Calculate score
  calculateScore(timeTaken, moveCount) {
    const BASE_SCORE = 100;
    const TIME_BONUS_MULTIPLIER = 50;
    const MOVE_PENALTY_MULTIPLIER = 10;
    const timeBonus = Math.floor(
      (this.duration - timeTaken) * TIME_BONUS_MULTIPLIER
    );
    const movePenalty = moveCount * MOVE_PENALTY_MULTIPLIER;
    return BASE_SCORE + timeBonus - movePenalty;
  }
}

// Initialize the game
const game = new MemoryGame();
