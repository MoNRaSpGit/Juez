import { API_BASE_URL } from "../../shared/config/api";
import { Assignment, AvailabilityEntry, Match } from "./juez.types";

type ListMatchesResponse = { items: Match[] };
type CreateMatchResponse = { item: Match };
type ListAvailabilityResponse = { items: AvailabilityEntry[] };
type ListAssignmentsResponse = { items: Assignment[] };

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function parseOrThrow<T>(response: Response, fallbackMessage: string): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as Partial<T> & { message?: string };
  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }
  return data as T;
}

export async function listJuezMatches() {
  const response = await fetch(buildUrl("/juez-matches"));
  const data = await parseOrThrow<ListMatchesResponse>(response, "No se pudieron cargar los partidos.");
  return data.items ?? [];
}

export async function createJuezMatch(payload: {
  tournament: string;
  homeSide: string;
  awaySide: string;
  venue: string;
  date: string;
  time: string;
}) {
  const response = await fetch(buildUrl("/juez-matches"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await parseOrThrow<CreateMatchResponse>(response, "No se pudo publicar el partido.");
  return data.item;
}

export async function listJuezAvailability() {
  const response = await fetch(buildUrl("/juez-availability"));
  const data = await parseOrThrow<ListAvailabilityResponse>(response, "No se pudo cargar la disponibilidad.");
  return data.items ?? [];
}

export async function toggleJuezAvailability(matchId: string, refereeId: string) {
  const response = await fetch(buildUrl(`/juez-matches/${matchId}/availability/toggle`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refereeId })
  });
  const data = await parseOrThrow<ListAvailabilityResponse>(response, "No se pudo actualizar tu disponibilidad.");
  return data.items ?? [];
}

export async function listJuezAssignments() {
  const response = await fetch(buildUrl("/juez-assignments"));
  const data = await parseOrThrow<ListAssignmentsResponse>(response, "No se pudieron cargar las designaciones.");
  return data.items ?? [];
}

export async function confirmJuezAssignment(
  matchId: string,
  payload: { principalRefereeId: string; secondaryRefereeId: string; scorerRefereeId: string }
) {
  const response = await fetch(buildUrl(`/juez-matches/${matchId}/assignment`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await parseOrThrow<ListAssignmentsResponse>(response, "No se pudo confirmar la designacion.");
  return data.items ?? [];
}

export async function resetJuezAssignment(matchId: string) {
  const response = await fetch(buildUrl(`/juez-matches/${matchId}/assignment`), {
    method: "DELETE"
  });
  const data = await parseOrThrow<ListAssignmentsResponse>(response, "No se pudo reiniciar la designacion.");
  return data.items ?? [];
}
