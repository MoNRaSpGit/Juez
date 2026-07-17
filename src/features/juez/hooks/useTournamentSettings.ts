import { useState } from "react";
import { toast } from "react-toastify";
import { DEFAULT_TOURNAMENT } from "../juez.mock";

export function useTournamentSettings() {
  const [currentTournament, setCurrentTournament] = useState(DEFAULT_TOURNAMENT);
  const [tournamentDraft, setTournamentDraft] = useState(DEFAULT_TOURNAMENT);
  const [isEditingTournament, setIsEditingTournament] = useState(false);

  function handleStartTournamentEdit() {
    setTournamentDraft(currentTournament);
    setIsEditingTournament(true);
  }

  function handleSaveTournament() {
    const nextTournament = tournamentDraft.trim();
    if (!nextTournament) {
      setTournamentDraft(currentTournament);
      setIsEditingTournament(false);
      return;
    }

    setCurrentTournament(nextTournament);
    setIsEditingTournament(false);
    toast.success("Torneo predefinido actualizado.");
  }

  return {
    currentTournament,
    tournamentDraft,
    isEditingTournament,
    handleStartTournamentEdit,
    handleSaveTournament,
    setTournamentDraft
  };
}
