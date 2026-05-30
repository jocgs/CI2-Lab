export const COINS_PER_POINT = 10;

export interface ShopAvatar {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  priceCoin: number;
  competitionTag: string;
  /** Si true, se marca como edición limitada / exclusiva del torneo activo. */
  exclusive?: boolean;
}

export const SHOP_AVATARS: ShopAvatar[] = [
  // ── WC 2026 (Edición limitada, exclusiva del Mundial) ─────────────────────
  {
    id: "avatar_clutch",
    name: "Clutch",
    description: "La mascota de EE.UU., un puma dorado lleno de energía.",
    imageUrl: "/avatares/Clutch.png",
    priceCoin: 100,
    competitionTag: "WC2026",
    exclusive: true,
  },
  {
    id: "avatar_maple",
    name: "Maple",
    description: "La mascota de Canadá, símbolo del espíritu del norte.",
    imageUrl: "/avatares/Maple.png",
    priceCoin: 100,
    competitionTag: "WC2026",
    exclusive: true,
  },
  {
    id: "avatar_zayu",
    name: "Zayu",
    description: "La mascota de México, vibrante y llena de pasión.",
    imageUrl: "/avatares/Zayu.png",
    priceCoin: 100,
    competitionTag: "WC2026",
    exclusive: true,
  },

  // ── Mascotas históricas de otros Mundiales ────────────────────────────────
  {
    id: "avatar_gauchito",
    name: "Gauchito",
    description: "El gaucho argentino del Mundial 1978. Puro folklore rioplatense.",
    imageUrl: "/avatares/Gauchito.png",
    priceCoin: 30,
    competitionTag: "WC_CLASICAS",
  },
  {
    id: "avatar_naranjito",
    name: "Naranjito",
    description: "La naranja española del Mundial 1982. Un clásico de los ochenta.",
    imageUrl: "/avatares/Naranjito.png",
    priceCoin: 30,
    competitionTag: "WC_CLASICAS",
  },
  {
    id: "avatar_pique",
    name: "Pique",
    description: "El jalapeño picante del Mundial México 1986. ¡Olé!",
    imageUrl: "/avatares/Pique.png",
    priceCoin: 30,
    competitionTag: "WC_CLASICAS",
  },
  {
    id: "avatar_striker",
    name: "Striker",
    description: "El perro americano del Mundial USA 1994. Enérgico y simpático.",
    imageUrl: "/avatares/Striker.png",
    priceCoin: 30,
    competitionTag: "WC_CLASICAS",
  },
  {
    id: "avatar_footix",
    name: "Footix",
    description: "El gallo galo del Mundial Francia 1998. ¡Allez les Bleus!",
    imageUrl: "/avatares/Footix.png",
    priceCoin: 30,
    competitionTag: "WC_CLASICAS",
  },
  {
    id: "avatar_fuleco",
    name: "Fuleco",
    description: "El armadillo brasileño del Mundial Brasil 2014. Divertido y ecológico.",
    imageUrl: "/avatares/Fuleco.png",
    priceCoin: 30,
    competitionTag: "WC_CLASICAS",
  },
  {
    id: "avatar_zabikava",
    name: "Zabivaka",
    description: "El lobo ruso del Mundial Rusia 2018. Elegante y veloz.",
    imageUrl: "/avatares/Zabikava.png",
    priceCoin: 30,
    competitionTag: "WC_CLASICAS",
  },
];

export function getShopAvatarById(id: string): ShopAvatar | undefined {
  return SHOP_AVATARS.find((a) => a.id === id);
}

/** Total de mascotas en catálogo (para logros de colección). */
export function getTotalShopAvatarsCount(): number {
  return SHOP_AVATARS.length;
}
