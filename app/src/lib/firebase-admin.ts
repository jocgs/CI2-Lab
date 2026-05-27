// Firebase Admin no se usa — toda la persistencia es local (JSON en /data).
// Este fichero existe para no romper imports residuales.

function unusable(label: string) {
  return new Proxy({} as never, {
    get() {
      throw new Error(`${label} no está disponible en modo local`);
    },
  });
}

export const adminDb = unusable("adminDb");
export const adminAuth = unusable("adminAuth");
