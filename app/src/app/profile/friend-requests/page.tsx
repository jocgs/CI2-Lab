import Link from "next/link";
import { ProfileBackNav } from "@/components/profile/ProfileBackNav";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { acceptFriendRequestAction } from "@/app/profile/actions";
import { getProfileUserContext } from "@/lib/profile-data";
import { Badge, Card, EmptyState, SectionTitle } from "@/components/ui";

export default async function ProfileFriendRequestsPage() {
  const ctx = await getProfileUserContext();

  return (
    <div className="flex flex-col gap-6">
      <ProfileBackNav
        title="Solicitudes"
        subtitle="Gestiona invitaciones recibidas y enviadas"
      />

      <Card className="p-6">
        <SectionTitle
          title="Recibidas"
          subtitle={
            ctx.receivedRequests.length > 0
              ? `${ctx.receivedRequests.length} pendientes de aprobar`
              : "Nadie te ha enviado solicitudes"
          }
        />

        <div className="mt-5">
          {ctx.receivedRequests.length === 0 ? (
            <EmptyState
              title="No tienes solicitudes recibidas"
              description="Cuando alguien quiera añadirte, aparecerá aquí."
            />
          ) : (
            <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)]">
              {ctx.receivedRequests.map((request) => (
                <li
                  key={request.id}
                  className="flex items-center justify-between gap-3 bg-[var(--surface)] px-4 py-3"
                >
                  <Link href={`/users/${request.username}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <ProfileAvatar
                      avatarUrl={request.avatarUrl}
                      displayName={request.displayName}
                      size="sm"
                      zoomable={false}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{request.displayName}</p>
                      <p className="truncate text-sm text-[var(--muted)]">@{request.username}</p>
                    </div>
                  </Link>
                  <form action={acceptFriendRequestAction}>
                    <input type="hidden" name="friendUsername" value={request.username} />
                    <input type="hidden" name="redirectTo" value="/profile/friend-requests" />
                    <button
                      type="submit"
                      className="shrink-0 rounded-full bg-[var(--brand)] px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                    >
                      Aceptar
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <SectionTitle title="Enviadas" subtitle="Solicitudes que has mandado" />

        <div className="mt-5">
          {ctx.sentRequests.length === 0 ? (
            <EmptyState
              title="No has enviado solicitudes"
              description="Las que envíes desde un perfil aparecerán aquí como pendientes."
            />
          ) : (
            <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)]">
              {ctx.sentRequests.map((request) => (
                <li key={request.id}>
                  <Link
                    href={`/users/${request.username}`}
                    className="flex items-center justify-between gap-3 bg-[var(--surface)] px-4 py-3 transition-colors hover:bg-[var(--background)]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <ProfileAvatar
                        avatarUrl={request.avatarUrl}
                        displayName={request.displayName}
                        size="sm"
                        zoomable={false}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{request.displayName}</p>
                        <p className="truncate text-sm text-[var(--muted)]">@{request.username}</p>
                      </div>
                    </div>
                    <Badge tone="warning">Pendiente</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
