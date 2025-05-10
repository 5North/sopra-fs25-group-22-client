import React from "react";
import { useRouter } from "next/navigation";
import { GameResultDTO } from "@/models/GameResult";
import { Button } from "antd";

interface SimpleResult {
  userId: number;
  outcome: string;
  message: string;    
}

interface GameResultViewProps {
  result: GameResultDTO | SimpleResult;
  onReturnHome: () => void;
}

function isFullResult(
  r: GameResultDTO | SimpleResult
): r is GameResultDTO {
  return (
    (r as GameResultDTO).myCarteResult !== undefined &&
    (r as GameResultDTO).otherCarteResult !== undefined
  );
}

interface Category {
  key: string;
  my: (r: GameResultDTO) => number | undefined;
  other: (r: GameResultDTO) => number | undefined;
}

const categories: Category[] = [
  { key: "Carte", my: (r: GameResultDTO) => r.myCarteResult, other: (r: GameResultDTO) => r.otherCarteResult },
  { key: "Denari", my: (r: GameResultDTO) => r.myDenariResult, other: (r: GameResultDTO) => r.otherDenariResult },
  { key: "Primiera", my: (r: GameResultDTO) => r.myPrimieraResult, other: (r: GameResultDTO) => r.otherPrimieraResult },
  { key: "Settebello", my: (r: GameResultDTO) => r.mySettebelloResult, other: (r: GameResultDTO) => r.otherSettebelloResult },
  { key: "Scopa", my: (r: GameResultDTO) => r.myScopaResult, other: (r: GameResultDTO) => r.otherScopaResult },
];

const GameResultView: React.FC<GameResultViewProps> = ({ result, onReturnHome }) => {
  const router = useRouter();

  if (!isFullResult(result)) {
    return (
      <div className="result-container">
        <h1 style={{ color: "#FFAB40", textAlign: "center" }}>
          Game Over
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "#fff",
            fontSize: "1.25rem",
            margin: "0.5rem 0",
          }}
        >
          {result.outcome}
        </p>
        <p style={{ textAlign: "center", color: "#fff" }}>
          {result.message}
        </p>
        <Button
            size="small" 
            onClick={() => {
              onReturnHome();
              router.push("/home");
            }}
            style={{
                   width: "160px",          
                   margin: "1rem auto 0"   
                 }}
               
          >
            Return to Home
          </Button>
      </div>
    );
  }

  const full = result;

  const myTotalWins = categories.reduce(
    (acc, { my, other }) =>
      ( (my(full) ?? 0) > (other(full) ?? 0) ? acc + 1 : acc ),
    0
  );
  const otherTotalWins = categories.reduce(
    (acc, { my, other }) =>
      ( (other(full) ?? 0) > (my(full) ?? 0) ? acc + 1 : acc ),
    0
  );

  return (
    <div className="result-container">
      <div style={{ position: "fixed", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem", zIndex: 2000 }}>
        <div style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", padding: "2rem", borderRadius: "8px", maxWidth: "480px", width: "100%" }}>
          <h1 style={{ marginBottom: "0.5rem", color: "#FFAB40", textAlign: "center", textShadow: "0 0 4px #FFAB40, 0 0 8px #FFAB40, 0 0 16px rgba(255,171,64,0.5)" }}>
            Game Over
          </h1>

          <p style={{ textAlign: "center", color: "#fff", fontSize: "1.25rem", fontWeight: 700, margin: "0 0 1.5rem" }}>
            {full.outcome === "WON"
              ? "You Won"
              : full.outcome === "LOST"
              ? "You Lost"
              : `Result: ${full.outcome}`}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "0.5rem 1rem", alignItems: "center", marginBottom: "2rem" }}>
            <div style={{ textAlign: "left", fontWeight: 700, color: "#fff" }}>Your Breakdown</div>
            <div />
            <div style={{ textAlign: "right", fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>Opponent Breakdown</div>

            {categories.map(({ key, my, other }) => {
              const myVal = my(full) ?? 0;
              const opVal = other(full) ?? 0;
              return (
                <React.Fragment key={key}>
                  <div style={{ textAlign: "left", fontWeight: myVal > opVal ? 800 : 400, color: "#fff" }}>{myVal}</div>
                  <div style={{ textAlign: "center", color: "#fff" }}>{key}</div>
                  <div style={{ textAlign: "right", fontWeight: opVal > myVal ? 800 : 400, color: "#fff" }}>{opVal}</div>
                </React.Fragment>
              );
            })}

            <React.Fragment key="Total">
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.6)", paddingTop: "0.5rem", textAlign: "left", fontWeight: myTotalWins > otherTotalWins ? 800 : 400, fontSize: "1.3rem", color: "#fff" }}>
                {myTotalWins}
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.6)", paddingTop: "0.5rem", textAlign: "center", fontSize: "1.3rem", color: "#fff" }}>
                Total
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.6)", paddingTop: "0.5rem", textAlign: "right", fontWeight: otherTotalWins > myTotalWins ? 800 : 400, fontSize: "1.3rem", color: "#fff" }}>
                {otherTotalWins}
              </div>
            </React.Fragment>
          </div>

          <Button
            block
            onClick={() => {
              onReturnHome();
              router.push("/home");
            }}
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameResultView;
