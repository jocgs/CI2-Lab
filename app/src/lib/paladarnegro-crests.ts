/** Slugs en https://paladarnegro.net/escudoteca/selecciones/png/{slug}.png */
export const PALADARNEGRO_CREST_SLUG: Record<string, string> = {
  algeria: "argelia",
  argentina: "argentina",
  australia: "australia",
  austria: "austria",
  belgium: "belgica",
  bosnia: "bosnia",
  brazil: "brasil",
  canada: "canada",
  cape_verde: "cabo_verde",
  colombia: "colombia",
  croatia: "croacia",
  curacao: "curazao",
  czech_republic: "republicacheca",
  dr_congo: "congo",
  ecuador: "ecuador",
  egypt: "egipto",
  england: "inglaterra",
  france: "francia",
  germany: "alemania",
  ghana: "ghana",
  haiti: "haiti",
  iran: "iran",
  iraq: "irak",
  ivory_coast: "costa_de_marfil",
  japan: "japon",
  jordan: "jordania",
  mexico: "mexico",
  morocco: "marruecos",
  netherlands: "paisesbajos",
  new_zealand: "nuevazelanda",
  norway: "noruega",
  panama: "panama",
  paraguay: "paraguay",
  portugal: "portugal",
  qatar: "qatar",
  saudi_arabia: "arabiasaudita",
  scotland: "escocia",
  senegal: "senegal",
  south_africa: "sudafrica",
  south_korea: "coreadelsur",
  spain: "espana",
  sweden: "suecia",
  switzerland: "suiza",
  tunisia: "tunez",
  turkey: "turquia",
  uruguay: "uruguay",
  usa: "usa",
  uzbekistan: "uzbekistan",
};

const PN_BASE = "https://paladarnegro.net/escudoteca/selecciones/selecciones/png";

export function getPaladarNegroCrestSourceUrl(teamId: string): string | undefined {
  const slug = PALADARNEGRO_CREST_SLUG[teamId];
  if (!slug) return undefined;
  return `${PN_BASE}/${slug}.png`;
}
