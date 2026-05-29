# TikiTaka

App para hacer porras de fútbol con amigos. Proyecto de la asignatura **CI2 Lab** del Máster.

## Estado actual (Miércoles 27 — Sprint de desarrollo)

### ✅ Martes (completado)
- Modelo de datos TypeScript, capa mock, UI navegable completa.

### ✅ Miércoles (completado)
- **Firebase Auth** (Google Sign-In) — sesión con cookie httpOnly.
- **Firestore** como base de datos real (Firebase Admin SDK en servidor).
- **Repositorio** migrado: `lib/db.ts` reemplaza `lib/mocks/` con misma interfaz.
- **Protección de rutas** con middleware Next.js.
- **Despliegue en Vercel** (ver sección de despliegue).
- Script de seed para poblar Firestore: `npm run seed`.

## Stack

| Capa            | Tecnología                                          |
| --------------- | --------------------------------------------------- |
| Frontend        | Next.js 16 (App Router) + React 19 + TypeScript     |
| Estilos         | Tailwind CSS v4                                     |
| Estado servidor | Server Components + Server Actions                  |
| Backend (futuro) | Supabase (Auth + Postgres + Edge Functions)        |
| Datos de fútbol | Mocks ahora → API real el jueves (a decidir)        |
| Despliegue      | Vercel (a partir de mañana)                         |

## Arquitectura

```
CI2Lab_TikiTaka/
├── app/                       # Aplicación Next.js
│   └── src/
│       ├── app/               # Rutas (App Router)
│       │   ├── page.tsx       # Home/dashboard
│       │   ├── matches/       # Listado y detalle de partidos
│       │   ├── groups/        # Grupos: lista, crear, detalle
│       │   ├── ranking/       # Ranking global
│       │   └── profile/       # Perfil de usuario
│       ├── components/        # UI reutilizable
│       ├── lib/
│       │   ├── mocks/         # Repositorio de datos mock
│       │   ├── scoring.ts     # Reglas de puntuación y rachas
│       │   └── utils.ts       # Helpers (fechas, clsx)
│       └── types/
│           └── domain.ts      # Contratos del dominio
└── README.md                  # Este archivo
```

### Idea clave del diseño

Las páginas/componentes consumen datos **únicamente** a través del módulo
`@/lib/mocks`. Esa es nuestra capa de **repositorio**: hoy devuelve mocks
estáticos en memoria; el jueves la sustituimos por queries a Supabase y nada
más en la app cambia.

## Modelo de datos

Definido en `app/src/types/domain.ts`. Entidades principales:

- **User** — usuario de la app.
- **Group** — grupo privado con `inviteCode` para unirse.
- **Competition / Team / Match** — datos externos (vendrán de la API el jueves).
- **Bet** — porra de un usuario sobre un partido (`prediction: "1" | "X" | "2"`).
- **RankingEntry / UserStreak** — vistas derivadas.

### Reglas de puntuación (MVP)

- Acertar el resultado **1 / X / 2** → **3 puntos**.
- Fallar → **0 puntos**.

La función vive en `scoring.ts` aislada, lista para crecer (jueves se podría
añadir bonus por racha o modo "resultado exacto").

## Cómo arrancar

Requisitos: Node.js 20+ y npm.

### 1. Configurar variables de entorno

```bash
cp app/.env.example app/.env.local
```

Abre `app/.env.local` y rellena las variables de Firebase con los valores de tu proyecto
(Firebase Console → Configuración del proyecto → Tus apps).

> **Para la demo de clase** no necesitas ninguna API key externa: con `USE_MOCK_DATA=true`
> (valor por defecto en `.env.example`) la app funciona completamente con datos mock.

> ⚠️ **Nunca subas `.env.local` a GitHub.** Ya está en el `.gitignore`.

### 2. Instalar dependencias y arrancar

```bash
cd app
npm install
npm run dev
```

La app queda en [http://localhost:3000](http://localhost:3000).

### Variables de entorno disponibles

| Variable | Descripción | Obligatoria |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key | Sí (con Firebase) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Sí (con Firebase) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID del proyecto Firebase | Sí (con Firebase) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket | No |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender | No |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID | Sí (con Firebase) |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Analytics | No |
| `FIREBASE_PROJECT_ID` | Admin SDK — project ID | Solo para seed/admin |
| `FIREBASE_CLIENT_EMAIL` | Admin SDK — service account email | Solo para seed/admin |
| `FIREBASE_PRIVATE_KEY` | Admin SDK — clave privada | Solo para seed/admin |
| `FOOTBALL_DATA_API_KEY` | API de football-data.org | No (mock si está vacío) |
| `CRON_SECRET` | Protege el endpoint de sync | No (abierto si falta) |
| `USE_MOCK_DATA` | `true` = datos mock, sin llamadas externas | No (recomendado para MVP) |

## Roadmap de la semana

Workflow propuesto por la asignatura:

| Día           | Foco                       | Entregables                                           |
| ------------- | -------------------------- | ----------------------------------------------------- |
| **Lun 25**    | Kickoff · Ideación         | Idea de negocio cerrada                               |
| **Mar 26** ✅ | Diseño · Arquitectura      | Modelo de datos, mocks, UI navegable, primer commit   |
| **Mié 27**    | Sprint de desarrollo       | Persistir en Supabase, auth básica, primer end-to-end |
| **Jue 28**    | Pulido · UX · Seguridad    | API real de fútbol, validaciones, deploy estable      |
| **Vie 29**    | Presentaciones · Jurado    | Demo final                                            |

### Decisiones pendientes para mañana

- Conectar Supabase (proyecto, esquema, RLS).
- Sustituir `CURRENT_USER_ID` mock por la sesión real de Supabase Auth.
- Migrar el repositorio mock a queries reales (interfaz idéntica).
- Cron/job que cierre porras al iniciar cada partido.

### Decisiones para el jueves

- Elegir API de fútbol (`football-data.org` vs `API-Football`).
- Job que sincronice partidos y resultados.
- Decidir si soportamos también "resultado exacto" además de 1/X/2.
