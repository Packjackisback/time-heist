document.addEventListener("DOMContentLoaded", () => {
  const selectedMissionId = sessionStorage.getItem("selectedMission");
  if (!selectedMissionId) {
    alert("No mission selected!");
    window.location.href = "index.html";
    return;
  }

  fetch("assets/data/missions.json")
    .then((response) => response.json())
    .then((missions) => {
      const mission = missions.find((m) => m.id === selectedMissionId);
      if (mission) {
        loadMission(mission);
      } else {
        alert("Mission not found!");
        window.location.href = "index.html";
      }
    })
    .catch((error) => {
      console.error("Error loading mission data:", error);
    });
});

function loadMission(mission) {
  console.log(`Loading mission: ${mission.name}`);

  document.getElementById("mission-title").textContent = mission.name;
  document.getElementById("mission-briefing").textContent = mission.briefing;
  const eventId = mission.id;
  initializeEvent(eventId, ["dialogue", "intel-gathering", "stealth"]);
  const objectiveList = document.getElementById("objective-list");
  objectiveList.innerHTML = ""; 
  mission.objectives.forEach((objective, index) => {
    const li = document.createElement("li");
    li.textContent = objective.description;
    li.dataset.index = index; 
    objectiveList.appendChild(li);
  });

  updateActionButtons(mission);
}

function updateActionButtons(mission) {
  const actionContainer = document.getElementById("actions");
  actionContainer.innerHTML = ""; 

  if (mission.objectives && mission.objectives.length > 0) {
    mission.objectives.forEach((objective) => {
      const button = document.createElement("button");
      button.textContent = objective.description; 
      button.onclick = () => performAction(objective, mission);
      actionContainer.appendChild(button);
    });
  } else {
    console.warn("No objectives found for this mission.");
  }
}


function performAction(objective, mission) {
    console.log(`Performing action for objective: ${objective.id}`);
    const eventId = sessionStorage.getItem("selectedMission");

    switch (objective.action) {
        case "dialogue":
            startDialogMinigame(objective.dialogue);
            trackGameCompletionForEvent(eventId, "dialogue", true);
            completeObjective(mission.objectives.findIndex(obj => obj.id === objective.id)); // Complete the specific objective
            checkMissionCompletion(mission); // Check if all objectives are done
            break;
        case "minesweeper":
            window.location.href = "puzzle.html";
            break;
        case "intel-gathering":
            startIntelGatheringMinigame(objective.parameters);
            trackGameCompletionForEvent(eventId, "intel-gathering", true);
            completeObjective(mission.objectives.findIndex(obj => obj.id === objective.id)); // Complete the specific objective
            checkMissionCompletion(mission); // Check if all objectives are done
            break;
        case "rescue":
            startStealthMinigame();
            trackGameCompletionForEvent(eventId, "stealth", true);
            completeObjective(mission.objectives.findIndex(obj => obj.id === objective.id)); // Complete the specific objective
            checkMissionCompletion(mission); // Check if all objectives are done
            break;
        default:
            console.error("Unknown action type:", objective.action);
    }
}


function startDialogMinigame(dialogue) {
  console.log("Starting dialogue minigame:", dialogue);

  const dialogueContainer = document.createElement("div");
  dialogueContainer.id = "dialogue-container";
  dialogueContainer.style.position = "fixed";
  dialogueContainer.style.top = "50%";
  dialogueContainer.style.left = "50%";
  dialogueContainer.style.transform = "translate(-50%, -50%)";
  dialogueContainer.style.width = "50%";
  dialogueContainer.style.padding = "20px";
  dialogueContainer.style.border = "2px solid black";
  dialogueContainer.style.backgroundColor = "white";
  dialogueContainer.style.zIndex = "1000";

  const promptElement = document.createElement("p");
  promptElement.textContent = dialogue.prompt;
  dialogueContainer.appendChild(promptElement);

  dialogue.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.textContent = choice;
    button.style.display = "block";
    button.style.margin = "10px 0";
    button.onclick = () => handleAnswer(index, dialogue.correctAnswer, dialogueContainer);
    dialogueContainer.appendChild(button);
  });

  document.body.appendChild(dialogueContainer);
}

function handleAnswer(selectedIndex, correctAnswer, dialogueContainer) {
  if (selectedIndex === correctAnswer) {
    alert("Correct! You know your history ;)");
    trackMinigameResult("dialogue", true); 
  } else {
    alert("Incorrect. This is probably a bad question");
    trackMinigameResult("dialogue", false);
  }

  document.body.removeChild(dialogueContainer);

  completeObjective(0); 
}

function completeObjective(objectiveIndex) {
    const objectives = document.querySelectorAll("#objective-list li");
    if (objectives[objectiveIndex]) {
        objectives[objectiveIndex].classList.add("complete");
    }
}

function trackMinigameResult(minigameId, success) {
  const minigameResults = JSON.parse(sessionStorage.getItem("minigameResults") || "{}");
  minigameResults[minigameId] = success;
  sessionStorage.setItem("minigameResults", JSON.stringify(minigameResults));
}

