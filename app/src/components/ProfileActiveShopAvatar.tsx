import Image from "next/image";
import type { ShopAvatar } from "@/lib/shop-avatars";

interface ProfileActiveShopAvatarProps {
  avatar: ShopAvatar;
}

/** Mascota de tienda equipada, decorativa en el banner del perfil. */
export function ProfileActiveShopAvatar({ avatar }: ProfileActiveShopAvatarProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-2 top-1/2 z-10 -translate-y-1/2 sm:right-6"
      title={avatar.name}
    >
      <Image
        src={avatar.imageUrl}
        alt=""
        width={130}
        height={130}
        className="h-24 w-24 object-contain opacity-90 drop-shadow-lg sm:h-32 sm:w-32"
        unoptimized
      />
    </div>
  );
}

export function profileHeaderContentClass(hasShopAvatar: boolean): string {
  return hasShopAvatar ? "flex-1 pr-[6.5rem] sm:pr-36" : "flex-1";
}
