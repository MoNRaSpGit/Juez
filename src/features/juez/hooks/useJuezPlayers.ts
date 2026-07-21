import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { createJuezPlayer, listJuezPlayers } from "../juez.players.client";
import { INITIAL_JUEZ_PLAYER_FORM, JuezPlayer, JuezPlayerDivision, JuezPlayerFormState, JuezPlayerSex } from "../juez.players.types";

export function useJuezPlayers() {
  const [players, setPlayers] = useState<JuezPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [team, setTeam] = useState("Penarol");
  const [division, setDivision] = useState<JuezPlayerDivision>("A");
  const [sex, setSex] = useState<JuezPlayerSex>("masculino");
  const [playerForm, setPlayerForm] = useState<JuezPlayerFormState>(INITIAL_JUEZ_PLAYER_FORM);

  const [browseTeam, setBrowseTeam] = useState("");
  const [browseDivision, setBrowseDivision] = useState<JuezPlayerDivision>("A");
  const [browseSex, setBrowseSex] = useState<JuezPlayerSex>("masculino");

  useEffect(() => {
    let active = true;

    async function loadPlayers() {
      try {
        const items = await listJuezPlayers();
        if (active) setPlayers(items);
      } catch {
        if (active) toast.error("No se pudieron cargar los jugadores.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadPlayers();
    return () => {
      active = false;
    };
  }, []);

  const teamOptions = useMemo(() => {
    const uniqueTeams = new Set(players.map((player) => player.team));
    return Array.from(uniqueTeams).sort((left, right) => left.localeCompare(right));
  }, [players]);

  useEffect(() => {
    if (!browseTeam && teamOptions.length) {
      setBrowseTeam(teamOptions[0]);
    }
  }, [browseTeam, teamOptions]);

  function handleChangePlayerForm(field: keyof JuezPlayerFormState, value: string) {
    setPlayerForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCreatePlayer() {
    const trimmedTeam = team.trim();
    const trimmedName = playerForm.name.trim();

    if (!trimmedTeam) {
      toast.error("Ingresa el equipo.");
      return;
    }
    if (!trimmedName) {
      toast.error("Ingresa el nombre del jugador.");
      return;
    }
    if (!playerForm.expiryDate) {
      toast.error("Ingresa la fecha de vencimiento.");
      return;
    }

    try {
      const item = await createJuezPlayer({
        team: trimmedTeam,
        division,
        sex,
        name: trimmedName,
        expiryDate: playerForm.expiryDate,
        cedula: playerForm.cedula.trim() || undefined,
        birthDate: playerForm.birthDate || undefined
      });

      setPlayers((current) => [...current, item]);
      setPlayerForm(INITIAL_JUEZ_PLAYER_FORM);
      toast.success("Jugador agregado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo agregar el jugador.");
    }
  }

  const filteredPlayers = players
    .filter((player) => player.team.toLowerCase() === team.trim().toLowerCase() && player.division === division && player.sex === sex)
    .sort((left, right) => left.name.localeCompare(right.name));

  const browsedPlayers = players
    .filter(
      (player) =>
        player.team.toLowerCase() === browseTeam.trim().toLowerCase() &&
        player.division === browseDivision &&
        player.sex === browseSex
    )
    .sort((left, right) => left.name.localeCompare(right.name));

  return {
    players,
    filteredPlayers,
    isLoading,
    team,
    setTeam,
    division,
    setDivision,
    sex,
    setSex,
    playerForm,
    handleChangePlayerForm,
    handleCreatePlayer,

    teamOptions,
    browseTeam,
    setBrowseTeam,
    browseDivision,
    setBrowseDivision,
    browseSex,
    setBrowseSex,
    browsedPlayers
  };
}
