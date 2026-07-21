import { API_BASE_URL } from "../../shared/config/api";
import { JuezPlayer, JuezPlayerDivision, JuezPlayerSex } from "./juez.players.types";

type ListPlayersResponse = {
  items: JuezPlayer[];
};

type CreatePlayerResponse = {
  item: JuezPlayer;
};

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export async function listJuezPlayers() {
  const response = await fetch(buildUrl("/juez-players"));
  const data = (await response.json().catch(() => ({}))) as Partial<ListPlayersResponse> & { message?: string };

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron cargar los jugadores.");
  }

  return data.items ?? [];
}

export async function createJuezPlayer(payload: {
  team: string;
  division: JuezPlayerDivision;
  sex: JuezPlayerSex;
  name: string;
  expiryDate: string;
  cedula?: string;
  birthDate?: string;
}) {
  const response = await fetch(buildUrl("/juez-players"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = (await response.json().catch(() => ({}))) as Partial<CreatePlayerResponse> & { message?: string };

  if (!response.ok || !data.item) {
    throw new Error(data.message || "No se pudo agregar el jugador.");
  }

  return data.item;
}