function startIntelGatheringMinigame(parameters) {
  console.log("Starting matching card minigame with parameters:", parameters);

  const intelContainer = document.createElement("div");
  intelContainer.id = "intel-container";
  intelContainer.style.position = "fixed";
  intelContainer.style.top = "50%";
  intelContainer.style.left = "50%";
  intelContainer.style.transform = "translate(-50%, -50%)";
  intelContainer.style.width = "80%";
  intelContainer.style.height = "80%";
  intelContainer.style.padding = "20px";
  intelContainer.style.border = "2px solid black";
  intelContainer.style.backgroundColor = "white";
  intelContainer.style.zIndex = "1000";
  intelContainer.style.display = "flex";
  intelContainer.style.flexWrap = "wrap";
  intelContainer.style.justifyContent = "center";

  const clues = ["♠", "♥", "♦", "♣"]; 
  const cards = [...clues, ...clues]; 
  shuffleArray(cards); 

  cards.forEach((clue, index) => {
    const card = document.createElement("div");
    card.className = "intel-card";
    card.dataset.clue = clue;
    card.style.width = "100px";
    card.style.height = "150px";
    card.style.margin = "10px";
    card.style.border = "1px solid #ccc";
    card.style.backgroundColor = "#f9f9f9";
    card.style.display = "flex";
    card.style.alignItems = "center";
    card.style.justifyContent = "center";
    card.style.fontSize = "32px";
    card.style.fontWeight = "bold";
    card.style.cursor = "pointer";
    card.style.textAlign = "center";

    card.textContent = "";
    card.onclick = () => handleCardClick(card, intelContainer);

    intelContainer.appendChild(card);
  });

  document.body.appendChild(intelContainer);
}

function handleCardClick(card, intelContainer) {
  if (card.classList.contains("revealed")) return; 

  card.textContent = card.dataset.clue;
  card.classList.add("revealed");

  const revealedCards = document.querySelectorAll(".intel-card.revealed:not(.matched)");
  if (revealedCards.length === 2) {
    const [card1, card2] = revealedCards;
    if (card1.dataset.clue === card2.dataset.clue) {
      card1.classList.add("matched");
      card2.classList.add("matched");
      checkGameCompletion(intelContainer);
    } else {
      setTimeout(() => {
        card1.textContent = "";
        card2.textContent = "";
        card1.classList.remove("revealed");
        card2.classList.remove("revealed");
      }, 1000);
    }
  }
}

function checkGameCompletion(intelContainer) {
  const unmatchedCards = document.querySelectorAll(".intel-card:not(.matched)");
  if (unmatchedCards.length === 0) {
    alert("Intel gathered successfully!");
    trackMinigameResult("intel-gathering", true);
    document.body.removeChild(intelContainer); 
    completeObjective(0);
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


function startStealthMinigame() {
  console.log("Starting stealth minigame");

  const gameContainer = document.createElement("div");
  gameContainer.id = "stealth-game-container";
  gameContainer.style.position = "fixed";
  gameContainer.style.top = "0";
  gameContainer.style.left = "0";
  gameContainer.style.width = "100%";
  gameContainer.style.height = "100%";
  gameContainer.style.backgroundColor = "black";
  gameContainer.style.zIndex = "1000";
  document.body.appendChild(gameContainer);

  const player = document.createElement("div");
  player.id = "player";
  player.style.position = "absolute";
  player.style.width = "20px";
  player.style.height = "20px";
  player.style.backgroundColor = "blue";
  player.style.top = "90%";
  player.style.left = "10%";
  gameContainer.appendChild(player);

  const enemy = document.createElement("div");
  enemy.id = "enemy";
  enemy.style.position = "absolute";
  enemy.style.width = "20px";
  enemy.style.height = "20px";
  enemy.style.backgroundColor = "red";
  enemy.style.top = "10%";
  enemy.style.left = "90%";
  gameContainer.appendChild(enemy);

  const goal = document.createElement("div");
  goal.id = "goal";
  goal.style.position = "absolute";
  goal.style.width = "30px";
  goal.style.height = "30px";
  goal.style.backgroundColor = "green";
  goal.style.top = "10%";
  goal.style.left = "10%";
  gameContainer.appendChild(goal);

  for (let i = 0; i < 5; i++) {
    const obstacle = document.createElement("div");
    obstacle.className = "obstacle";
    obstacle.style.position = "absolute";
    obstacle.style.width = "50px";
    obstacle.style.height = "50px";
    obstacle.style.backgroundColor = "gray";
    obstacle.style.top = `${Math.floor(Math.random() * 90)}%`;
    obstacle.style.left = `${Math.floor(Math.random() * 90)}%`;
    gameContainer.appendChild(obstacle);
  }

  let playerTop = 90;
  let playerLeft = 10;
  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowUp":
        playerTop = Math.max(0, playerTop - 2);
        break;
      case "ArrowDown":
        playerTop = Math.min(98, playerTop + 2);
        break;
      case "ArrowLeft":
        playerLeft = Math.max(0, playerLeft - 2);
        break;
      case "ArrowRight":
        playerLeft = Math.min(98, playerLeft + 2);
        break;
    }
    player.style.top = `${playerTop}%`;
    player.style.left = `${playerLeft}%`;
    checkCollision(player, enemy, goal, gameContainer);
  });

  setInterval(() => {
    const enemyTop = parseInt(enemy.style.top);
    const enemyLeft = parseInt(enemy.style.left);

    if (enemyTop < playerTop) {
      enemy.style.top = `${Math.min(98, enemyTop + 1)}%`;
    } else if (enemyTop > playerTop) {
      enemy.style.top = `${Math.max(0, enemyTop - 1)}%`;
    }

    if (enemyLeft < playerLeft) {
      enemy.style.left = `${Math.min(98, enemyLeft + 1)}%`;
    } else if (enemyLeft > playerLeft) {
      enemy.style.left = `${Math.max(0, enemyLeft - 1)}%`;
    }

    checkCollision(player, enemy, goal, gameContainer);
  }, 100);
}

