// Firebase Admin no se usa — toda la persistencia es local (JSON en /data).
// Este fichero existe para no romper imports residuales.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unusable(label: string): any {
  return new Proxy({} as object, {
    get() {
      throw new Error(`${label} no está disponible en modo local`);
    },
  });
}

export const adminDb = unusable("adminDb");
export const adminAuth = unusable("adminAuth");
