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
    gameId: string | number;
    players: PlayerState[];
    table: TableState;
    currentPlayerIndex: number;
    lastGetterIndex: number;
    turnCounter: number;
    // Optionally, add any extra fields like isGameOver flag.
  }
  