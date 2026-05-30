/**
 * Lógica compartida para buscar fotos en TheSportsDB (cache script + alineada con player-photo-resolver.ts).
 */

const NATIONALITY_ALIASES = {
  mexico: ["mexico", "méxico"],
  usa: ["usa", "united states", "estados unidos", "u.s.a.", "america"],
  canada: ["canada", "canadá"],
  argentina: ["argentina"],
  brazil: ["brazil", "brasil"],
  england: ["england", "inglaterra", "english"],
  spain: ["spain", "españa", "espana", "spanish"],
  france: ["france", "francia", "french"],
  germany: ["germany", "alemania", "german"],
  portugal: ["portugal", "portuguese"],
  netherlands: ["netherlands", "holanda", "países bajos", "paises bajos", "dutch"],
  italy: ["italy", "italia", "italian"],
  japan: ["japan", "japón", "japon", "japanese"],
  australia: ["australia", "australian"],
  morocco: ["morocco", "marruecos", "moroccan"],
  croatia: ["croatia", "croacia", "croatian"],
  belgium: ["belgium", "bélgica", "belgica", "belgian"],
  colombia: ["colombia", "colombian"],
  uruguay: ["uruguay", "uruguayan"],
  ecuador: ["ecuador", "ecuadorian"],
  paraguay: ["paraguay", "paraguayan"],
  chile: ["chile", "chilean"],
  senegal: ["senegal", "senegalese"],
  ghana: ["ghana", "ghanaian"],
  nigeria: ["nigeria", "nigerian"],
  cameroon: ["cameroon", "cameroonian"],
  ivory_coast: ["ivory coast", "côte d'ivoire", "cote d'ivoire", "ivorian"],
  egypt: ["egypt", "egipto", "egyptian"],
  algeria: ["algeria", "argelia", "algerian"],
  tunisia: ["tunisia", "túnez", "tunisian"],
  south_korea: ["south korea", "korea republic", "corea del sur", "korean"],
  iran: ["iran", "irán", "iranian"],
  iraq: ["iraq", "irak", "iraqi"],
  saudi_arabia: ["saudi arabia", "arabia saudí", "saudi"],
  qatar: ["qatar", "catar", "qatari"],
  uzbekistan: ["uzbekistan", "uzbek"],
  jordan: ["jordan", "jordania", "jordanian"],
  switzerland: ["switzerland", "suiza", "swiss"],
  austria: ["austria", "austrian"],
  poland: ["poland", "polonia", "polish"],
  sweden: ["sweden", "suecia", "swedish"],
  norway: ["norway", "noruega", "norwegian"],
  scotland: ["scotland", "escocia", "scottish"],
  turkey: ["turkey", "turquía", "turkish"],
  wales: ["wales", "gales", "welsh"],
  serbia: ["serbia", "serbian"],
  ukraine: ["ukraine", "ucrania", "ukrainian"],
  czech_republic: ["czech republic", "czechia", "república checa", "czech"],
  denmark: ["denmark", "dinamarca", "danish"],
  panama: ["panama", "panamá", "panamanian"],
  costa_rica: ["costa rica", "costarican"],
  honduras: ["honduras", "honduran"],
  jamaica: ["jamaica", "jamaican"],
  haiti: ["haiti", "haitian"],
  curacao: ["curacao", "curaçao", "curazao"],
  south_africa: ["south africa", "sudáfrica", "south african"],
  new_zealand: ["new zealand", "nueva zelanda", "zealand"],
  dr_congo: ["dr congo", "congo dr", "democratic republic", "rd congo", "congo"],
  cape_verde: ["cape verde", "cabo verde"],
  bosnia: ["bosnia", "bosnia and herzegovina"],
};

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function nationalityAliases(teamId, teamName) {
  const keys = [teamId, teamId.replace(/_/g, " ")];
  for (const key of keys) {
    if (NATIONALITY_ALIASES[key]) return NATIONALITY_ALIASES[key];
  }
  return [normalize(teamName)];
}

function countryMatches(teamId, teamName, sportsDbNationality) {
  const db = normalize(sportsDbNationality);
  return nationalityAliases(teamId, teamName).some((a) => db.includes(a) || a.includes(db));
}

function nameScore(playerName, strPlayer) {
  const a = normalize(playerName);
  const b = normalize(strPlayer ?? "");
  if (!b) return 0;
  if (a === b) return 100;
  const aParts = a.split(/\s+/);
  const bParts = b.split(/\s+/);
  const aLast = aParts[aParts.length - 1];
  const bLast = bParts[bParts.length - 1];
  if (aLast && aLast === bLast) return 70;
  if (b.includes(a) || a.includes(b)) return 50;
  return 0;
}

export function buildSearchQueries(player) {
  const trimmed = player.name.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const countryHint = player.nationalTeamName.trim();
  const queries = new Set([
    trimmed.replace(/\s+/g, "_"),
    trimmed,
    trimmed.replace(/\./g, ""),
    `${trimmed} ${countryHint}`,
  ]);
  if (parts.length >= 2) {
    queries.add(parts[parts.length - 1]);
    queries.add(`${parts[0]}_${parts[parts.length - 1]}`);
    queries.add(`${parts[0]} ${parts[parts.length - 1]}`);
    queries.add(`${parts[0]} ${parts[parts.length - 1]} ${countryHint}`);
  }
  if (parts.length >= 3) {
    queries.add(parts.slice(-2).join("_"));
    queries.add(parts.slice(-2).join(" "));
  }
  return [...queries];
}

async function searchPlayers(query) {
  const q = encodeURIComponent(query);
  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${q}`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.player ?? [];
}

/** @param {{ id: string, name: string, nationalTeamId: string, nationalTeamName: string }} player */
export async function fetchPhotoUrlFromSportsDb(player) {
  const queries = buildSearchQueries(player);
  let bestUrl = null;
  let bestScore = 0;

  for (const query of queries) {
    const candidates = await searchPlayers(query);
    if (!candidates.length) continue;

    for (const c of candidates) {
      const url = c.strThumb?.trim() || c.strCutout?.trim();
      if (!url) continue;
      const ns = nameScore(player.name, c.strPlayer);
      const natOk = c.strNationality
        ? countryMatches(player.nationalTeamId, player.nationalTeamName, c.strNationality)
        : false;
      const score = ns + (natOk ? 40 : 0);
      const acceptable = ns >= 70 || (ns >= 50 && natOk) || ns >= 100;
      if (acceptable && score > bestScore) {
        bestScore = score;
        bestUrl = url;
      }
    }

    if (bestScore >= 90) break;
  }

  return bestUrl;
}
