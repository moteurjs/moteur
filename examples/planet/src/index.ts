import Game from "./game";
import "./index.css";
import UI from "./ui";
import * as React from "react";
import * as ReactDOM from "react-dom/client";

async function runUI() {
    ReactDOM.createRoot(document.getElementById("game-ui")!).render(
        React.createElement(UI, {}),
    );
}

async function runGame() {
    const game = new Game();

    await game.boot();
    requestAnimationFrame(async (timestamp) => await game.loop(timestamp));
}

runUI();
runGame();
