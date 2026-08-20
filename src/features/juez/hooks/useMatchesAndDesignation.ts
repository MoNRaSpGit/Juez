import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { EMPTY_MATCH_FORM } from "../juez.mock";
import {
  confirmJuezAssignment,
  createJuezMatch,
  listJuezAssignments,
  listJuezAvailability,
  listJuezMatches,
  toggleJuezAvailability
} from "../juez.matches.client";
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

type UseMatchesAndDesignationOptions = {
  currentTournament: string;
  currentUser: Referee | null;
};

export function useMatchesAndDesignation({ currentTournament, currentUser }: UseMatchesAndDesignationOptions) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedMatchId, setSelectedMatchIdState] = useState("");
  const [matchForm, setMatchForm] = useState<MatchFormState>(EMPTY_MATCH_FORM);
  const [designationDraft, setDesignationDraft] = useState<Record<RefereeRole, string>>(EMPTY_DRAFT);

  useEffect(() => {
    let active = true;

    async function loadAll() {
      try {
        const [matchItems, availabilityItems, assignmentItems] = await Promise.all([
          listJuezMatches(),
          listJuezAvailability(),
          listJuezAssignments()
        ]);

        if (!active) return;
        setMatches(matchItems);
        setAvailability(availabilityItems);
        setAssignments(assignmentItems);
      } catch {
        if (active) toast.error("No se pudieron cargar los partidos.");
      }
    }

    void loadAll();
    return () => {
      active = false;
    };
  }, []);

  function handleChangeMatchForm(field: keyof MatchFormState, value: string) {
    setMatchForm((current) => ({ ...current, [field]: value }));
  }

  function handleSelectMatch(matchId: string) {
    setSelectedMatchIdState(matchId);
    const existingAssignment = assignments.find((assignment) => assignment.matchId === matchId);
    setDesignationDraft(createDesignationDraftFromAssignment(existingAssignment));
  }

  async function handleCreateMatch() {
    if (!matchForm.homeSide || !matchForm.awaySide || !matchForm.venue || !matchForm.date || !matchForm.time) {
      toast.error("Completa cuadro A, cuadro B, lugar, fecha y hora para publicar el partido.");
      return;
    }

    try {
      const item = await createJuezMatch({ tournament: currentTournament, ...matchForm });
      setMatches((current) => [item, ...current]);
      setMatchForm(EMPTY_MATCH_FORM);
      toast.success("Partido publicado para que los jueces confirmen si pueden ir.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo publicar el partido.");
    }
  }

  async function handleToggleAvailability(matchId: string) {
    if (!currentUser) return;

    try {
      const items = await toggleJuezAvailability(matchId, currentUser.id);
      setAvailability(items);

      const isNowAvailable = items.some((entry) => entry.refereeId === currentUser.id && entry.matchId === matchId);
      if (isNowAvailable) {
        toast.success("Quedaste confirmado para este partido.");
      } else {
        toast.info("Se quito tu confirmacion para este partido.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar tu disponibilidad.");
    }
  }

  function handleDesignationChange(role: RefereeRole, refereeId: string) {
    setDesignationDraft((current) => ({ ...current, [role]: refereeId }));
  }

  async function handleConfirmDesignation() {
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

    try {
      const items = await confirmJuezAssignment(selectedMatch.id, {
        principalRefereeId: designationDraft.principal,
        secondaryRefereeId: designationDraft.secundario,
        scorerRefereeId: designationDraft.planillero
      });

      setAssignments(items);
      setMatches((current) => current.map((match) => (match.id === selectedMatch.id ? { ...match, status: "assigned" } : match)));
      setSelectedMatchIdState("");
      setDesignationDraft(EMPTY_DRAFT);
      toast.success("Designacion oficial confirmada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo confirmar la designacion.");
    }
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
