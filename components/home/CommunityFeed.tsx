"use client";

import React from "react";
import { motion } from "framer-motion";
import { communityActivities } from "@/constants/mockData";
import ActivityCard from "@/components/ui/ActivityCard";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const CommunityFeed = React.memo(function CommunityFeed() {
  const leftColumn = communityActivities.filter((_, i) => i % 2 === 0);
  const rightColumn = communityActivities.filter((_, i) => i % 2 !== 0);

  return (
    <motion.section
      className="py-16 md:py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={containerVariants}
    >
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <motion.div
          className="mb-10 md:mb-14"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 20,
              },
            },
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs uppercase tracking-[0.15em] text-warm-gray font-medium">
              Live Activity
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-charcoal">
            From the Community
          </h2>
          <p className="mt-2 text-sm text-warm-gray max-w-[50ch]">
            See what readers around the world are logging, rating, and discussing right now.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div className="flex flex-col gap-4 md:gap-5">
            {leftColumn.map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                index={index}
              />
            ))}
          </div>

          <div className="flex flex-col gap-4 md:gap-5 md:mt-8">
            {rightColumn.map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                index={index + leftColumn.length}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
});

export default CommunityFeed;
