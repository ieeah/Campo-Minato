/**
 * Campo Minato - Virtual DOM Implementation
 * Main application entry point
 */

import { createApp } from "./js/virtualDom.js";
import { initialGameState, resetGame } from "./js/game/gameState.js";
import { startTimer } from "./js/game/gameTimer.js";
import { audioManager } from "./js/game/audioManager.js";
import {
  startGame,
  handleClick,
  flagCell,
  showModal,
  closeModal,
  hint,
} from "./js/game/gameLogic.js";
import { App } from "./js/components/gameComponents.js";

// Initialize audio manager
audioManager.init();

// Initialize the app
const appContainer = document.createElement("div");
appContainer.id = "vdom-app-container";
document.querySelector("main").replaceWith(appContainer);

const modalElement = document.querySelector(".modal");
if (modalElement) modalElement.remove();

const app = createApp(
  (getState, setState) =>
    App(
      getState,
      setState,
      () => startGame(getState, setState, () => startTimer(app.getState, app.setState)),
      (id, isLoop = false) => handleClick(id, getState, setState, isLoop),
      (id) => flagCell(id, getState, setState),
      showModal,
      closeModal,
      resetGame
    ),
  appContainer
);

app.mount(initialGameState);

// Keep existing button event handlers for theme and audio (outside the virtual DOM)
document.getElementById("themeButton").addEventListener("click", () => {
  document.querySelector("html").classList.toggle("light");
  const themeButton = document.getElementById("themeButton");
  let newtext = themeButton.innerText.includes("On")
    ? "Turn Lights Off"
    : "Turn Lights On";
  themeButton.innerText = newtext;
  themeButton.classList.toggle("muted");
});

document.getElementById("mutedButton").addEventListener("click", () => {
  const mutedButton = document.getElementById("mutedButton");
  mutedButton.classList.toggle("muted");
  mutedButton.classList.toggle("active");
  audioManager.toggleMuted();
  mutedButton.innerText = audioManager.isMuted() ? "Audio Off" : "Audio On";
});

document.getElementById("helpButton").addEventListener("click", () => {
  hint(
    app.getState,
    app.setState,
    (id) => flagCell(id, app.getState, app.setState)
  );
});
