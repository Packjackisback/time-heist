document.addEventListener("DOMContentLoaded", () => {
  const puzzleContainer = document.getElementById("puzzle-container");

  const pieces = 12;   for (let i = 0; i < pieces; i++) {
    const piece = document.createElement("div");
    piece.classList.add("puzzle-piece");
    piece.textContent = i + 1;
    puzzleContainer.appendChild(piece);

    piece.draggable = true;
    piece.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", e.target.id);
    });
  }

   document.getElementById("submit-puzzle").addEventListener("click", () => {
    alert("Puzzle solved! Returning to mission...");
    window.location.href = "mission.html";
  });
});
