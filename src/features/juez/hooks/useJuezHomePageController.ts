import { useState } from "react";
import { useAuthSession } from "./useAuthSession";
import { useJuezPlayers } from "./useJuezPlayers";
import { useMatchesAndDesignation } from "./useMatchesAndDesignation";
import { useTournamentSettings } from "./useTournamentSettings";

export type { AuthFormState } from "./useAuthSession";
export type ViewMode = "matches" | "referees" | "administration" | "players" | "players-browse";

export function useJuezHomePageController() {
  // "players-browse" (Carnet, muestra jugadores por vencer/vencidos) por
  // defecto (06/10/2026, pedido explicito: "por ahora ocultar todo menos
  // lo que muestra que jugador esta vencido"). El resto de las vistas
  // sigue existiendo, solo oculto -- ver JuezDashboardScreen.tsx.
  const [viewMode, setViewMode] = useState<ViewMode>("players-browse");

  const auth = useAuthSession();
  const tournament = useTournamentSettings();
  const matchesState = useMatchesAndDesignation({
    currentTournament: tournament.currentTournament,
    currentUser: auth.currentUser
  });
  const playersState = useJuezPlayers();

  function handleLogout() {
    auth.logout();
    setViewMode("players-browse");
    matchesState.resetDesignationDraft();
  }

  return {
    // auth
    authForm: auth.authForm,
    canManageAdministration: auth.canManageAdministration,
    currentUser: auth.currentUser,
    referees: auth.referees,
    handleAuthSubmit: auth.handleAuthSubmit,
    handleChangeAuthField: auth.handleChangeAuthField,
    handleToggleRefereeRole: auth.handleToggleRefereeRole,
    setAuthForm: auth.setAuthForm,
    handleLogout,

    // tournament
    currentTournament: tournament.currentTournament,
    tournamentDraft: tournament.tournamentDraft,
    isEditingTournament: tournament.isEditingTournament,
    handleStartTournamentEdit: tournament.handleStartTournamentEdit,
    handleSaveTournament: tournament.handleSaveTournament,
    setTournamentDraft: tournament.setTournamentDraft,

    // matches & designation
    matches: matchesState.matches,
    availability: matchesState.availability,
    assignments: matchesState.assignments,
    selectedMatchId: matchesState.selectedMatchId,
    matchForm: matchesState.matchForm,
    designationDraft: matchesState.designationDraft,
    redesigningMatchId: matchesState.redesigningMatchId,
    handleChangeMatchForm: matchesState.handleChangeMatchForm,
    setSelectedMatchId: matchesState.setSelectedMatchId,
    handleCreateMatch: matchesState.handleCreateMatch,
    handleToggleAvailability: matchesState.handleToggleAvailability,
    handleDesignationChange: matchesState.handleDesignationChange,
    handleConfirmDesignation: matchesState.handleConfirmDesignation,
    handleResetAssignment: matchesState.handleResetAssignment,
    handleStartRedesignation: matchesState.handleStartRedesignation,

    // players
    allPlayers: playersState.players,
    isLoadingPlayers: playersState.isLoading,
    teams: playersState.teams,
    isTeamsLoading: playersState.isTeamsLoading,
    teamForm: playersState.teamForm,
    handleChangeTeamForm: playersState.handleChangeTeamForm,
    handleCreateTeam: playersState.handleCreateTeam,
    selectedTeamId: playersState.selectedTeamId,
    setSelectedTeamId: playersState.setSelectedTeamId,
    selectedTeam: playersState.selectedTeam,
    playerForm: playersState.playerForm,
    handleChangePlayerForm: playersState.handleChangePlayerForm,
    handleCreatePlayer: playersState.handleCreatePlayer,
    browsedPlayers: playersState.browsedPlayers,
    browseTeamId: playersState.browseTeamId,
    setBrowseTeamId: playersState.setBrowseTeamId,
    browseTeam: playersState.browseTeam,
    editingPlayer: playersState.editingPlayer,
    editForm: playersState.editForm,
    handleOpenEditPlayer: playersState.handleOpenEditPlayer,
    handleCloseEditPlayer: playersState.handleCloseEditPlayer,
    handleChangeEditForm: playersState.handleChangeEditForm,
    handleSubmitEditPlayer: playersState.handleSubmitEditPlayer,

    // ui
    viewMode,
    setViewMode
  };
}

export type JuezHomePageController = ReturnType<typeof useJuezHomePageController>;
