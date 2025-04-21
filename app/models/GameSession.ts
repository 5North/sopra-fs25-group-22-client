export interface Card {
    suit: "DENARI" | "COPPE" | "BASTONI" | "SPADE";
    value: number;
  }
  
  export interface Player {
    handSize: number;
    scopaCount: number;
    userId: number;
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
  }
  
  export interface TablePrivateState {
    handCards: Card[];
    userId: string;
  }