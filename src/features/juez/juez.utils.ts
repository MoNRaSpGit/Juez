import { Assignment, AvailabilityEntry, Match, Referee, RefereeRole, ROLE_LABELS, ROLE_RATES } from "./juez.types";

export function formatMatchLabel(match: Match) {
  return `${match.homeSide} vs ${match.awaySide}`;
}

export type JuezPlayerExpiryUrgency = "expired" | "red" | "yellow" | "normal";

export function getDaysUntilExpiry(expiryDate: string) {
  const today = new Date();
  const dueDate = new Date(`${expiryDate}T00:00:00`);
  const diffMs = dueDate.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getPlayerExpiryUrgency(expiryDate: string): JuezPlayerExpiryUrgency {
  const diffDays = getDaysUntilExpiry(expiryDate);

  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "red";
  if (diffDays <= 45) return "yellow";
  return "normal";
}

export function formatDaysUntilExpiry(expiryDate: string) {
  const diffDays = getDaysUntilExpiry(expiryDate);

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return overdueDays === 1 ? "Vencio hace 1 dia" : `Vencio hace ${overdueDays} dias`;
  }
  if (diffDays === 0) return "Vence hoy";
  return diffDays === 1 ? "Vence en 1 dia" : `Vence en ${diffDays} dias`;
}

export function getAge(birthDate: string) {
  const today = new Date();
  const birth = new Date(`${birthDate}T00:00:00`);
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return age;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0
  }).format(amount);
}

export function getRefereeEarnings(refereeId: string, assignments: Assignment[]) {
  return assignments.reduce((total, assignment) => {
    if (assignment.principalRefereeId === refereeId) return total + ROLE_RATES.principal;
    if (assignment.secondaryRefereeId === refereeId) return total + ROLE_RATES.secundario;
    if (assignment.scorerRefereeId === refereeId) return total + ROLE_RATES.planillero;
    return total;
  }, 0);
}

export type RefereeEarningsLineItem = {
  matchId: string;
  role: RefereeRole;
  amount: number;
};

export type RefereeEarningsSummary = {
  refereeId: string;
  name: string;
  lineItems: RefereeEarningsLineItem[];
  totalEarnings: number;
};

export function buildRefereeEarningsSummary(referees: Referee[], assignments: Assignment[]): RefereeEarningsSummary[] {
  const summaries = new Map<string, RefereeEarningsSummary>();

  function addLine(refereeId: string, matchId: string, role: RefereeRole) {
    const referee = referees.find((item) => item.id === refereeId);
    const existing = summaries.get(refereeId) ?? {
      refereeId,
      name: referee?.name ?? "Desconocido",
      lineItems: [],
      totalEarnings: 0
    };

    const amount = ROLE_RATES[role];
    existing.lineItems.push({ matchId, role, amount });
    existing.totalEarnings += amount;
    summaries.set(refereeId, existing);
  }

  assignments.forEach((assignment) => {
    addLine(assignment.principalRefereeId, assignment.matchId, "principal");
    addLine(assignment.secondaryRefereeId, assignment.matchId, "secundario");
    addLine(assignment.scorerRefereeId, assignment.matchId, "planillero");
  });

  return Array.from(summaries.values()).sort((left, right) => right.totalEarnings - left.totalEarnings);
}

export function formatMatchDate(date: string, time: string) {
  const normalized = new Date(`${date}T${time}:00`);
  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(normalized);
}

export function getStatusLabel(status: Match["status"]) {
  if (status === "open") return "Inscripcion abierta";
  if (status === "closed") return "Listo para designar";
  return "Designado";
}

export function getStatusTone(status: Match["status"]) {
  if (status === "open") return "blue";
  if (status === "closed") return "amber";
  return "green";
}

export function getAvailableReferees(matchId: string, referees: Referee[], availability: AvailabilityEntry[]) {
  const availableIds = new Set(availability.filter((entry) => entry.matchId === matchId).map((entry) => entry.refereeId));
  return referees.filter((referee) => availableIds.has(referee.id));
}

export function getCompatibleReferees(role: RefereeRole, matchId: string, referees: Referee[], availability: AvailabilityEntry[]) {
  return getAvailableReferees(matchId, referees, availability).filter((referee) => referee.roles.includes(role));
}

export function getAvailabilityForReferee(refereeId: string, matchId: string, availability: AvailabilityEntry[]) {
  return availability.find((entry) => entry.refereeId === refereeId && entry.matchId === matchId);
}

export function getAssignedMatchesForReferee(refereeId: string, matches: Match[], assignments: Assignment[]) {
  const assignedByMatchId = new Map(assignments.map((assignment) => [assignment.matchId, assignment]));

  return matches.filter((match) => {
    const assignment = assignedByMatchId.get(match.id);
    if (!assignment) return false;

    return (
      assignment.principalRefereeId === refereeId ||
      assignment.secondaryRefereeId === refereeId ||
      assignment.scorerRefereeId === refereeId
    );
  });
}

export function getAssignedRoleLabel(refereeId: string, assignment: Assignment | undefined) {
  if (!assignment) return null;
  if (assignment.principalRefereeId === refereeId) return ROLE_LABELS.principal;
  if (assignment.secondaryRefereeId === refereeId) return ROLE_LABELS.secundario;
  if (assignment.scorerRefereeId === refereeId) return ROLE_LABELS.planillero;
  return null;
}

export function buildMatchId() {
  return `match-${Math.random().toString(36).slice(2, 8)}`;
}

export function suggestAssignment(matchId: string, referees: Referee[], availability: AvailabilityEntry[]) {
  const available = getAvailableReferees(matchId, referees, availability);
  const roles: RefereeRole[] = ["planillero", "principal", "secundario"];
  const used = new Set<string>();
  const result: Partial<Record<RefereeRole, string>> = {};

  for (const role of roles) {
    const candidate = available
      .filter((referee) => referee.roles.includes(role) && !used.has(referee.id))
      .sort((a, b) => a.roles.length - b.roles.length || a.name.localeCompare(b.name))[0];

    if (!candidate) {
      return null;
    }

    result[role] = candidate.id;
    used.add(candidate.id);
  }

  return {
    principal: result.principal ?? "",
    secundario: result.secundario ?? "",
    planillero: result.planillero ?? ""
  };
}
