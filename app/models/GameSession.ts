export interface Card {
    suit: "DENARI" | "COPPE" | "BASTONI" | "SPADE";
    value: number;
  }
  
  export interface PlayerState {
    userId: number;
    hand: Card[];
    // Optionally include treasure, scopaCount if you need to display them.
    treasure?: Card[];
    scopaCount?: number;
  }
  
  export interface TableState {
    cards: Card[];
  }
  
  export interface GameSessionState {
    gameId: number;
    tableCards: Card[];
    players: {
        userId: number;
        handSize: number;
        scopaCount: number;
    }[];
    currentPlayerId: number;
    // TODO CHEck Optionally, add any extra fields like isGameOver flag.
  }
  