function checkCollision(player, enemy, goal, container) {
  const playerRect = player.getBoundingClientRect();
  const enemyRect = enemy.getBoundingClientRect();
  const goalRect = goal.getBoundingClientRect();
  const obstacleRects = Array.from(document.querySelectorAll(".obstacle")).map((obstacle) =>
    obstacle.getBoundingClientRect()
  );

  for (const obstacleRect of obstacleRects) {
    if (
      playerRect.left < obstacleRect.right &&
      playerRect.right > obstacleRect.left &&
      playerRect.top < obstacleRect.bottom &&
      playerRect.bottom > obstacleRect.top
    ) {
      alert("You hit an obstacle! You failed. Try again.");
      document.body.removeChild(container);
      return;
    }
  }

  if (
    playerRect.left < enemyRect.right &&
    playerRect.right > enemyRect.left &&
    playerRect.top < enemyRect.bottom &&
    playerRect.bottom > enemyRect.top
  ) {
    alert("You were caught! This does not bode well for your avenger, and history as a whole.");
    document.body.removeChild(container);
    window.location.href = "game-over.html"; 
    return;
  }

  if (
    playerRect.left < goalRect.right &&
    playerRect.right > goalRect.left &&
    playerRect.top < goalRect.bottom &&
    playerRect.bottom > goalRect.top
  ) {
    alert("Mission accomplished! Way to go :D");
    document.body.removeChild(container);
  }
}


const eventCompletionStatus = {};
const missionCompletionStatus = {};


function initializeEvent(eventId, modes) {
    eventCompletionStatus[eventId] = {};
    modes.forEach((mode) => {
        eventCompletionStatus[eventId][mode] = false;
    });
    missionCompletionStatus[eventId] = {}; // Initialize mission completion
}

function trackGameCompletionForEvent(eventId, game, success) {
    if (!success || !eventCompletionStatus[eventId]) return;
    eventCompletionStatus[eventId][game] = true;
}

function checkEventCompletion(eventId) {
  const eventStatus = eventCompletionStatus[eventId];
  if (!eventStatus) return;
  const allCompleted = Object.values(eventStatus).every((completed) => completed);
  if (allCompleted) {
    displayWinScreenForEvent(eventId);
  }
}

function checkMissionCompletion(mission) {
    const allObjectivesComplete = mission.objectives.every((objective, index) => {
        const objectiveLi = document.querySelector(`#objective-list li[data-index="${index}"]`);
        return objectiveLi && objectiveLi.classList.contains("complete");
    });

    if (allObjectivesComplete) {
        displayWinScreenForEvent(sessionStorage.getItem("selectedMission"));
    }
}

function displayWinScreenForEvent(eventId) {
  document.body.innerHTML = "";

  const winScreen = document.createElement("div");
  winScreen.id = "win-screen";
  winScreen.style.position = "fixed";
  winScreen.style.top = "0";
  winScreen.style.left = "0";
  winScreen.style.width = "100%";
  winScreen.style.height = "100%";
  winScreen.style.backgroundColor = "black";
  winScreen.style.color = "white";
  winScreen.style.display = "flex";
  winScreen.style.flexDirection = "column";
  winScreen.style.justifyContent = "center";
  winScreen.style.alignItems = "center";

  const message = document.createElement("h1");
  message.textContent = `Congratulations! You have completed all missions for Event: ${eventId}`;
  
  winScreen.appendChild(message);

  const restartButton = document.createElement("button");
  restartButton.textContent = "Restart Event";
  restartButton.style.marginTop = "20px";
  restartButton.onclick = () => restartEvent(eventId);
  restartButton.setAttribute('href', "#");
if(restartButton.addEventListener){
   restartButton.addEventListener('click', function(){
      restartEvent(eventId);
   });
}else if(restartButton.attachEvent){
   restartButton.attachEvent('onclick', function(){
      restartEvent(eventId);
   });
}

  winScreen.appendChild(restartButton);

  document.body.appendChild(winScreen);
}
