// components/MoveAnimator.tsx
import { motion, AnimatePresence } from "framer-motion";
import CardComponent from "./CardComponent";
import { Card } from "@/models/GameSession";

export interface MoveAnimationData {
    playerId: number;
    seatIndex:     0 | 1 | 2 | 3;
    playedCard: Card | null;
    capturedCards: Card[];
  }
  
  export interface MoveAnimatorProps {
    animation: MoveAnimationData | null;
  }

  const seatOrigins = [
    { x: 0,   y: 200 },  // bottom (your hand)
    { x: -300, y: 0   }, // left
    { x: 0,   y: -200},  // top
    { x: 300, y: 0   },  // right
  ];
  
  

  export function MoveAnimator({
    animation,
  }: MoveAnimatorProps) {
    if (!animation) return null;

    const { seatIndex, playedCard, capturedCards } = animation;
    const origin = seatOrigins[seatIndex];
    return (
        <AnimatePresence>
          {/* PLAYED CARD: fly from the seat into the table center */}
          {playedCard && (
            <motion.div
              key={`play-${playedCard.suit}-${playedCard.value}`}
              initial={{ x: origin.x, y: origin.y, opacity: 0 }}
              animate={{ x: 0, y: 0,      opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{ position: "fixed", left: "50%", top: "50%", zIndex: 1000 }}
              transformTemplate={({ x, y }) =>
                `translate(-50%, -50%) translate(${x}px, ${y}px)`
              }
            >
              <CardComponent card={playedCard} />
            </motion.div>
          )}
    
          {/* CAPTURED CARDS: fly from the table center *into* the seat */}
          {capturedCards.map((c, i) => (
            <motion.div
              key={`cap-${c.suit}-${c.value}-${i}`}
              initial={{ x: 0,    y: 0,     opacity: 1 }}
              animate={{ x: origin.x, y: origin.y, opacity: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.6 }}
              style={{ position: "fixed", left: "50%", top: "50%", zIndex: 1000 }}
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
