import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import "./juez.css";
import { JuezAdminView } from "./components/JuezAdminView";
import { JuezRefereeView } from "./components/JuezRefereeView";
import { EMPTY_MATCH_FORM, INITIAL_ASSIGNMENTS, INITIAL_AVAILABILITY, INITIAL_MATCHES, INITIAL_REFEREES } from "./juez.mock";
import { buildMatchId } from "./juez.utils";
import { Assignment, Match, MatchFormState, RefereeRole } from "./juez.types";

type ViewMode = "admin" | "referees";

const EMPTY_DRAFT: Record<RefereeRole, string> = {
  principal: "",
  secundario: "",
  planillero: ""
};

export function JuezHomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("admin");
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [availability, setAvailability] = useState(INITIAL_AVAILABILITY);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [selectedRefereeId, setSelectedRefereeId] = useState(INITIAL_REFEREES[0]?.id ?? "");
  const [selectedMatchId, setSelectedMatchId] = useState(INITIAL_MATCHES[1]?.id ?? INITIAL_MATCHES[0]?.id ?? "");
  const [matchForm, setMatchForm] = useState<MatchFormState>(EMPTY_MATCH_FORM);
  const [designationDraft, setDesignationDraft] = useState<Record<RefereeRole, string>>(EMPTY_DRAFT);

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
    if (!matchForm.tournament || !matchForm.homeTeam || !matchForm.awayTeam || !matchForm.date || !matchForm.time || !matchForm.court) {
      toast.error("Completa los datos principales del partido para publicarlo.");
      return;
    }

    const nextMatch: Match = {
      id: buildMatchId(),
      tournament: matchForm.tournament,
      homeTeam: matchForm.homeTeam,
      awayTeam: matchForm.awayTeam,
      date: matchForm.date,
      time: matchForm.time,
      court: matchForm.court,
      notes: matchForm.notes,
      status: "open"
    };

    setMatches((current) => [nextMatch, ...current]);
    setSelectedMatchId(nextMatch.id);
    setMatchForm(EMPTY_MATCH_FORM);
    toast.success("Partido publicado para que los arbitros indiquen disponibilidad.");
  }

  function handleToggleAvailability(matchId: string, role: RefereeRole) {
    const referee = INITIAL_REFEREES.find((item) => item.id === selectedRefereeId);
    if (!referee || !referee.roles.includes(role)) {
      toast.error("Ese rol no esta habilitado para este arbitro.");
      return;
    }

    setAvailability((current) => {
      const existing = current.find((entry) => entry.refereeId === selectedRefereeId && entry.matchId === matchId);
      if (!existing) {
        return [...current, { refereeId: selectedRefereeId, matchId, roles: [role], createdAt: new Date().toISOString() }];
      }

      const hasRole = existing.roles.includes(role);
      const nextRoles = hasRole ? existing.roles.filter((item) => item !== role) : [...existing.roles, role];

      if (!nextRoles.length) {
        return current.filter((entry) => entry !== existing);
      }

      return current.map((entry) => (entry === existing ? { ...entry, roles: nextRoles } : entry));
    });
  }

  function handleCloseRegistration(matchId: string) {
    setMatches((current) => current.map((match) => (match.id === matchId ? { ...match, status: "closed" } : match)));
    toast.success("Inscripcion cerrada. Ya se puede realizar la designacion.");
  }

  function handleReopenRegistration(matchId: string) {
    setMatches((current) => current.map((match) => (match.id === matchId ? { ...match, status: "open" } : match)));
    setDesignationDraft(EMPTY_DRAFT);
    toast.info("Inscripcion reabierta para seguir sumando disponibilidad.");
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
      toast.error("Para esta demo cada rol debe quedar asignado a una persona distinta.");
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

  return (
    <main className="juez-app">
      <section className="juez-shell">
        <header className="juez-hero">
          <div className="juez-hero__top">
            <div>
              <p className="juez-eyebrow">SaasPro · demo visual</p>
              <h1 className="juez-title">Juez</h1>
              <p className="juez-subtitle">
                Flujo visual para administrar designaciones arbitrales de voleibol: publicar partidos, recibir
                disponibilidad, designar por rol compatible y mostrar historial de asignaciones.
              </p>
            </div>

            <div className="juez-tab-row">
              <button type="button" className={`juez-tab ${viewMode === "admin" ? "is-active" : ""}`} onClick={() => setViewMode("admin")}>
                Administrador
              </button>
              <button type="button" className={`juez-tab ${viewMode === "referees" ? "is-active" : ""}`} onClick={() => setViewMode("referees")}>
                Arbitros
              </button>
            </div>
          </div>
        </header>

        <section className="juez-summary-grid">
          <article className="juez-summary-card">
            <strong>Partidos publicados</strong>
            <span>{matches.length}</span>
            <p>Jornada total cargada</p>
          </article>
          <article className="juez-summary-card">
            <strong>Inscripcion abierta</strong>
            <span>{summary.openMatches}</span>
            <p>Esperando disponibilidad</p>
          </article>
          <article className="juez-summary-card">
            <strong>Listos para designar</strong>
            <span>{summary.pendingMatches}</span>
            <p>Cierre completado</p>
          </article>
          <article className="juez-summary-card">
            <strong>Designaciones oficiales</strong>
            <span>{summary.assignedMatches}</span>
            <p>Historial confirmado</p>
          </article>
        </section>

        {viewMode === "admin" ? (
          <JuezAdminView
            matches={matches}
            referees={INITIAL_REFEREES}
            availability={availability}
            assignments={assignments}
            selectedMatchId={selectedMatchId}
            matchForm={matchForm}
            designationDraft={designationDraft}
            onSelectMatch={setSelectedMatchId}
            onChangeMatchForm={handleChangeMatchForm}
            onCreateMatch={handleCreateMatch}
            onCloseRegistration={handleCloseRegistration}
            onReopenRegistration={handleReopenRegistration}
            onDesignationChange={handleDesignationChange}
            onConfirmDesignation={handleConfirmDesignation}
          />
        ) : (
          <JuezRefereeView
            selectedRefereeId={selectedRefereeId}
            referees={INITIAL_REFEREES}
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
