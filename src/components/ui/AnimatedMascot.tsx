import React, { useState } from 'react';
import { SpriteAnimator } from './SpriteAnimator';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

/**
 * AnimatedMascot Component
 * Hiển thị linh vật hoạt hình (Sprite Sheet) ở góc màn hình
 */
export const AnimatedMascot: React.FC = () => {
  const { t } = useTranslation();
  const [showBubble, setShowBubble] = useState(false);
  const [message, setMessage] = useState('');

  const messages = [
    "Meow! Chúc bạn học tốt nha!",
    "Bạn có muốn tạo thêm Quiz không?",
    "Cố gắng lên, bạn đang làm rất tốt!",
    "Học tập là chìa khóa thành công đó!",
  ];

  const handleClick = () => {
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMsg);
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 3000);
  };

  return (
    <>
      <div 
        className="fixed inset-0 pointer-events-none z-[9998]" 
        id="mascot-drag-constraints" 
      />
      <motion.div 
        drag
        dragConstraints={{ left: -window.innerWidth + 100, right: 0, top: -window.innerHeight + 100, bottom: 0 }}
        dragElastic={0.1}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
        whileDrag={{ scale: 1.2, cursor: 'grabbing' }}
        className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none"
      >
        <AnimatePresence>
          {showBubble && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-2 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl border-2 border-primary text-sm font-heading font-bold text-foreground max-w-[200px] relative pointer-events-auto"
            >
              {message}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-slate-800 border-r-2 border-b-2 border-primary rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="cursor-pointer pointer-events-auto group relative"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClick}
        >
          <SpriteAnimator 
            src="/assets/images/cat-sprite.png" 
            frameWidth={32} 
            frameHeight={32} 
            frameCount={10} 
            fps={12} 
            className="scale-[2] origin-bottom-right"
          />
          
          <div className="absolute -top-8 right-0 bg-primary text-primary-foreground px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
            Click me!
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};
