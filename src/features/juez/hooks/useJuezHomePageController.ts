import { useState } from "react";
import { useAuthSession } from "./useAuthSession";
import { useJuezPlayers } from "./useJuezPlayers";
import { useMatchesAndDesignation } from "./useMatchesAndDesignation";
import { useTournamentSettings } from "./useTournamentSettings";

export type { AuthFormState, AuthMode } from "./useAuthSession";
export type ViewMode = "matches" | "referees" | "administration" | "players" | "players-browse";

export function useJuezHomePageController() {
  const [viewMode, setViewMode] = useState<ViewMode>("matches");

  const auth = useAuthSession();
  const tournament = useTournamentSettings();
  const matchesState = useMatchesAndDesignation({
    currentTournament: tournament.currentTournament,
    currentUser: auth.currentUser
  });
  const playersState = useJuezPlayers();

  function handleLogout() {
    auth.logout();
    setViewMode("matches");
    matchesState.resetDesignationDraft();
  }

  return {
    // auth
    authMode: auth.authMode,
    authForm: auth.authForm,
    canManageAdministration: auth.canManageAdministration,
    currentUser: auth.currentUser,
    referees: auth.referees,
    handleAuthSubmit: auth.handleAuthSubmit,
    handleChangeAuthField: auth.handleChangeAuthField,
    handleToggleAuthRole: auth.handleToggleAuthRole,
    handleToggleRefereeRole: auth.handleToggleRefereeRole,
    setAuthForm: auth.setAuthForm,
    setAuthMode: auth.setAuthMode,
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
    handleChangeMatchForm: matchesState.handleChangeMatchForm,
    setSelectedMatchId: matchesState.setSelectedMatchId,
    handleCreateMatch: matchesState.handleCreateMatch,
    handleToggleAvailability: matchesState.handleToggleAvailability,
    handleDesignationChange: matchesState.handleDesignationChange,
    handleConfirmDesignation: matchesState.handleConfirmDesignation,

    // players
    filteredPlayers: playersState.filteredPlayers,
    isLoadingPlayers: playersState.isLoading,
    playerTeam: playersState.team,
    setPlayerTeam: playersState.setTeam,
    playerDivision: playersState.division,
    setPlayerDivision: playersState.setDivision,
    playerSex: playersState.sex,
    setPlayerSex: playersState.setSex,
    playerForm: playersState.playerForm,
    handleChangePlayerForm: playersState.handleChangePlayerForm,
    handleCreatePlayer: playersState.handleCreatePlayer,
    teamOptions: playersState.teamOptions,
    browsedPlayers: playersState.browsedPlayers,
    browseTeam: playersState.browseTeam,
    setBrowseTeam: playersState.setBrowseTeam,
    browseDivision: playersState.browseDivision,
    setBrowseDivision: playersState.setBrowseDivision,
    browseSex: playersState.browseSex,
    setBrowseSex: playersState.setBrowseSex,

    // ui
    viewMode,
    setViewMode
  };
}

export type JuezHomePageController = ReturnType<typeof useJuezHomePageController>;
