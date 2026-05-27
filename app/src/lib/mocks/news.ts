export type NewsCategory =
  | "selecciones"
  | "estadios"
  | "jugadores"
  | "organización"
  | "curiosidades";

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: NewsCategory;
  publishedAt: string; // ISO
  emoji: string;
  imageUrl: string; // Unsplash
  source: string;
  sourceColor: string; // color de cabecera del diario (Tailwind bg)
  sourceUrl: string;
}

export const MOCK_NEWS: NewsArticle[] = [
  {
    id: "news_001",
    title: "España llega al Mundial como una de las grandes favoritas tras la Eurocopa",
    summary:
      "La selección española, campeona de Europa en 2024, afronta el Mundial 2026 con una generación brillante liderada por Yamal, Nico Williams y Pedri.",
    body: "El seleccionador Luis de la Fuente ha dado a conocer una lista de 26 convocados sin grandes sorpresas, consolidando el bloque que ganó la Eurocopa. España debuta el 12 de junio ante Marruecos en el MetLife Stadium de Nueva York, en lo que ya se perfila como uno de los partidos más atractivos de la fase de grupos.",
    category: "selecciones",
    publishedAt: "2026-05-24T10:00:00Z",
    emoji: "🇪🇸",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&h=500&auto=format&fit=crop&q=80",
    source: "Marca",
    sourceColor: "#d0021b",
    sourceUrl: "https://www.marca.com",
  },
  {
    id: "news_002",
    title: "Mbappé: 'Este Mundial es mi gran oportunidad de ganar el título que me falta'",
    summary:
      "El delantero del Real Madrid, en rueda de prensa, ha declarado que el Mundial 2026 es su prioridad absoluta esta temporada.",
    body: "Mbappé compareció ante los medios con una seguridad inusual. 'He ganado la Liga, la Champions, la Ligue 1… el Mundial es lo único que me falta y sé que este es mi momento'. El técnico Didier Deschamps le ha confirmado como capitán y referente del equipo galo.",
    category: "jugadores",
    publishedAt: "2026-05-23T09:15:00Z",
    emoji: "🇫🇷",
    imageUrl: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=900&h=500&auto=format&fit=crop&q=80",
    source: "L'Équipe",
    sourceColor: "#f5c800",
    sourceUrl: "https://www.lequipe.fr",
  },
  {
    id: "news_003",
    title: "Argentina defiende corona con Messi en su último baile mundialista",
    summary:
      "El campeón vigente llega con Lionel Messi, que ha confirmado que el Mundial 2026 será su despedida de la selección argentina.",
    body: "Scaloni mantiene el bloque campeón de Qatar con novedades puntuales: Garnacho entra en la lista y Dybala, por fin sano, podría tener minutos. El desafío es enorme: ningún equipo ha repetido título desde la Italia de 2006.",
    category: "selecciones",
    publishedAt: "2026-05-23T07:30:00Z",
    emoji: "🇦🇷",
    imageUrl: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=900&h=500&auto=format&fit=crop&q=80",
    source: "Olé",
    sourceColor: "#003087",
    sourceUrl: "https://www.ole.com.ar",
  },
  {
    id: "news_004",
    title: "El SoFi Stadium de Los Ángeles acogerá la gran final del Mundial 2026",
    summary:
      "La FIFA ha confirmado que el estadio más moderno de la NFL será la sede de la final el 19 de julio. 100.000 espectadores.",
    body: "El SoFi Stadium, inaugurado en 2020 con un coste de 5.500 millones de dólares, no tiene techo fijo pero sí una cubierta translúcida. La FIFA espera que la final supere los 1.500 millones de espectadores en todo el mundo.",
    category: "estadios",
    publishedAt: "2026-05-22T14:30:00Z",
    emoji: "🏟️",
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=900&h=500&auto=format&fit=crop&q=80",
    source: "AS",
    sourceColor: "#1a56db",
    sourceUrl: "https://www.as.com",
  },
  {
    id: "news_005",
    title: "Brasil presenta su lista definitiva con Vinicius como capitán",
    summary:
      "Dorival Júnior ha anunciado los 26 convocados de la Canarinha. La gran sorpresa es Endrick, que a sus 19 años viaja a su primer Mundial.",
    body: "Brasil llega sin el peso de ser el gran favorito, pero con una plantilla de primer nivel. La gran duda es la posición de Rodrygo, que podría actuar como mediapunta detrás de Vinicius y Endrick.",
    category: "selecciones",
    publishedAt: "2026-05-22T16:45:00Z",
    emoji: "🇧🇷",
    imageUrl: "https://images.unsplash.com/photo-1504216328781-6bd960c2f91a?w=900&h=500&auto=format&fit=crop&q=80",
    source: "Globo Esporte",
    sourceColor: "#009c3b",
    sourceUrl: "https://ge.globo.com",
  },
  {
    id: "news_006",
    title: "El Mundial 2026 tendrá 104 partidos y 48 selecciones en 16 ciudades",
    summary:
      "Por primera vez en la historia participarán 48 selecciones entre Estados Unidos, Canadá y México. La fase de grupos cambia de formato.",
    body: "Las 16 sedes incluyen Nueva York, Los Ángeles, Miami, Dallas, Chicago, Vancouver, Toronto, Guadalajara, Monterrey y Ciudad de México. La FIFA ha establecido que los partidos de tarde en México se adelantarán para evitar el horario nocturno europeo.",
    category: "organización",
    publishedAt: "2026-05-21T11:00:00Z",
    emoji: "🗺️",
    imageUrl: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&h=500&auto=format&fit=crop&q=80",
    source: "FIFA.com",
    sourceColor: "#1a3a6b",
    sourceUrl: "https://www.fifa.com",
  },
  {
    id: "news_007",
    title: "Pedri: 'Con España podemos ganar el Mundial, tenemos el mejor equipo'",
    summary:
      "El centrocampista del FC Barcelona habló en exclusiva sobre las aspiraciones de la Roja y señaló a Yamal como el jugador diferencial.",
    body: "Pedri compareció ante los medios en la concentración de Las Rozas con una sonrisa que transmitió confianza. 'Venimos de ganar la Eurocopa, estamos en un momento muy bueno. Claro que podemos ganar el Mundial, para eso vamos'.",
    category: "jugadores",
    publishedAt: "2026-05-21T08:00:00Z",
    emoji: "⚽",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&h=500&auto=format&fit=crop&q=80",
    source: "Sport",
    sourceColor: "#c8102e",
    sourceUrl: "https://www.sport.es",
  },
  {
    id: "news_008",
    title: "Haaland lidera una Noruega que se clasifica por primera vez desde 1998",
    summary:
      "El delantero del Manchester City ha sido el gran artífice. Con 15 goles en clasificación, llega como favorito al Bota de Oro.",
    body: "Noruega se metió en el Mundial con una remontada épica ante Turquía en el último partido. Haaland marcó un hat-trick que desató la locura en Oslo. 'No me lo creo aún', dijo el delantero entre lágrimas tras el pitido final.",
    category: "jugadores",
    publishedAt: "2026-05-20T13:00:00Z",
    emoji: "🇳🇴",
    imageUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=900&h=500&auto=format&fit=crop&q=80",
    source: "The Guardian",
    sourceColor: "#052962",
    sourceUrl: "https://www.theguardian.com",
  },
  {
    id: "news_009",
    title: "Marruecos, la gran revelación: el sueño africano sigue creciendo",
    summary:
      "Tras el histórico cuarto puesto en Qatar 2022, los 'Leones del Atlas' llegan al Mundial 2026 con la ambición de ir aún más lejos.",
    body: "Walid Regragui ha incorporado a la lista a varios jugadores nacidos en España, Francia y Holanda que han optado por jugar con Marruecos. El partido ante España puede ser el gran duelo de la fase de grupos.",
    category: "selecciones",
    publishedAt: "2026-05-19T10:30:00Z",
    emoji: "🇲🇦",
    imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=900&h=500&auto=format&fit=crop&q=80",
    source: "Mundo Deportivo",
    sourceColor: "#0057a8",
    sourceUrl: "https://www.mundodeportivo.com",
  },
  {
    id: "news_010",
    title: "El Estadio Azteca: el primer recinto en albergar tres Mundiales",
    summary:
      "El mítico estadio mexicano, sede de 1970 y 1986, acoge partidos de fase de grupos en 2026 tras una renovación completa.",
    body: "El Azteca conserva su esencia: la cancha donde Maradona marcó 'la mano de Dios' y el 'gol del siglo' el 22 de junio de 1986. Los nuevos asientos y la tecnología de vídeo han sido completamente renovados.",
    category: "estadios",
    publishedAt: "2026-05-18T09:00:00Z",
    emoji: "🏛️",
    imageUrl: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=900&h=500&auto=format&fit=crop&q=80",
    source: "Record",
    sourceColor: "#c8102e",
    sourceUrl: "https://www.record.com.mx",
  },
  {
    id: "news_011",
    title: "Lamine Yamal, el niño prodigio que quiere brillar en su primer Mundial",
    summary:
      "Con solo 18 años, el extremo del Barça llega al torneo como uno de los jugadores más expectantes del planeta.",
    body: "Yamal viajó a su primer Mundial con un palmarés envidiable: Eurocopa, Liga y Champions en los últimos dos años. Luis de la Fuente le ha dado plena libertad para desplazarse por todo el frente de ataque.",
    category: "jugadores",
    publishedAt: "2026-05-18T07:45:00Z",
    emoji: "🌟",
    imageUrl: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=900&h=500&auto=format&fit=crop&q=80",
    source: "Marca",
    sourceColor: "#d0021b",
    sourceUrl: "https://www.marca.com",
  },
  {
    id: "news_012",
    title: "¿Sabías que la pelota oficial del Mundial 2026 se fabrica en Sialkot, Pakistán?",
    summary:
      "La ciudad pakistaní fabrica el 70% de los balones del mundo. Adidas presenta el 'Fénix', con materiales reciclados y sensor interior.",
    body: "El 'Fénix' incorpora un sensor capaz de enviar datos de posición al VAR en tiempo real, con 500 mediciones por segundo. Además, el 50% de su superficie exterior está fabricada con plástico reciclado.",
    category: "curiosidades",
    publishedAt: "2026-05-17T08:00:00Z",
    emoji: "⚽",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=900&h=500&auto=format&fit=crop&q=80",
    source: "Gazzetta dello Sport",
    sourceColor: "#e8004c",
    sourceUrl: "https://www.gazzetta.it",
  },
];
