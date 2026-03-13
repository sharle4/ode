import React from "react";
import ActivityCard from "@/components/ui/ActivityCard";
import FadeIn from "@/components/ui/FadeIn";
import { getAvatarGradient, getInitials, formatRelativeTime } from "@/utils/gradient";

interface CommunityFeedProps {
  activities: any[];
}

export default function CommunityFeed({ activities }: CommunityFeedProps) {
  // Transform DB review data into the shape ActivityCard expects
  const mappedActivities = activities.map((review: any) => ({
    id: review.id,
    username: review.users?.username || 'anonyme',
    displayName: review.users?.username || 'Anonyme',
    avatarGradient: getAvatarGradient(review.users?.username || review.id),
    initials: getInitials(review.users?.username || 'A'),
    action: review.review_text ? 'reviewed' as const : 'rated' as const,
    poemTitle: review.poems?.title || 'Poème',
    poemAuthors: review.poems?.authors || [],
    review: review.score,
    reviewText: review.review_text || undefined,
    timestamp: formatRelativeTime(review.created_at),
    likes: 0,
    comments: 0,
  }));

  if (mappedActivities.length === 0) {
    return null;
  }

  const leftColumn = mappedActivities.filter((_: any, i: number) => i % 2 === 0);
  const rightColumn = mappedActivities.filter((_: any, i: number) => i % 2 !== 0);

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

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
            {leftColumn.map((activity: any, index: number) => (
              <FadeIn key={activity.id} delay={0.3 + index * 0.1}>
                <ActivityCard
                  activity={activity}
                  index={index}
                />
              </FadeIn>
            ))}
          </div>

          <div className="flex flex-col gap-4 md:gap-5 md:mt-8">
            {rightColumn.map((activity: any, index: number) => (
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
}
