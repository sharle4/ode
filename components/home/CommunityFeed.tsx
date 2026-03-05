"use client";

import React from "react";
import { communityActivities } from "@/constants/mockData";
import ActivityCard from "@/components/ui/ActivityCard";
import FadeIn from "@/components/ui/FadeIn";

const CommunityFeed = React.memo(function CommunityFeed() {
  const leftColumn = communityActivities.filter((_, i) => i % 2 === 0);
  const rightColumn = communityActivities.filter((_, i) => i % 2 !== 0);

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">

        <FadeIn delay={0.2} y={30} duration={0.8} className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs uppercase tracking-[0.15em] text-warm-gray font-medium">
              Activité en direct
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-charcoal">
            De la part de la communauté
          </h2>
          <p className="mt-2 text-sm text-warm-gray max-w-[50ch]">
            Découvrez ce que les lecteurs du monde entier enregistrent, notent et discutent en ce moment.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div className="flex flex-col gap-4 md:gap-5">
            {leftColumn.map((activity, index) => (
              <FadeIn key={activity.id} delay={0.3 + index * 0.1}>
                <ActivityCard
                  activity={activity}
                  index={index}
                />
              </FadeIn>
            ))}
          </div>

          <div className="flex flex-col gap-4 md:gap-5 md:mt-8">
            {rightColumn.map((activity, index) => (
              <FadeIn key={activity.id} delay={0.4 + index * 0.1}>
                <ActivityCard
                  activity={activity}
                  index={index + leftColumn.length}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

export default CommunityFeed;
