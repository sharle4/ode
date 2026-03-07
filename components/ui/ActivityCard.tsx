"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, ChatCircle, Star } from "@phosphor-icons/react";
import type { CommunityActivity } from "@/types";
import StarReview from "./StarReview";

interface ActivityCardProps {
  activity: CommunityActivity;
  index: number;
}

function ActionLabel({ action }: { action: CommunityActivity["action"] }) {
  const labels: Record<CommunityActivity["action"], string> = {
    logged: "a enregistré",
    rated: "a noté",
    "added to list": "a ajouté à une liste",
    reviewed: "a commenté",
  };
  return (
    <span className="text-warm-gray text-sm">{labels[action]}</span>
  );
}

const ActivityCard = React.memo(function ActivityCard({
  activity,
  index,
}: ActivityCardProps) {
  return (
    <motion.article
      className="group relative rounded-2xl border border-soft-border/60 bg-paper/60 backdrop-blur-sm p-6 transition-colors hover:border-soft-border hover:bg-paper"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: index * 0.06,
      }}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${activity.avatarGradient} text-white text-xs font-medium`}
        >
          {activity.initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <span className="font-medium text-charcoal text-sm">
              {activity.displayName}
            </span>
            <span className="text-warm-gray text-xs">
              @{activity.username}
            </span>
            <ActionLabel action={activity.action} />
          </div>

          <div className="mt-1 flex flex-wrap items-baseline gap-x-1">
            <span className="font-serif text-charcoal text-sm font-medium italic">
              {activity.poemTitle}
            </span>
            <span className="text-warm-gray text-xs">
              de {activity.poemAuthors?.map((a: any) => a.name).join(', ')}
            </span>
          </div>

          {activity.review !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <StarReview review={activity.review} size={14} />
              {activity.review % 1 !== 0 && (
                <span className="text-warm-gray text-xs font-mono">
                  {activity.review.toFixed(1)}
                </span>
              )}
            </div>
          )}

          {activity.reviewText && (
            <p className="mt-3 text-charcoal/80 text-sm leading-relaxed max-w-[65ch]">
              {activity.reviewText}
            </p>
          )}

          <div className="mt-4 flex items-center gap-5">
            <motion.button
              className="flex items-center gap-1.5 text-warm-gray hover:text-accent transition-colors"
              whileTap={{ scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
              }}
            >
              <Heart size={16} weight="regular" />
              <span className="text-xs font-mono">{activity.likes}</span>
            </motion.button>

            <motion.button
              className="flex items-center gap-1.5 text-warm-gray hover:text-charcoal transition-colors"
              whileTap={{ scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
              }}
            >
              <ChatCircle size={16} weight="regular" />
              <span className="text-xs font-mono">{activity.comments}</span>
            </motion.button>

            <span className="ml-auto text-warm-gray/50 text-xs">
              {activity.timestamp}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
});

export default ActivityCard;
