import { JuezAdminView } from "./JuezAdminView";
import { JuezAdministrationView } from "./JuezAdministrationView";
import { JuezRefereeView } from "./JuezRefereeView";
import { JuezHomePageController } from "../hooks/useJuezHomePageController";

type JuezDashboardScreenProps = Pick<
  JuezHomePageController,
  | "availability"
  | "assignments"
  | "authMode"
  | "canManageAdministration"
  | "currentTournament"
  | "currentUser"
  | "designationDraft"
  | "handleChangeMatchForm"
  | "handleCloseRegistration"
  | "handleConfirmDesignation"
  | "handleCreateMatch"
  | "handleDesignationChange"
  | "handleLogout"
  | "handleReopenRegistration"
  | "handleSaveTournament"
  | "handleStartTournamentEdit"
  | "handleToggleAvailability"
  | "handleToggleRefereeRole"
  | "handleUseSuggestedDesignation"
  | "isEditingTournament"
  | "matchForm"
  | "matches"
  | "referees"
  | "selectedMatchId"
  | "setSelectedMatchId"
  | "setTournamentDraft"
  | "summary"
  | "tournamentDraft"
  | "viewMode"
  | "setViewMode"
>;

export function JuezDashboardScreen({
  availability,
  assignments,
  canManageAdministration,
  currentTournament,
  currentUser,
  designationDraft,
  handleChangeMatchForm,
  handleCloseRegistration,
  handleConfirmDesignation,
  handleCreateMatch,
  handleDesignationChange,
  handleLogout,
  handleReopenRegistration,
  handleSaveTournament,
  handleStartTournamentEdit,
  handleToggleAvailability,
  handleToggleRefereeRole,
  handleUseSuggestedDesignation,
  isEditingTournament,
  matchForm,
  matches,
  referees,
  selectedMatchId,
  setSelectedMatchId,
  setTournamentDraft,
  summary,
  tournamentDraft,
  viewMode,
  setViewMode
}: JuezDashboardScreenProps) {
  return (
    <main className="juez-app">
      <section className="juez-shell">
        <header className="juez-hero">
          <div className="juez-hero__top">
            <div>
              <p className="juez-eyebrow">SaasPro</p>
              <h1 className="juez-title">Juez</h1>
            </div>

            <div className="juez-hero__actions">
              <div className="juez-tab-row">
                <button type="button" className={`juez-tab ${viewMode === "matches" ? "is-active" : ""}`} onClick={() => setViewMode("matches")}>
                  Partidos
                </button>
                <button type="button" className={`juez-tab ${viewMode === "referees" ? "is-active" : ""}`} onClick={() => setViewMode("referees")}>
                  Jueces
                </button>
                {canManageAdministration ? (
                  <button
                    type="button"
                    className={`juez-tab ${viewMode === "administration" ? "is-active" : ""}`}
                    onClick={() => setViewMode("administration")}
                  >
                    Administracion
                  </button>
                ) : null}
              </div>

              <div className="juez-session-bar">
                <div className="juez-session-chip">
                  <strong>{currentUser?.name}</strong>
                  <span>{currentUser?.city}</span>
                  <span>{currentUser?.accountRole === "admin" ? "Administrador" : "Juez"}</span>
                </div>
                <button type="button" className="juez-button juez-button--ghost" onClick={handleLogout}>
                  Salir
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="juez-summary-grid">
          <article className="juez-summary-card">
            <strong>Partidos</strong>
            <span>{matches.length}</span>
            <p>{summary.openMatches + summary.pendingMatches + summary.assignedMatches}</p>
          </article>
          <article className="juez-summary-card">
            <strong>Abiertos</strong>
            <span>{summary.openMatches}</span>
            <p>{summary.openMatches}</p>
          </article>
          <article className="juez-summary-card">
            <strong>Por designar</strong>
            <span>{summary.pendingMatches}</span>
            <p>{summary.pendingMatches}</p>
          </article>
          <article className="juez-summary-card">
            <strong>Oficiales</strong>
            <span>{summary.assignedMatches}</span>
            <p>{summary.assignedMatches}</p>
          </article>
        </section>

        {viewMode === "matches" ? (
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
          />
        ) : null}

        {viewMode === "referees" ? (
          <JuezRefereeView
            currentReferee={currentUser!}
            matches={matches}
            availability={availability}
            assignments={assignments}
            onToggleAvailability={handleToggleAvailability}
          />
        ) : null}

        {viewMode === "administration" && canManageAdministration ? (
          <JuezAdministrationView referees={referees} onToggleRefereeRole={handleToggleRefereeRole} />
        ) : null}
      </section>
    </main>
  );
}
