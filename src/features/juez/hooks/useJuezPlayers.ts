import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { createJuezPlayer, listJuezPlayers, updateJuezPlayer } from "../juez.players.client";
import { INITIAL_JUEZ_PLAYER_FORM, JuezPlayer, JuezPlayerFormState } from "../juez.players.types";
import { createJuezTeam, listJuezTeams } from "../juez.teams.client";
import { INITIAL_JUEZ_TEAM_FORM, JuezTeam, JuezTeamFormState } from "../juez.teams.types";
import { getPlayerExpiryUrgency } from "../juez.utils";

export function useJuezPlayers() {
  const [players, setPlayers] = useState<JuezPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [teams, setTeams] = useState<JuezTeam[]>([]);
  const [isTeamsLoading, setIsTeamsLoading] = useState(true);
  const [teamForm, setTeamForm] = useState<JuezTeamFormState>(INITIAL_JUEZ_TEAM_FORM);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const [playerForm, setPlayerForm] = useState<JuezPlayerFormState>(INITIAL_JUEZ_PLAYER_FORM);

  const [browseTeamId, setBrowseTeamId] = useState<number | null>(null);

  const [editingPlayer, setEditingPlayer] = useState<JuezPlayer | null>(null);
  const [editForm, setEditForm] = useState<JuezPlayerFormState>(INITIAL_JUEZ_PLAYER_FORM);

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

  useEffect(() => {
    let active = true;

    async function loadTeams() {
      try {
        const items = await listJuezTeams();
        if (active) setTeams(items);
      } catch {
        if (active) toast.error("No se pudieron cargar los equipos.");
      } finally {
        if (active) setIsTeamsLoading(false);
      }
    }

    void loadTeams();
    return () => {
      active = false;
    };
  }, []);

  const selectedTeam = useMemo(() => teams.find((candidate) => candidate.id === selectedTeamId) ?? null, [teams, selectedTeamId]);

  function handleChangeTeamForm(field: keyof JuezTeamFormState, value: string) {
    setTeamForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCreateTeam() {
    const trimmedName = teamForm.name.trim();
    if (!trimmedName) {
      toast.error("Ingresa el nombre del equipo.");
      return;
    }

    try {
      const team = await createJuezTeam({ name: trimmedName, division: teamForm.division, sex: teamForm.sex });
      setTeams((current) => [...current, team].sort((left, right) => left.name.localeCompare(right.name)));
      setSelectedTeamId(team.id);
      setTeamForm(INITIAL_JUEZ_TEAM_FORM);
      toast.success("Equipo creado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el equipo.");
    }
  }

  function handleChangePlayerForm(field: keyof JuezPlayerFormState, value: string) {
    setPlayerForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCreatePlayer() {
    if (!selectedTeam) {
      toast.error("Selecciona un equipo primero.");
      return;
    }

    const trimmedName = playerForm.name.trim();
    const trimmedLastName = playerForm.lastName.trim();

    if (!trimmedName) {
      toast.error("Ingresa el nombre del jugador.");
      return;
    }
    if (!trimmedLastName) {
      toast.error("Ingresa el apellido del jugador.");
      return;
    }
    if (!playerForm.expiryDate) {
      toast.error("Ingresa la fecha de vencimiento.");
      return;
    }

    try {
      const item = await createJuezPlayer({
        team: selectedTeam.name,
        division: selectedTeam.division,
        sex: selectedTeam.sex,
        name: trimmedName,
        lastName: trimmedLastName,
        expiryDate: playerForm.expiryDate,
        cedula: playerForm.cedula.trim() || undefined,
        phone: playerForm.phone.trim() || undefined,
        birthDate: playerForm.birthDate || undefined,
        photoDataUrl: playerForm.photoDataUrl || undefined
      });

      setPlayers((current) => [...current, item]);
      setPlayerForm(INITIAL_JUEZ_PLAYER_FORM);
      toast.success("Jugador agregado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo agregar el jugador.");
    }
  }

  function handleOpenEditPlayer(player: JuezPlayer) {
    setEditingPlayer(player);
    setEditForm({
      name: player.name,
      lastName: player.lastName,
      expiryDate: player.expiryDate,
      cedula: player.cedula ?? "",
      phone: player.phone ?? "",
      birthDate: player.birthDate ?? "",
      photoDataUrl: ""
    });
  }

  function handleCloseEditPlayer() {
    setEditingPlayer(null);
    setEditForm(INITIAL_JUEZ_PLAYER_FORM);
  }

  function handleChangeEditForm(field: keyof JuezPlayerFormState, value: string) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmitEditPlayer() {
    if (!editingPlayer) return;

    const trimmedName = editForm.name.trim();
    const trimmedLastName = editForm.lastName.trim();

    if (!trimmedName) {
      toast.error("Ingresa el nombre del jugador.");
      return;
    }
    if (!trimmedLastName) {
      toast.error("Ingresa el apellido del jugador.");
      return;
    }
    if (!editForm.expiryDate) {
      toast.error("Ingresa la fecha de vencimiento.");
      return;
    }

    try {
      const item = await updateJuezPlayer(editingPlayer.id, {
        name: trimmedName,
        lastName: trimmedLastName,
        expiryDate: editForm.expiryDate,
        cedula: editForm.cedula.trim() || undefined,
        phone: editForm.phone.trim() || undefined,
        birthDate: editForm.birthDate || undefined,
        photoDataUrl: editForm.photoDataUrl || undefined
      });

      setPlayers((current) => current.map((player) => (player.id === item.id ? item : player)));
      toast.success("Jugador actualizado.");
      handleCloseEditPlayer();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el jugador.");
    }
  }

  const browseTeam = useMemo(() => teams.find((candidate) => candidate.id === browseTeamId) ?? null, [teams, browseTeamId]);

  const browsedPlayers = (
    browseTeam
      ? players.filter(
          (player) =>
            player.team.toLowerCase() === browseTeam.name.trim().toLowerCase() &&
            player.division === browseTeam.division &&
            player.sex === browseTeam.sex
        )
      : players.filter((player) => getPlayerExpiryUrgency(player.expiryDate) !== "normal")
  ).sort((left, right) => left.lastName.localeCompare(right.lastName) || left.name.localeCompare(right.name));

  return {
    players,
    isLoading,

    teams,
    isTeamsLoading,
    teamForm,
    handleChangeTeamForm,
    handleCreateTeam,
    selectedTeamId,
    setSelectedTeamId,
    selectedTeam,

    playerForm,
    handleChangePlayerForm,
    handleCreatePlayer,

    browseTeamId,
    setBrowseTeamId,
    browseTeam,
    browsedPlayers,

    editingPlayer,
    editForm,
    handleOpenEditPlayer,
    handleCloseEditPlayer,
    handleChangeEditForm,
    handleSubmitEditPlayer
  };
}
