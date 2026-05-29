import Link from "next/link";

interface SectionHeroProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  imageSrc: string;
  imageAlt?: string;
  children?: React.ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
}

export function SectionHero({
  title,
  subtitle,
  eyebrow,
  imageSrc,
  children,
  ctaLabel,
  ctaHref,
}: SectionHeroProps) {
  return (
    <section
      className="page-hero"
      style={{ backgroundImage: `url(${imageSrc})` }}
    >
      <div className="page-hero__content">
        {eyebrow && (
          <p className="text-sm font-medium opacity-80">{eyebrow}</p>
        )}
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm sm:text-base">{subtitle}</p>
        )}
        {children && <div className="mt-4">{children}</div>}
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="mt-4 inline-block rounded-xl bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
