import { useState } from "react";
import { toast } from "react-toastify";
import { EMPTY_MATCH_FORM, INITIAL_ASSIGNMENTS, INITIAL_AVAILABILITY, INITIAL_MATCHES } from "../juez.mock";
import { buildMatchId } from "../juez.utils";
import { Assignment, AvailabilityEntry, Match, MatchFormState, Referee, RefereeRole } from "../juez.types";

const EMPTY_DRAFT: Record<RefereeRole, string> = {
  principal: "",
  secundario: "",
  planillero: ""
};

function createDesignationDraftFromAssignment(assignment?: Assignment | null) {
  if (!assignment) {
    return { ...EMPTY_DRAFT };
  }

  return {
    principal: assignment.principalRefereeId,
    secundario: assignment.secondaryRefereeId,
    planillero: assignment.scorerRefereeId
  };
}

// TEST-ONLY: fakes a few referees already confirming availability for a brand new match,
// so the designation picker has candidates to try the flow with before real judges apply.
// Remove this once matches go live with real referees confirming for real.
const FAKE_AVAILABILITY_REFEREE_IDS = ["ref-1", "ref-2", "ref-3", "ref-4"];

function buildFakeAvailabilityForTesting(matchId: string): AvailabilityEntry[] {
  return FAKE_AVAILABILITY_REFEREE_IDS.map((refereeId) => ({
    refereeId,
    matchId,
    createdAt: new Date().toISOString()
  }));
}

type UseMatchesAndDesignationOptions = {
  currentTournament: string;
  currentUser: Referee | null;
};

export function useMatchesAndDesignation({ currentTournament, currentUser }: UseMatchesAndDesignationOptions) {
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [availability, setAvailability] = useState(INITIAL_AVAILABILITY);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [selectedMatchId, setSelectedMatchIdState] = useState("");
  const [matchForm, setMatchForm] = useState<MatchFormState>(EMPTY_MATCH_FORM);
  const [designationDraft, setDesignationDraft] = useState<Record<RefereeRole, string>>(EMPTY_DRAFT);

  function handleChangeMatchForm(field: keyof MatchFormState, value: string) {
    setMatchForm((current) => ({ ...current, [field]: value }));
  }

  function handleSelectMatch(matchId: string) {
    setSelectedMatchIdState(matchId);
    const existingAssignment = assignments.find((assignment) => assignment.matchId === matchId);
    setDesignationDraft(createDesignationDraftFromAssignment(existingAssignment));
  }

  function handleCreateMatch() {
    if (!matchForm.homeSide || !matchForm.awaySide || !matchForm.venue || !matchForm.date || !matchForm.time) {
      toast.error("Completa cuadro A, cuadro B, lugar, fecha y hora para publicar el partido.");
      return;
    }

    const nextMatch: Match = {
      id: buildMatchId(),
      tournament: currentTournament,
      homeSide: matchForm.homeSide,
      awaySide: matchForm.awaySide,
      venue: matchForm.venue,
      date: matchForm.date,
      time: matchForm.time,
      status: "open"
    };

    setMatches((current) => [nextMatch, ...current]);
    setAvailability((current) => [...current, ...buildFakeAvailabilityForTesting(nextMatch.id)]);
    setMatchForm(EMPTY_MATCH_FORM);
    toast.success("Partido publicado para que los jueces confirmen si pueden ir.");
  }

  function handleToggleAvailability(matchId: string) {
    if (!currentUser) return;

    const existing = availability.find((entry) => entry.refereeId === currentUser.id && entry.matchId === matchId);

    if (existing) {
      setAvailability((current) => current.filter((entry) => entry !== existing));
      toast.info("Se quito tu confirmacion para este partido.");
      return;
    }

    setAvailability((current) => [...current, { refereeId: currentUser.id, matchId, createdAt: new Date().toISOString() }]);
    toast.success("Quedaste confirmado para este partido.");
  }

  function handleDesignationChange(role: RefereeRole, refereeId: string) {
    setDesignationDraft((current) => ({ ...current, [role]: refereeId }));
  }

  function handleConfirmDesignation() {
    const selectedMatch = matches.find((match) => match.id === selectedMatchId);
    if (!selectedMatch) {
      toast.error("Selecciona un partido para designar.");
      return;
    }

    if (!designationDraft.principal || !designationDraft.secundario || !designationDraft.planillero) {
      toast.error("La designacion debe completar principal, secundario y planillero.");
      return;
    }

    const uniqueReferees = new Set(Object.values(designationDraft));
    if (uniqueReferees.size !== 3) {
      toast.error("Cada puesto debe quedar asignado a una persona distinta.");
      return;
    }

    const nextAssignment: Assignment = {
      matchId: selectedMatch.id,
      principalRefereeId: designationDraft.principal,
      secondaryRefereeId: designationDraft.secundario,
      scorerRefereeId: designationDraft.planillero,
      confirmedAt: new Date().toISOString()
    };

    setAssignments((current) => {
      const withoutCurrent = current.filter((assignment) => assignment.matchId !== selectedMatch.id);
      return [nextAssignment, ...withoutCurrent];
    });
    setMatches((current) => current.map((match) => (match.id === selectedMatch.id ? { ...match, status: "assigned" } : match)));
    setSelectedMatchIdState("");
    setDesignationDraft(EMPTY_DRAFT);
    toast.success("Designacion oficial confirmada.");
  }

  function resetDesignationDraft() {
    setDesignationDraft(EMPTY_DRAFT);
  }

  return {
    matches,
    availability,
    assignments,
    selectedMatchId,
    matchForm,
    designationDraft,
    handleChangeMatchForm,
    setSelectedMatchId: handleSelectMatch,
    handleCreateMatch,
    handleToggleAvailability,
    handleDesignationChange,
    handleConfirmDesignation,
    resetDesignationDraft
  };
}
