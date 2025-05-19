import { AnimatePresence, motion } from "framer-motion";
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
  const to = tableAnchor;

  const flyDuration = 1.0;

  const showOverlay = playedCard || capturedCards.length > 0;

  return (
    <>
      {/* Dark overlay behind animation */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "black",
              zIndex: 900,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* Played card animation */}
      <AnimatePresence>
        {playedCard && (
          <motion.div
            key={`play-${playedCard.suit}-${playedCard.value}`}
            initial={{ ...from, opacity: 0, scale: 0.2 }}
            animate={{ ...to, opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: flyDuration, ease: "easeOut" }}
            style={{
              position: "fixed",
              transform: "translate(-50%, -50%)",
              zIndex: 1500,
              pointerEvents: "none",
            }}
          >
            <CardComponent card={playedCard} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Captured cards layout */}
      {playedCard && capturedCards.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "row",
            gap: "12px",
            zIndex: 999,
            pointerEvents: "none",
          }}
        >
          {capturedCards.map((c, i) => (
            <CardComponent key={`static-${c.suit}-${c.value}-${i}`} card={c} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {!playedCard && capturedCards.length > 0 && (
          <motion.div
            key="captured-fly"
            initial={{ ...from, opacity: 0, scale: 0.6 }}
            animate={{ ...to, opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: flyDuration }}
            style={{
              position: "fixed",
              transform: "translate(-50%, -50%)",
              display: "flex",
              gap: "12px",
              zIndex: 1500,
              pointerEvents: "none",
            }}
          >
            {capturedCards.map((card, i) => (
              <CardComponent
                key={`cap-${card.suit}-${card.value}-${i}`}
                card={card}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
