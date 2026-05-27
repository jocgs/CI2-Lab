import Link from "next/link";
import { getCurrentUser, getGroupsForUser } from "@/lib/db";
import { Card, EmptyState, SectionTitle } from "@/components/ui";
import { createGroupAction, joinGroupAction } from "./actions";

export default async function GroupsPage() {
  const user = await getCurrentUser();
  const groups = await getGroupsForUser(user.id);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Mis grupos</h1>
        <p className="text-sm text-[var(--muted)]">
          Crea un grupo o únete con un código para competir con amigos.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-base font-semibold">Crear un grupo</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Genera un código para invitar a tus amigos.
          </p>
          <form action={createGroupAction} className="mt-4 flex flex-col gap-3">
            <input
              name="name"
              required
              placeholder="Nombre del grupo"
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
            />
            <button
              type="submit"
              className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--brand-strong)]"
            >
              Crear grupo
            </button>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold">Unirse con un código</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Pídele a alguien el código de invitación de su grupo.
          </p>
          <form action={joinGroupAction} className="mt-4 flex flex-col gap-3">
            <input
              name="code"
              required
              placeholder="Código (ej. FINDE26)"
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm uppercase outline-none focus:border-[var(--brand)]"
            />
            <button
              type="submit"
              className="rounded-xl border border-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-strong)] hover:bg-[var(--brand-soft)]"
            >
              Unirme
            </button>
          </form>
        </Card>
      </section>

      <section>
        <SectionTitle title="Tus grupos" subtitle={`${groups.length} grupos activos`} />
        {groups.length === 0 ? (
          <EmptyState
            title="Aún no estás en ningún grupo"
            description="Crea uno arriba o únete con un código de amigo."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {groups.map((group) => (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <Card className="p-4 transition-shadow hover:shadow-md">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    Código: {group.inviteCode}
                  </p>
                  <p className="mt-1 text-lg font-semibold">{group.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {group.memberIds.length} {group.memberIds.length === 1 ? "miembro" : "miembros"}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
