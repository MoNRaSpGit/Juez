import { Assignment, AvailabilityEntry, Match, MatchFormState, Referee } from "./juez.types";

export const INITIAL_REFEREES: Referee[] = [
  { id: "ref-1", name: "Lucia Ramirez", roles: ["principal", "secundario"], city: "Montevideo" },
  { id: "ref-2", name: "Tomas Pereira", roles: ["principal", "planillero"], city: "Canelones" },
  { id: "ref-3", name: "Valentina Sosa", roles: ["secundario", "planillero"], city: "Maldonado" },
  { id: "ref-4", name: "Martin Silva", roles: ["principal", "secundario", "planillero"], city: "Las Piedras" },
  { id: "ref-5", name: "Camila Duarte", roles: ["planillero"], city: "Pando" }
];

export const INITIAL_MATCHES: Match[] = [
  {
    id: "match-1",
    tournament: "Liga Metropolitana U18",
    homeTeam: "Peñarol Voley",
    awayTeam: "Nacional Voley",
    date: "2026-07-12",
    time: "18:30",
    court: "Cancha 1",
    notes: "Semifinal femenina",
    status: "open"
  },
  {
    id: "match-2",
    tournament: "Liga Metropolitana U18",
    homeTeam: "Bohemios",
    awayTeam: "Malvin",
    date: "2026-07-12",
    time: "20:15",
    court: "Cancha 2",
    notes: "Semifinal masculina",
    status: "closed"
  },
  {
    id: "match-3",
    tournament: "Torneo Apertura Mayores",
    homeTeam: "Urunday",
    awayTeam: "Atenas",
    date: "2026-07-13",
    time: "21:00",
    court: "Cancha Central",
    notes: "Fecha 5",
    status: "assigned"
  }
];

export const INITIAL_AVAILABILITY: AvailabilityEntry[] = [
  { refereeId: "ref-1", matchId: "match-1", roles: ["principal"], createdAt: "2026-07-09T18:00:00Z" },
  { refereeId: "ref-3", matchId: "match-1", roles: ["secundario", "planillero"], createdAt: "2026-07-09T18:15:00Z" },
  { refereeId: "ref-4", matchId: "match-1", roles: ["principal", "secundario"], createdAt: "2026-07-09T18:20:00Z" },
  { refereeId: "ref-2", matchId: "match-2", roles: ["principal", "planillero"], createdAt: "2026-07-09T16:05:00Z" },
  { refereeId: "ref-3", matchId: "match-2", roles: ["secundario"], createdAt: "2026-07-09T16:12:00Z" },
  { refereeId: "ref-5", matchId: "match-2", roles: ["planillero"], createdAt: "2026-07-09T16:20:00Z" },
  { refereeId: "ref-4", matchId: "match-2", roles: ["principal", "secundario"], createdAt: "2026-07-09T16:31:00Z" }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    matchId: "match-3",
    principalRefereeId: "ref-4",
    secondaryRefereeId: "ref-1",
    scorerRefereeId: "ref-5",
    confirmedAt: "2026-07-08T22:10:00Z"
  }
];

export const EMPTY_MATCH_FORM: MatchFormState = {
  tournament: "",
  homeTeam: "",
  awayTeam: "",
  date: "",
  time: "",
  court: "",
  notes: ""
};
