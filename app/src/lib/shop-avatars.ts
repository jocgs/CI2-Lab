import type { ShopAvatar } from "@/types/domain";

export const COINS_PER_POINT = 10;
export const AVATAR_PRICE = 100;

export const SHOP_AVATARS: ShopAvatar[] = [
  {
    id: "wc2026_clutch",
    name: "Clutch",
    description: "El águila calva de EE.UU., rápida y feroz. Mascota de la WC2026.",
    imageUrl: "/avatares/Clutch.png",
    priceCoin: AVATAR_PRICE,
    competitionTag: "WC2026",
  },
  {
    id: "wc2026_maple",
    name: "Maple",
    description: "El castor canadiense, astuto y tenaz. Mascota de la WC2026.",
    imageUrl: "/avatares/Maple.png",
    priceCoin: AVATAR_PRICE,
    competitionTag: "WC2026",
  },
  {
    id: "wc2026_zayu",
    name: "Zayu",
    description: "El jaguar mexicano, ágil y poderoso. Mascota de la WC2026.",
    imageUrl: "/avatares/Zayu.png",
    priceCoin: AVATAR_PRICE,
    competitionTag: "WC2026",
  },
];

export function getShopAvatarById(id: string): ShopAvatar | undefined {
  return SHOP_AVATARS.find((a) => a.id === id);
}
