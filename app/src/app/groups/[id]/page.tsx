import Link from "next/link";
import { notFound } from "next/navigation";
import { getGroupById, getGroupRanking, getUserById, getCurrentUser } from "@/lib/db";
import { Card, SectionTitle } from "@/components/ui";
import { RankingTable } from "@/components/RankingTable";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const group = await getGroupById(id);
  if (!group) notFound();

  const [ranking, owner, user] = await Promise.all([
    getGroupRanking(group.id),
    getUserById(group.ownerId),
    getCurrentUser(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/groups" className="text-sm text-[var(--brand-strong)] hover:underline">
        ← Volver a grupos
      </Link>

      <Card className="p-6">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Grupo</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{group.name}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Creado por {owner ? <Link href={`/users/${owner.username}`} className="hover:underline">{owner.displayName}</Link> : "—"} · {group.memberIds.length} miembros
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--background)] px-3 py-2 text-sm">
          <span className="text-[var(--muted)]">Código:</span>
          <code className="rounded bg-[var(--brand-soft)] px-2 py-0.5 font-mono text-[var(--brand-strong)]">
            {group.inviteCode}
          </code>
        </div>
      </Card>

      <section>
        <SectionTitle title="Ranking del grupo" subtitle="Puntos acumulados por porras acertadas" />
        <RankingTable entries={ranking} currentUserId={user.id} />
      </section>
    </div>
  );
}
