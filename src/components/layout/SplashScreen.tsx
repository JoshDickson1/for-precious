import { motion } from "motion/react";
import { InfinitySpinner } from "@/components/ui/InfinitySpinner";

export function SplashScreen({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
      drag="y"
      dragDirectionLock
      dragConstraints={{ top: -500, bottom: 0 }}
      dragElastic={0.16}
      dragSnapToOrigin
      dragMomentum={false}
      onDragEnd={(_, info) => {
        if (info.offset.y < -90 || info.velocity.y < -500) {
          onDismiss?.();
        }
      }}
      className="fixed inset-0 z-[100] flex touch-none cursor-grab items-center justify-center bg-canvas active:cursor-grabbing"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <InfinitySpinner size={148} />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.7 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[0.6rem] uppercase tracking-[0.32em] text-ink-muted/60"
      >
        For Precious
      </motion.p>
    </motion.div>
  );
}

export default SplashScreen;
