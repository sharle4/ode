"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Star } from "@phosphor-icons/react";

interface StarRatingProps {
  rating?: number;
  interactive?: boolean;
  size?: number;
  onRate?: (rating: number) => void;
}

const StarRating = React.memo(function StarRating({
  rating = 0,
  interactive = false,
  size = 18,
  onRate,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(rating);

  const displayRating = hoverRating || selectedRating || rating;

  const handleClick = useCallback(
    (starIndex: number) => {
      if (!interactive) return;
      setSelectedRating(starIndex);
      onRate?.(starIndex);
    },
    [interactive, onRate]
  );

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const filled = displayRating >= starIndex;
        const halfFilled =
          !filled && displayRating >= starIndex - 0.5;

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
              interactive && setHoverRating(starIndex)
            }
            onMouseLeave={() => interactive && setHoverRating(0)}
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

export default StarRating;
