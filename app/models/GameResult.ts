export interface GameResultDTO {
    gameId: number;
    userId: number;
    outcome: string; // "WON", "LOST" or "TIE"
    myTotal?: number;
    otherTotal?: number;
    myCarteResult?: number;
    myDenariResult?: number;
    myPrimieraResult?: number;
    mySettebelloResult?: number;
    myScopaResult?: number;
    otherCarteResult?: number;
    otherDenariResult?: number;
    otherPrimieraResult?: number;
    otherSettebelloResult?: number;
    otherScopaResult?: number;
  }
  