export const COINS_PER_POINT = 10;

export interface ShopAvatar {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  priceCoin: number;
  competitionTag: string;
}

export const SHOP_AVATARS: ShopAvatar[] = [
  {
    id: "avatar_clutch",
    name: "Clutch",
    description: "La mascota de EE.UU., un puma dorado lleno de energía.",
    imageUrl: "/avatares/Clutch.png",
    priceCoin: 100,
    competitionTag: "WC2026",
  },
  {
    id: "avatar_maple",
    name: "Maple",
    description: "La mascota de Canadá, símbolo del espíritu del norte.",
    imageUrl: "/avatares/Maple.png",
    priceCoin: 100,
    competitionTag: "WC2026",
  },
  {
    id: "avatar_zayu",
    name: "Zayu",
    description: "La mascota de México, vibrante y llena de pasión.",
    imageUrl: "/avatares/Zayu.png",
    priceCoin: 100,
    competitionTag: "WC2026",
  },
];

export function getShopAvatarById(id: string): ShopAvatar | undefined {
  return SHOP_AVATARS.find((a) => a.id === id);
}
