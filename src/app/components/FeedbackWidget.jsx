"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, X, Star, Send, CheckCircle2 } from "lucide-react";
import { submitReviewAction } from "@/app/actions/submitReview";

export default function FeedbackWidget({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.target);
    formData.append("rating", rating);

    const result = await submitReviewAction(formData);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        // Reset state after animation finishes
        setTimeout(() => {
          setIsSuccess(false);
          setRating(0);
        }, 500);
      }, 2000);
    } else {
      setError(result.error || "Failed to submit review");
    }

    setIsSubmitting(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-gradient-to-r from-[#D7FC70] to-[#b8f522] text-black px-4 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(215,252,112,0.3)] font-semibold font-rajdhani tracking-wide group transition-all"
        style={{
          boxShadow: isOpen ? "none" : "",
        }}
      >
        <MessageSquarePlus className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
        <span className="hidden md:inline-block">Rate Us!</span>
      </motion.button>

      {/* Modal Overlay & Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              ref={modalRef}
              initial={{ y: 50, scale: 0.9, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 50, scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#161616]">
                <h3 className="text-xl font-orbitron font-bold text-white flex items-center gap-2">
                  Feedback <span className="text-[#D7FC70]">Hub</span>
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5">
                {isSuccess ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-8 text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#D7FC70]/20 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-[#D7FC70]" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-rajdhani font-bold text-white">Thank You!</h4>
                      <p className="text-gray-400 mt-1">Your feedback helps us improve.</p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Rating */}
                    <div className="flex flex-col items-center space-y-2 py-2">
                      <p className="text-gray-400 text-sm font-medium">How would you rate your experience?</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                star <= (hoverRating || rating)
                                  ? "fill-[#D7FC70] text-[#D7FC70]"
                                  : "fill-transparent text-gray-600"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comments */}
                    <div className="space-y-1">
                      <label htmlFor="feedback_text" className="text-sm font-medium text-gray-300">
                        Tell us more (Optional)
                      </label>
                      <textarea
                        id="feedback_text"
                        name="feedback_text"
                        rows="3"
                        placeholder="What did you like or dislike?"
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#D7FC70]/50 focus:ring-1 focus:ring-[#D7FC70]/50 transition-all resize-none"
                      />
                    </div>

                    {/* Optional Info (if not logged in) */}
                    {!user && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label htmlFor="name" className="text-xs font-medium text-gray-400">
                            Name (Optional)
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#D7FC70]/50 transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="email" className="text-xs font-medium text-gray-400">
                            Email (Optional)
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="john@example.com"
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#D7FC70]/50 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {error && (
                      <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 bg-[#D7FC70] hover:bg-[#b8f522] text-black font-semibold py-3 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Feedback</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
