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
  const origin =
    seatOrigins[seatIndex] ?? { x: 0, y: 0 };

    return (
        <AnimatePresence>
          {/* PLAYED CARD */}
          {playedCard && (
            <motion.div
              key={`play-${playedCard.suit}-${playedCard.value}`}
              initial={{ x: origin.x, y: origin.y, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                position: "fixed",
                left: "50%",
                top: "50%",
                zIndex: 1000,
                pointerEvents: "none",
              }}
              transformTemplate={({ x, y }) =>
                `translate(-50%, -50%) translate(${x}px, ${y}px)`
              }
            >
              <CardComponent card={playedCard} />
            </motion.div>
          )}
    
          {/* CAPTURED CARDS, all together in one AnimatePresence group */}
          {capturedCards.map((c, i) => (
            <motion.div
              key={`cap-${c.suit}-${c.value}-${i}`}
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ x: origin.x, y: origin.y, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                delay: 0.3 + i * 0.1,
                duration: 0.6,
              }}
              style={{
                position: "fixed",
                left: "50%",
                top: "50%",
                zIndex: 999,
                pointerEvents: "none",
              }}
              transformTemplate={({ x, y }) =>
                `translate(-50%, -50%) translate(${x}px, ${y}px)`
              }
            >
              <CardComponent card={c} />
            </motion.div>
          ))}
        </AnimatePresence>
      );
    }
