import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import "./juez.css";
import { JuezAdminView } from "./components/JuezAdminView";
import { JuezRefereeView } from "./components/JuezRefereeView";
import {
  DEFAULT_TOURNAMENT,
  EMPTY_MATCH_FORM,
  INITIAL_ASSIGNMENTS,
  INITIAL_AVAILABILITY,
  INITIAL_MATCHES,
  INITIAL_REFEREES
} from "./juez.mock";
import { buildMatchId, suggestAssignment } from "./juez.utils";
import { Assignment, Match, MatchFormState, RefereeRole } from "./juez.types";

type ViewMode = "admin" | "referees";

const EMPTY_DRAFT: Record<RefereeRole, string> = {
  principal: "",
  secundario: "",
  planillero: ""
};

export function JuezHomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("admin");
  const [referees, setReferees] = useState(INITIAL_REFEREES);
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [availability, setAvailability] = useState(INITIAL_AVAILABILITY);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [selectedRefereeId, setSelectedRefereeId] = useState(INITIAL_REFEREES[0]?.id ?? "");
  const [selectedMatchId, setSelectedMatchId] = useState(INITIAL_MATCHES[1]?.id ?? INITIAL_MATCHES[0]?.id ?? "");
  const [matchForm, setMatchForm] = useState<MatchFormState>(EMPTY_MATCH_FORM);
  const [designationDraft, setDesignationDraft] = useState<Record<RefereeRole, string>>(EMPTY_DRAFT);
  const [currentTournament, setCurrentTournament] = useState(DEFAULT_TOURNAMENT);
  const [tournamentDraft, setTournamentDraft] = useState(DEFAULT_TOURNAMENT);
  const [isEditingTournament, setIsEditingTournament] = useState(false);

  const summary = useMemo(() => {
    const openMatches = matches.filter((match) => match.status === "open").length;
    const pendingMatches = matches.filter((match) => match.status === "closed").length;
    const assignedMatches = matches.filter((match) => match.status === "assigned").length;
    return { openMatches, pendingMatches, assignedMatches };
  }, [matches]);

  function handleChangeMatchForm(field: keyof MatchFormState, value: string) {
    setMatchForm((current) => ({ ...current, [field]: value }));
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
    setSelectedMatchId(nextMatch.id);
    setMatchForm(EMPTY_MATCH_FORM);
    toast.success("Partido publicado para que los jueces confirmen si pueden ir.");
  }

  function handleToggleAvailability(matchId: string) {
    setAvailability((current) => {
      const existing = current.find((entry) => entry.refereeId === selectedRefereeId && entry.matchId === matchId);
      if (existing) {
        return current.filter((entry) => entry !== existing);
      }

      return [...current, { refereeId: selectedRefereeId, matchId, createdAt: new Date().toISOString() }];
    });
  }

  function applySuggestedDesignation(matchId: string) {
    const suggested = suggestAssignment(matchId, referees, availability);
    if (!suggested) {
      toast.error("No hay suficientes arbitros compatibles para completar la designacion.");
      return null;
    }

    setDesignationDraft(suggested);
    return suggested;
  }

  function handleCloseRegistration(matchId: string) {
    setMatches((current) => current.map((match) => (match.id === matchId ? { ...match, status: "closed" } : match)));
    const suggested = applySuggestedDesignation(matchId);
    if (suggested) {
      toast.success("Inscripcion cerrada. El sistema ya preparo una propuesta de designacion.");
    }
  }

  function handleReopenRegistration(matchId: string) {
    setMatches((current) => current.map((match) => (match.id === matchId ? { ...match, status: "open" } : match)));
    setDesignationDraft(EMPTY_DRAFT);
    toast.info("Inscripcion reabierta para seguir sumando disponibilidad.");
  }

  function handleDesignationChange(role: RefereeRole, refereeId: string) {
    setDesignationDraft((current) => ({ ...current, [role]: refereeId }));
  }

  function handleUseSuggestedDesignation() {
    const selectedMatch = matches.find((match) => match.id === selectedMatchId);
    if (!selectedMatch) {
      toast.error("Selecciona un partido para sugerir la designacion.");
      return;
    }

    const suggested = applySuggestedDesignation(selectedMatch.id);
    if (suggested) {
      toast.success("Sugerencia del sistema aplicada.");
    }
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
    setDesignationDraft(EMPTY_DRAFT);
    toast.success("Designacion oficial confirmada.");
  }

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

  function handleToggleRefereeRole(refereeId: string, role: RefereeRole) {
    setReferees((current) =>
      current.map((referee) => {
        if (referee.id !== refereeId) {
          return referee;
        }

        const hasRole = referee.roles.includes(role);
        const nextRoles = hasRole ? referee.roles.filter((item) => item !== role) : [...referee.roles, role];

        if (!nextRoles.length) {
          toast.error("Cada juez debe conservar al menos un rol.");
          return referee;
        }

        return {
          ...referee,
          roles: nextRoles
        };
      })
    );
  }

  return (
    <main className="juez-app">
      <section className="juez-shell">
        <header className="juez-hero">
          <div className="juez-hero__top">
            <div>
              <p className="juez-eyebrow">SaasPro · demo visual</p>
              <h1 className="juez-title">Juez</h1>
              <p className="juez-subtitle">
                Demo pensada para mostrar rapido el flujo: publicar partido, confirmar disponibilidad y dejar que el
                sistema proponga la designacion segun los roles habilitados de cada juez.
              </p>
            </div>

            <div className="juez-tab-row">
              <button type="button" className={`juez-tab ${viewMode === "admin" ? "is-active" : ""}`} onClick={() => setViewMode("admin")}>
                Administrador
              </button>
              <button type="button" className={`juez-tab ${viewMode === "referees" ? "is-active" : ""}`} onClick={() => setViewMode("referees")}>
                Jueces
              </button>
            </div>
          </div>
        </header>

        <section className="juez-summary-grid">
          <article className="juez-summary-card">
            <strong>Partidos</strong>
            <span>{matches.length}</span>
            <p>Jornada cargada</p>
          </article>
          <article className="juez-summary-card">
            <strong>Abiertos</strong>
            <span>{summary.openMatches}</span>
            <p>Esperando confirmacion</p>
          </article>
          <article className="juez-summary-card">
            <strong>Por designar</strong>
            <span>{summary.pendingMatches}</span>
            <p>Con inscripcion cerrada</p>
          </article>
          <article className="juez-summary-card">
            <strong>Oficiales</strong>
            <span>{summary.assignedMatches}</span>
            <p>Designaciones cerradas</p>
          </article>
        </section>

        {viewMode === "admin" ? (
          <JuezAdminView
            matches={matches}
            referees={referees}
            availability={availability}
            assignments={assignments}
            selectedMatchId={selectedMatchId}
            matchForm={matchForm}
            designationDraft={designationDraft}
            currentTournament={currentTournament}
            isEditingTournament={isEditingTournament}
            tournamentDraft={tournamentDraft}
            onSelectMatch={setSelectedMatchId}
            onChangeMatchForm={handleChangeMatchForm}
            onCreateMatch={handleCreateMatch}
            onCloseRegistration={handleCloseRegistration}
            onReopenRegistration={handleReopenRegistration}
            onDesignationChange={handleDesignationChange}
            onUseSuggestedDesignation={handleUseSuggestedDesignation}
            onConfirmDesignation={handleConfirmDesignation}
            onStartTournamentEdit={handleStartTournamentEdit}
            onTournamentDraftChange={setTournamentDraft}
            onSaveTournament={handleSaveTournament}
            onToggleRefereeRole={handleToggleRefereeRole}
          />
        ) : (
          <JuezRefereeView
            selectedRefereeId={selectedRefereeId}
            referees={referees}
            matches={matches}
            availability={availability}
            assignments={assignments}
            onSelectReferee={setSelectedRefereeId}
            onToggleAvailability={handleToggleAvailability}
          />
        )}
      </section>
    </main>
  );
}
