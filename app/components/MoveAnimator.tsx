import { motion, AnimatePresence } from "framer-motion";
import CardComponent from "./CardComponent";
import { Card } from "@/models/GameSession";

export interface MoveAnimationData {
  playerId: number;
  seatIndex: 0 | 1 | 2 | 3;
  playedCard: Card | null;
  capturedCards: Card[];
}

export interface MoveAnimatorProps {
  animation?: MoveAnimationData | null;
}

const seatAnchors = [
  { left: "50%", top: "85%" }, // bottom player
  { left: "15%", top: "50%" }, // left
  { left: "50%", top: "15%" }, // top
  { left: "85%", top: "50%" }, // right
];


const tableAnchor = { left: "50%", top: "50%" };

export function MoveAnimator({ animation }: MoveAnimatorProps) {
  if (!animation) return null;

  const { seatIndex, playedCard, capturedCards } = animation;
  const from = seatAnchors[seatIndex];
  const to   = tableAnchor;

  // timings
  const flyDuration  = 1.0;
  const holdDuration = 1.2;
  const exitDuration = 0.8;

  return (
    <AnimatePresence>
      {/* 1) Fly in the played card from "from" → "to" */}
      {playedCard && (
        <motion.div
          key={`play-${playedCard.suit}-${playedCard.value}`}
          initial={{ ...from, opacity: 0, scale: 0.8 }}
          animate={{ ...to,   opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: flyDuration, ease: "easeOut" }}
          style={{
            position: "fixed",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          <CardComponent card={playedCard} />
        </motion.div>
      )}

      {/* 2) Show all cards together, scaled up & held */}
      { (playedCard || capturedCards.length > 0) && (
        <motion.div
          key="highlight-group"
          initial={{ ...to, scale: 1, opacity: 0 }}
          animate={{ ...to, scale: 1.3, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            delay: flyDuration,
            duration: holdDuration,
            ease: "easeInOut",
          }}
          style={{
            position: "fixed",
            transform: "translate(-50%, -50%)",
            display: "flex",
            gap: "12px",
            zIndex: 995,
            pointerEvents: "none",
          }}
        >
          {playedCard && <CardComponent card={playedCard} />}
          {capturedCards.map((c, i) => (
            <CardComponent key={`hold-${c.suit}-${c.value}-${i}`} card={c} />
          ))}
        </motion.div>
      )}

      {/* 3) Fly the captured cards back out to "from" */}
      {capturedCards.map((c, i) => (
        <motion.div
          key={`exit-${c.suit}-${c.value}-${i}`}
          initial={{ ...to, scale: 1, opacity: 1 }}
          animate={{ ...from, scale: 0.8, opacity: 0 }}
          transition={{
            delay: flyDuration + holdDuration + i * 0.1,
            duration: exitDuration,
            ease: "easeIn",
          }}
          style={{
            position: "fixed",
            transform: "translate(-50%, -50%)",
            zIndex: 990,
            pointerEvents: "none",
          }}
        >
          <CardComponent card={c} />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
