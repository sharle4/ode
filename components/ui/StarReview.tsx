"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Star } from "@phosphor-icons/react";

interface StarReviewProps {
  review?: number;
  interactive?: boolean;
  size?: number;
  onRate?: (review: number) => void;
}

const StarReview = React.memo(function StarReview({
  review = 0,
  interactive = false,
  size = 18,
  onRate,
}: StarReviewProps) {
  const [hoverReview, setHoverReview] = useState(0);
  const [selectedReview, setSelectedReview] = useState(review);

  const displayReview = hoverReview || selectedReview || review;

  const handleClick = useCallback(
    (starIndex: number) => {
      if (!interactive) return;
      setSelectedReview(starIndex);
      onRate?.(starIndex);
    },
    [interactive, onRate]
  );

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Review">
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const filled = displayReview >= starIndex;
        const halfFilled =
          !filled && displayReview >= starIndex - 0.5;

        return (
          <motion.button
            key={starIndex}
            type="button"
            disabled={!interactive}
            className={`relative ${
              interactive
                ? "cursor-pointer"
                : "cursor-default"
            } focus:outline-none`}
            onMouseEnter={() =>
              interactive && setHoverReview(starIndex)
            }
            onMouseLeave={() => interactive && setHoverReview(0)}
            onClick={() => handleClick(starIndex)}
            whileTap={
              interactive
                ? { scale: 0.85 }
                : undefined
            }
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
            }}
          >
            {halfFilled ? (
              <div className="relative" style={{ width: size, height: size }}>
                <Star
                  size={size}
                  weight="regular"
                  className="text-warm-gray/40 absolute inset-0"
                />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: size / 2 }}
                >
                  <Star
                    size={size}
                    weight="fill"
                    className="text-accent"
                  />
                </div>
              </div>
            ) : (
              <Star
                size={size}
                weight={filled ? "fill" : "regular"}
                className={
                  filled
                    ? "text-accent"
                    : "text-warm-gray/40"
                }
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
});

export default StarReview;
