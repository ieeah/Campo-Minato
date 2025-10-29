
export const ICONS = {
  reactions: [
    ["bad_cry", "bad_emb", "end_cross"],
    ["ok_cool", "ok_hearts", "ok_perv"],
  ],
  actions: ["action_play", "action_surrender"],
  cells: ["bomb", "flag"],
};

export const REACTIONS = {
  bad: [
    "Oh No!",
    "Peccato!",
    "Nope!",
    "Game Over!",
    "KO tecnico!",
    "Non Va!",
    "Looooser!",
  ],
  good: [
    "Grande!",
    "Vai così!",
    "Boom Baby!",
    "Fenomeno!",
    "Che numero!",
    "Che gioco!",
    "Sei Forte!",
  ],
};

export const LEVELS = {
  "1": { boardSize: 10, n_bombs: 12 },
  "2": { boardSize: 13, n_bombs: 30 },
  "3": { boardSize: 18, n_bombs: 45 },
  "4": { boardSize: 28, n_bombs: 85 },
  "5": { boardSize: 28, n_bombs: 120 },
};