import { getGlobalRanking, getCurrentUser } from "@/lib/db";
import { RankingTable } from "@/components/RankingTable";
import { SectionHero } from "@/components/SectionHero";
import { HERO_ASSETS } from "@/lib/constants/assets";

export default async function RankingPage() {
  const [ranking, user] = await Promise.all([
    getGlobalRanking(),
    getCurrentUser(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <SectionHero
        title="Ranking"
        subtitle="Sube posiciones y demuestra quién sabe más de fútbol"
        imageSrc={HERO_ASSETS.ranking}
      />

      <RankingTable entries={ranking} currentUserId={user.id} />
    </div>
  );
}
