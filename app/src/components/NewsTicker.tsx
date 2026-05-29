"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { NewsArticle, NewsCategory } from "@/lib/mocks/news";
import { clsx } from "@/lib/utils";

// ─── Config ───────────────────────────────────────────────────────────────────

const INTERVAL_MS = 5500;

const CATEGORY_LABELS: Record<NewsCategory, string> = {
  selecciones: "Selecciones",
  estadios: "Estadios",
  jugadores: "Jugadores",
  organización: "Organización",
  curiosidades: "Curiosidades",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function NewsTicker({ articles }: { articles: NewsArticle[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setVisible(false);
    setProgress(0);
    setTimeout(() => {
      setCurrent(index);
      setVisible(true);
    }, 300);
  }, []);

  const next = useCallback(
    () => goTo((current + 1) % articles.length),
    [current, articles.length, goTo],
  );

  const prev = useCallback(
    () => goTo((current - 1 + articles.length) % articles.length),
    [current, articles.length, goTo],
  );

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      return;
    }
    const resetId = setTimeout(() => setProgress(0), 0);
    progressRef.current = setInterval(
      () => setProgress((p) => Math.min(p + 100 / (INTERVAL_MS / 50), 100)),
      50,
    );
    intervalRef.current = setInterval(next, INTERVAL_MS);
    return () => {
      clearTimeout(resetId);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [paused, next]);

  const article = articles[current];

  return (
    <div
      className="group/ticker relative overflow-hidden rounded-2xl shadow-lg"
      style={{ height: "420px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background image ── */}
      <Image
        key={article.id}
        src={article.imageUrl}
        alt={article.title}
        fill
        className={clsx(
          "object-cover transition-all duration-700",
          visible ? "scale-100 opacity-100" : "scale-105 opacity-0",
        )}
        priority
        unoptimized
      />

      {/* ── Gradient overlays ── */}
      {/* Top: dark for readability of top badges */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
      {/* Bottom: strong gradient for text */}
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

      {/* ── Top bar: live indicator + counter ── */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-4">
        <span className="flex items-center gap-2 text-xs font-bold text-white">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          MUNDIAL 2026
        </span>
        <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
          {current + 1} / {articles.length}
        </span>
      </div>

      {/* ── Arrow buttons ── */}
      <button
        onClick={prev}
        aria-label="Noticia anterior"
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover/ticker:opacity-100 hover:bg-black/60"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={next}
        aria-label="Siguiente noticia"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover/ticker:opacity-100 hover:bg-black/60"
      >
        <ChevronRight />
      </button>

      {/* ── Bottom content ── */}
      <Link
        href={`/news/${article.id}`}
        className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-5 pb-5 pt-8"
      >
        {/* Category + source badges */}
        <div
          className={clsx(
            "flex flex-wrap items-center gap-2 transition-all duration-300",
            visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
        >
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {CATEGORY_LABELS[article.category]}
          </span>
          {/* Newspaper badge with brand color */}
          <span
            className="rounded-full px-3 py-1 text-xs font-bold text-white shadow"
            style={{ backgroundColor: article.sourceColor }}
          >
            {article.source}
          </span>
        </div>

        {/* Title */}
        <h2
          className={clsx(
            "text-lg font-bold leading-snug text-white drop-shadow-md transition-all duration-300 sm:text-xl lg:text-2xl",
            visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
        >
          {article.title}
        </h2>

        {/* Summary — only on larger screens */}
        <p
          className={clsx(
            "hidden text-sm text-white/80 drop-shadow line-clamp-2 transition-all duration-300 sm:block",
            visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
        >
          {article.summary}
        </p>

        {/* Dots + read more */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {articles.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(i);
                }}
                aria-label={`Ir a noticia ${i + 1}`}
                className={clsx(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === current
                    ? "w-5 bg-white"
                    : "w-1.5 bg-white/40 hover:bg-white/70",
                )}
              />
            ))}
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-white/80 hover:text-white">
            Leer más <ChevronRight />
          </span>
        </div>
      </Link>

      {/* ── Progress bar ── */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20">
        <div
          className="h-0.5 bg-white transition-none"
          style={{ width: `${progress}%`, opacity: paused ? 0.4 : 1 }}
        />
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
