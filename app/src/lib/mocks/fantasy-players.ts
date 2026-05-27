import type { FantasyPlayer } from "@/types/fantasy";

function p(
  id: string,
  name: string,
  position: FantasyPlayer["position"],
  nationalTeamId: string,
  nationalTeamName: string,
): FantasyPlayer {
  return {
    id,
    name,
    position,
    nationalTeamId,
    nationalTeamName,
    competitionId: "world_cup_2026",
    photoUrl: "",
    isActive: true,
    totalFantasyPoints: 0,
  };
}

export const FANTASY_PLAYERS: FantasyPlayer[] = [
  // ── GOALKEEPERS (12) ─────────────────────────────────────────────────────
  p("gk_unai", "Unai Simón", "GK", "spain", "España"),
  p("gk_lloris", "Hugo Lloris", "GK", "france", "Francia"),
  p("gk_alisson", "Alisson Becker", "GK", "brazil", "Brasil"),
  p("gk_martinez", "Emiliano Martínez", "GK", "argentina", "Argentina"),
  p("gk_neuer", "Manuel Neuer", "GK", "germany", "Alemania"),
  p("gk_pickford", "Jordan Pickford", "GK", "england", "Inglaterra"),
  p("gk_costa", "Diogo Costa", "GK", "portugal", "Portugal"),
  p("gk_flekken", "Mark Flekken", "GK", "netherlands", "Países Bajos"),
  p("gk_bono", "Yassine Bounou", "GK", "morocco", "Marruecos"),
  p("gk_turner", "Matt Turner", "GK", "usa", "Estados Unidos"),
  p("gk_livakovic", "Dominik Livaković", "GK", "croatia", "Croacia"),
  p("gk_suzuki", "Zion Suzuki", "GK", "japan", "Japón"),

  // ── DEFENDERS (40) ───────────────────────────────────────────────────────
  // Spain (3)
  p("def_carvajal", "Dani Carvajal", "DEF", "spain", "España"),
  p("def_laporte", "Aymeric Laporte", "DEF", "spain", "España"),
  p("def_alba", "Jordi Alba", "DEF", "spain", "España"),

  // France (3)
  p("def_hernandez", "Theo Hernández", "DEF", "france", "Francia"),
  p("def_kounde", "Jules Koundé", "DEF", "france", "Francia"),
  p("def_upamecano", "Dayot Upamecano", "DEF", "france", "Francia"),

  // Brazil (3)
  p("def_danilo", "Danilo", "DEF", "brazil", "Brasil"),
  p("def_marquinhos", "Marquinhos", "DEF", "brazil", "Brasil"),
  p("def_militao", "Éder Militão", "DEF", "brazil", "Brasil"),

  // Argentina (3)
  p("def_tagliafico", "Nicolás Tagliafico", "DEF", "argentina", "Argentina"),
  p("def_romero", "Cristian Romero", "DEF", "argentina", "Argentina"),
  p("def_molina", "Nahuel Molina", "DEF", "argentina", "Argentina"),

  // Germany (3)
  p("def_rudiger", "Antonio Rüdiger", "DEF", "germany", "Alemania"),
  p("def_raum", "David Raum", "DEF", "germany", "Alemania"),
  p("def_schlotterbeck", "Nico Schlotterbeck", "DEF", "germany", "Alemania"),

  // England (3)
  p("def_walker", "Kyle Walker", "DEF", "england", "Inglaterra"),
  p("def_maguire", "Harry Maguire", "DEF", "england", "Inglaterra"),
  p("def_trippier", "Kieran Trippier", "DEF", "england", "Inglaterra"),

  // Portugal (3)
  p("def_cancelo", "João Cancelo", "DEF", "portugal", "Portugal"),
  p("def_pepe", "Pepe", "DEF", "portugal", "Portugal"),
  p("def_nuno_mendes", "Nuno Mendes", "DEF", "portugal", "Portugal"),

  // Netherlands (2)
  p("def_dumfries", "Denzel Dumfries", "DEF", "netherlands", "Países Bajos"),
  p("def_aké", "Nathan Aké", "DEF", "netherlands", "Países Bajos"),

  // Morocco (2)
  p("def_hakimi", "Achraf Hakimi", "DEF", "morocco", "Marruecos"),
  p("def_mazraoui", "Noussair Mazraoui", "DEF", "morocco", "Marruecos"),

  // USA (2)
  p("def_dest", "Sergiño Dest", "DEF", "usa", "Estados Unidos"),
  p("def_zimmermann", "Walker Zimmermann", "DEF", "usa", "Estados Unidos"),

  // Mexico (2)
  p("def_sanchez", "Jorge Sánchez", "DEF", "mexico", "México"),
  p("def_moreno", "Héctor Moreno", "DEF", "mexico", "México"),

  // Japan (2)
  p("def_tomiyasu", "Takehiro Tomiyasu", "DEF", "japan", "Japón"),
  p("def_yoshida", "Maya Yoshida", "DEF", "japan", "Japón"),

  // Croatia (2)
  p("def_gvardiol", "Joško Gvardiol", "DEF", "croatia", "Croacia"),
  p("def_lovren", "Dejan Lovren", "DEF", "croatia", "Croacia"),

  // Italy (2)
  p("def_dimarco", "Federico Dimarco", "DEF", "italy", "Italia"),
  p("def_bastoni", "Alessandro Bastoni", "DEF", "italy", "Italia"),

  // Australia (1)
  p("def_rowles", "Kye Rowles", "DEF", "australia", "Australia"),

  // Canada (1)
  p("def_miller", "Richie Laryea", "DEF", "canada", "Canadá"),

  // ── MIDFIELDERS (40) ─────────────────────────────────────────────────────
  // Spain (4)
  p("mid_pedri", "Pedri", "MID", "spain", "España"),
  p("mid_gavi", "Gavi", "MID", "spain", "España"),
  p("mid_rodrigo", "Rodri", "MID", "spain", "España"),
  p("mid_fabián", "Fabián Ruiz", "MID", "spain", "España"),

  // France (3)
  p("mid_tchouameni", "Aurélien Tchouaméni", "MID", "france", "Francia"),
  p("mid_camavinga", "Eduardo Camavinga", "MID", "france", "Francia"),
  p("mid_rabiot", "Adrien Rabiot", "MID", "france", "Francia"),

  // Brazil (3)
  p("mid_casemiro", "Casemiro", "MID", "brazil", "Brasil"),
  p("mid_paqueta", "Lucas Paquetá", "MID", "brazil", "Brasil"),
  p("mid_fred", "Fred", "MID", "brazil", "Brasil"),

  // Argentina (3)
  p("mid_dpaul", "Rodrigo De Paul", "MID", "argentina", "Argentina"),
  p("mid_mac_allister", "Alexis Mac Allister", "MID", "argentina", "Argentina"),
  p("mid_fernandez", "Enzo Fernández", "MID", "argentina", "Argentina"),

  // Germany (3)
  p("mid_kroos", "Toni Kroos", "MID", "germany", "Alemania"),
  p("mid_gundogan", "İlkay Gündoğan", "MID", "germany", "Alemania"),
  p("mid_musiala", "Jamal Musiala", "MID", "germany", "Alemania"),

  // England (3)
  p("mid_bellingham", "Jude Bellingham", "MID", "england", "Inglaterra"),
  p("mid_rice", "Declan Rice", "MID", "england", "Inglaterra"),
  p("mid_mount", "Mason Mount", "MID", "england", "Inglaterra"),

  // Portugal (3)
  p("mid_bsilva", "Bernardo Silva", "MID", "portugal", "Portugal"),
  p("mid_bfernandes", "Bruno Fernandes", "MID", "portugal", "Portugal"),
  p("mid_joao_felix", "João Félix", "MID", "portugal", "Portugal"),

  // Netherlands (2)
  p("mid_dejon", "Frenkie de Jong", "MID", "netherlands", "Países Bajos"),
  p("mid_koopmeiners", "Teun Koopmeiners", "MID", "netherlands", "Países Bajos"),

  // Morocco (2)
  p("mid_amrabat", "Sofyan Amrabat", "MID", "morocco", "Marruecos"),
  p("mid_ounahi", "Azzedine Ounahi", "MID", "morocco", "Marruecos"),

  // USA (2)
  p("mid_musah", "Yunus Musah", "MID", "usa", "Estados Unidos"),
  p("mid_mckennie", "Weston McKennie", "MID", "usa", "Estados Unidos"),

  // Mexico (2)
  p("mid_herrera", "Héctor Herrera", "MID", "mexico", "México"),
  p("mid_guardado", "Andrés Guardado", "MID", "mexico", "México"),

  // Japan (2)
  p("mid_kubo", "Takefusa Kubo", "MID", "japan", "Japón"),
  p("mid_tanaka", "Ao Tanaka", "MID", "japan", "Japón"),

  // Croatia (2)
  p("mid_modric", "Luka Modrić", "MID", "croatia", "Croacia"),
  p("mid_kovacic", "Mateo Kovačić", "MID", "croatia", "Croacia"),

  // Italy (2)
  p("mid_barella", "Nicolò Barella", "MID", "italy", "Italia"),
  p("mid_verratti", "Marco Verratti", "MID", "italy", "Italia"),

  // Australia (1)
  p("mid_hrustic", "Ajdin Hrustić", "MID", "australia", "Australia"),

  // Canada (1)
  p("mid_davies_alphonso", "Alphonso Davies", "MID", "canada", "Canadá"),

  // ── FORWARDS (40) ────────────────────────────────────────────────────────
  // Spain (3)
  p("fwd_yamal", "Lamine Yamal", "FWD", "spain", "España"),
  p("fwd_morata", "Álvaro Morata", "FWD", "spain", "España"),
  p("fwd_olmo", "Dani Olmo", "FWD", "spain", "España"),

  // France (4)
  p("fwd_mbappe", "Kylian Mbappé", "FWD", "france", "Francia"),
  p("fwd_dembele", "Ousmane Dembélé", "FWD", "france", "Francia"),
  p("fwd_giroud", "Olivier Giroud", "FWD", "france", "Francia"),
  p("fwd_thuram", "Marcus Thuram", "FWD", "france", "Francia"),

  // Brazil (4)
  p("fwd_vinicius", "Vinícius Jr.", "FWD", "brazil", "Brasil"),
  p("fwd_neymar", "Neymar Jr.", "FWD", "brazil", "Brasil"),
  p("fwd_rodrygo", "Rodrygo", "FWD", "brazil", "Brasil"),
  p("fwd_endrick", "Endrick", "FWD", "brazil", "Brasil"),

  // Argentina (4)
  p("fwd_messi", "Lionel Messi", "FWD", "argentina", "Argentina"),
  p("fwd_lautaro", "Lautaro Martínez", "FWD", "argentina", "Argentina"),
  p("fwd_alvarez", "Julián Álvarez", "FWD", "argentina", "Argentina"),
  p("fwd_dybala", "Paulo Dybala", "FWD", "argentina", "Argentina"),

  // Germany (3)
  p("fwd_havertz", "Kai Havertz", "FWD", "germany", "Alemania"),
  p("fwd_sane", "Leroy Sané", "FWD", "germany", "Alemania"),
  p("fwd_gnabry", "Serge Gnabry", "FWD", "germany", "Alemania"),

  // England (3)
  p("fwd_kane", "Harry Kane", "FWD", "england", "Inglaterra"),
  p("fwd_rashford", "Marcus Rashford", "FWD", "england", "Inglaterra"),
  p("fwd_saka", "Bukayo Saka", "FWD", "england", "Inglaterra"),

  // Portugal (3)
  p("fwd_ronaldo", "Cristiano Ronaldo", "FWD", "portugal", "Portugal"),
  p("fwd_felix", "Rafael Leão", "FWD", "portugal", "Portugal"),
  p("fwd_gonçalves", "Pedro Gonçalves", "FWD", "portugal", "Portugal"),

  // Netherlands (2)
  p("fwd_depay", "Memphis Depay", "FWD", "netherlands", "Países Bajos"),
  p("fwd_gakpo", "Cody Gakpo", "FWD", "netherlands", "Países Bajos"),

  // Morocco (2)
  p("fwd_ziyech", "Hakim Ziyech", "FWD", "morocco", "Marruecos"),
  p("fwd_ennesyri", "Youssef En-Nesyri", "FWD", "morocco", "Marruecos"),

  // USA (2)
  p("fwd_pulisic", "Christian Pulisic", "FWD", "usa", "Estados Unidos"),
  p("fwd_reyna", "Gio Reyna", "FWD", "usa", "Estados Unidos"),

  // Mexico (2)
  p("fwd_jimenez", "Raúl Jiménez", "FWD", "mexico", "México"),
  p("fwd_lozano", "Hirving Lozano", "FWD", "mexico", "México"),

  // Japan (2)
  p("fwd_mitoma", "Kaoru Mitoma", "FWD", "japan", "Japón"),
  p("fwd_ueda", "Ayase Ueda", "FWD", "japan", "Japón"),

  // Croatia (2)
  p("fwd_perisic", "Ivan Perišić", "FWD", "croatia", "Croacia"),
  p("fwd_kramaric", "Andrej Kramarić", "FWD", "croatia", "Croacia"),

  // Italy (2)
  p("fwd_immobile", "Ciro Immobile", "FWD", "italy", "Italia"),
  p("fwd_chiesa", "Federico Chiesa", "FWD", "italy", "Italia"),

  // Australia (1)
  p("fwd_leckie", "Mathew Leckie", "FWD", "australia", "Australia"),

  // Canada (1)
  p("fwd_david", "Jonathan David", "FWD", "canada", "Canadá"),
];
