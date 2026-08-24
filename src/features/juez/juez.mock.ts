import { MatchFormState, Referee } from "./juez.types";

export const DEFAULT_TOURNAMENT = "Torneo Mayores";

// Solo usados por los accesos rapidos de prueba (admin/admin, juez/juez,
// ramon/ramon) en useAuthSession.ts. La lista real de jueces sale del
// backend (GET /juez-auth/accounts).
export const INITIAL_REFEREES: Referee[] = [
  {
    id: "admin-1",
    name: "Administrador",
    roles: ["principal", "secundario", "planillero"],
    city: "Sistema",
    accountRole: "admin",
    email: "admin",
    password: "admin"
  },
  {
    id: "ref-1",
    name: "Lucia Ramirez",
    roles: ["principal", "secundario"],
    city: "Montevideo",
    accountRole: "juez",
    email: "lucia@juez.local",
    password: "123456"
  },
  {
    id: "ref-2",
    name: "JuezRamon",
    roles: ["principal", "secundario", "planillero"],
    city: "Montevideo",
    accountRole: "juez",
    email: "ramon@juez.local",
    password: "ramon123"
  }
];

export const EMPTY_MATCH_FORM: MatchFormState = {
  homeSide: "",
  awaySide: "",
  venue: "",
  date: "",
  time: ""
};
