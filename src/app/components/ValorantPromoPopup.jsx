'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Target } from 'lucide-react';

export default function ValorantPromoPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      const sessionDismissed = sessionStorage.getItem('valorantPromoDismissed');
      const localDismissedStr = localStorage.getItem('valorantPromoDismissedAt');
      
      if (sessionDismissed) return false;
      
      if (localDismissedStr) {
        const dismissedAt = parseInt(localDismissedStr, 10);
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - dismissedAt < oneHour) {
          return false;
        }
      }
      return true;
    };

    if (checkVisibility()) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('valorantPromoDismissed', 'true');
    localStorage.setItem('valorantPromoDismissedAt', Date.now().toString());
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop for Desktop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] hidden md:block"
          />

          {/* Modal / Popover */}
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 md:bottom-auto md:top-1/2 left-0 md:left-1/2 w-full md:w-[450px] md:-translate-x-1/2 md:-translate-y-1/2 z-[101] bg-[#101014] md:rounded-2xl rounded-t-2xl border-t md:border border-zinc-800 shadow-2xl p-6"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors bg-zinc-900/50 hover:bg-zinc-800 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-4 text-red-500">
                <Target className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">
                Valorant Tracker <span className="text-red-500">Live</span>
              </h3>
              
              <p className="text-sm text-zinc-400 font-medium leading-relaxed mb-6 px-2">
                Dive deep into your performance with our new Tracker.gg style profile viewer. Analyze your 10-player scoreboards, precise weapon accuracy, and agent win-rates!
              </p>

              <div className="w-full flex flex-col gap-3">
                <Link 
                  href="/valorant" 
                  onClick={handleClose}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded uppercase tracking-widest transition-colors flex justify-center"
                >
                  View Your Profile
                </Link>
                <button 
                  onClick={handleClose}
                  className="w-full py-3 bg-transparent hover:bg-zinc-800 text-zinc-400 font-bold rounded uppercase tracking-widest transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
