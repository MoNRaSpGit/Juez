import { API_BASE_URL } from "../../shared/config/api";
import { JuezPlayerDivision, JuezPlayerSex } from "./juez.players.types";
import { JuezTeam } from "./juez.teams.types";

type ListTeamsResponse = {
  items: JuezTeam[];
};

type CreateTeamResponse = {
  item: JuezTeam;
};

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export async function listJuezTeams() {
  const response = await fetch(buildUrl("/juez-teams"));
  const data = (await response.json().catch(() => ({}))) as Partial<ListTeamsResponse> & { message?: string };

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron cargar los equipos.");
  }

  return data.items ?? [];
}

export async function createJuezTeam(payload: { name: string; division: JuezPlayerDivision; sex: JuezPlayerSex }) {
  const response = await fetch(buildUrl("/juez-teams"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = (await response.json().catch(() => ({}))) as Partial<CreateTeamResponse> & { message?: string };

  if (!response.ok || !data.item) {
    throw new Error(data.message || "No se pudo crear el equipo.");
  }

  return data.item;
}
