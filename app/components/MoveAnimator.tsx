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

const seatOrigins = [
  { x: 0, y: 200 },
  { x: -300, y: 0 },
  { x: 0, y: -200 },
  { x: 300, y: 0 },
];

export function MoveAnimator({ animation }: MoveAnimatorProps) {
  if (!animation || (!animation.playedCard && animation.capturedCards.length === 0)) return null;

  const { seatIndex, playedCard, capturedCards } = animation;
  const origin = seatOrigins[seatIndex];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ pointerEvents: "none" }}
    >
      <AnimatePresence>
        {/* Step 1: Display and animate the played card first */}
        {playedCard && (
          <motion.div
            key={`play-${playedCard.suit}-${playedCard.value}`} // Ensure key is unique for each played card
            initial={{ x: origin.x, y: origin.y, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6}}
            style={{
              position: "fixed",
              left: "60%",
              top: "60%",
              zIndex: 1000,
            }}
            transformTemplate={({ x, y }) =>
              `translate(-50%, -50%) translate(${x}px, ${y}px)`
            }
          >
            <CardComponent card={playedCard} />
          </motion.div>
        )}

        {/* Step 2: Render captured cards one by one with a delay */}
      {/* Container for all captured cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        style={{
          position: "fixed",
          left: "40%",
          top: "60%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          gap: "8px", // space between cards
          zIndex: 999,
          pointerEvents: "none",
        }}
      >
        {capturedCards.map((c, i) => (
          <motion.div
            key={`cap-${c.suit}-${c.value}-${i}`}
            initial={{ opacity: 0, y: origin.y }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.6,
            }}
          >
            <CardComponent card={c} />
          </motion.div>
        ))}
      </motion.div>

      </AnimatePresence>
    </motion.div>
  );
}
