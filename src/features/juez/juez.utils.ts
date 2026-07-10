import { Assignment, AvailabilityEntry, Match, Referee, RefereeRole, ROLE_LABELS } from "./juez.types";

export function formatMatchLabel(match: Match) {
  return `${match.homeTeam} vs ${match.awayTeam}`;
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

export function getCompatibleReferees(
  role: RefereeRole,
  matchId: string,
  referees: Referee[],
  availability: AvailabilityEntry[]
) {
  const availableIds = new Set(
    availability.filter((entry) => entry.matchId === matchId && entry.roles.includes(role)).map((entry) => entry.refereeId)
  );

  return referees.filter((referee) => referee.roles.includes(role) && availableIds.has(referee.id));
}

export function getAvailabilityForReferee(
  refereeId: string,
  matchId: string,
  availability: AvailabilityEntry[]
) {
  return availability.find((entry) => entry.refereeId === refereeId && entry.matchId === matchId);
}

export function getAssignedMatchesForReferee(
  refereeId: string,
  matches: Match[],
  assignments: Assignment[]
) {
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
