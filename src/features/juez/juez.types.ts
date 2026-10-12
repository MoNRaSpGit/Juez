export const ROLE_LABELS = {
  principal: "Juez de arriba",
  secundario: "Juez de abajo",
  planillero: "Planillero"
} as const;

export type RefereeRole = keyof typeof ROLE_LABELS;

export const ROLE_RATES: Record<RefereeRole, number> = {
  principal: 500,
  secundario: 350,
  planillero: 250
};

export type Referee = {
  id: string;
  name: string;
  roles: RefereeRole[];
  city: string;
  accountRole: "admin" | "juez";
  email?: string;
  password?: string;
  // Cuenta restringida a un solo equipo (10/10/2026, pedido explicito:
  // "que solo pueda ver una pestaña que se llame Peñarol Fem... no pueda
  // editar ni nada, solo ver") -- si esta seteado, el menu muestra una
  // sola pestana con lockedTeamLabel en vez de "Carnet", y esa vista
  // queda fija en ese equipo (ver JuezDashboardScreen/JuezPlayersBrowseView).
  lockedTeamId?: number;
  lockedTeamLabel?: string;
};

export type MatchStatus = "open" | "closed" | "assigned";

export type Match = {
  id: string;
  tournament: string;
  homeSide: string;
  awaySide: string;
  venue: string;
  date: string;
  time: string;
  status: MatchStatus;
};

export type AvailabilityEntry = {
  refereeId: string;
  matchId: string;
  createdAt: string;
};

export type Assignment = {
  matchId: string;
  principalRefereeId: string;
  secondaryRefereeId: string;
  scorerRefereeId: string;
  confirmedAt: string;
};

export type MatchFormState = {
  homeSide: string;
  awaySide: string;
  venue: string;
  date: string;
  time: string;
};
