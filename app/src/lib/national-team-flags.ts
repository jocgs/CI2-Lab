/** ISO 3166-1 alpha-2 para emojis de bandera en selecciones del Mundial 2026. */
const TEAM_ISO: Record<string, string> = {
  algeria: "DZ",
  argentina: "AR",
  australia: "AU",
  austria: "AT",
  belgium: "BE",
  bosnia: "BA",
  brazil: "BR",
  canada: "CA",
  cape_verde: "CV",
  colombia: "CO",
  croatia: "HR",
  curacao: "CW",
  czech_republic: "CZ",
  dr_congo: "CD",
  ecuador: "EC",
  egypt: "EG",
  france: "FR",
  germany: "DE",
  ghana: "GH",
  haiti: "HT",
  iran: "IR",
  iraq: "IQ",
  ivory_coast: "CI",
  japan: "JP",
  jordan: "JO",
  mexico: "MX",
  morocco: "MA",
  netherlands: "NL",
  new_zealand: "NZ",
  norway: "NO",
  panama: "PA",
  paraguay: "PY",
  portugal: "PT",
  qatar: "QA",
  saudi_arabia: "SA",
  scotland: "GB",
  senegal: "SN",
  south_africa: "ZA",
  south_korea: "KR",
  spain: "ES",
  sweden: "SE",
  switzerland: "CH",
  tunisia: "TN",
  turkey: "TR",
  uruguay: "UY",
  usa: "US",
  uzbekistan: "UZ",
};

export function flagEmojiFromIso(cc: string): string {
  return cc
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

export function getNationalTeamFlagEmoji(teamId: string): string {
  if (teamId === "england") return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
  const iso = TEAM_ISO[teamId];
  return iso ? flagEmojiFromIso(iso) : "🏳️";
}
