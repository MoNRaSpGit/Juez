export const ROLE_LABELS = {
  principal: "Arbitro Principal",
  secundario: "Arbitro Secundario",
  planillero: "Planillero"
} as const;

export type RefereeRole = keyof typeof ROLE_LABELS;

export type Referee = {
  id: string;
  name: string;
  roles: RefereeRole[];
  city: string;
};

export type MatchStatus = "open" | "closed" | "assigned";

export type Match = {
  id: string;
  tournament: string;
  homeSide: string;
  awaySide: string;
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
  date: string;
  time: string;
};
