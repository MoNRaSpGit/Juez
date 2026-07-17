import { useState } from "react";
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
  | "handleConfirmDesignation"
  | "handleCreateMatch"
  | "handleDesignationChange"
  | "handleLogout"
  | "handleSaveTournament"
  | "handleStartTournamentEdit"
  | "handleToggleAvailability"
  | "handleToggleRefereeRole"
  | "isEditingTournament"
  | "matchForm"
  | "matches"
  | "referees"
  | "selectedMatchId"
  | "setSelectedMatchId"
  | "setTournamentDraft"
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
  handleConfirmDesignation,
  handleCreateMatch,
  handleDesignationChange,
  handleLogout,
  handleSaveTournament,
  handleStartTournamentEdit,
  handleToggleAvailability,
  handleToggleRefereeRole,
  isEditingTournament,
  matchForm,
  matches,
  referees,
  selectedMatchId,
  setSelectedMatchId,
  setTournamentDraft,
  tournamentDraft,
  viewMode,
  setViewMode
}: JuezDashboardScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentUserInitials = currentUser?.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <main className="juez-app">
      <section className="juez-shell">
        <header className="juez-hero">
          <div className="juez-topbar">
            <div className="juez-topbar__brand">
              <span className="juez-topbar__logo">J</span>
              <strong className="juez-topbar__title">Juez</strong>
            </div>

            <div className="juez-menu">
              <button
                type="button"
                className="juez-menu__trigger"
                aria-expanded={menuOpen}
                aria-controls="juez-menu-panel"
                onClick={() => setMenuOpen((current) => !current)}
              >
                <span className="juez-menu__avatar">{currentUserInitials}</span>
                <span className="juez-menu__icon" aria-hidden="true">
                  <UserMenuIcon />
                </span>
                <span className="juez-menu__lines" aria-hidden="true">
                  <HamburgerIcon />
                </span>
              </button>

              {menuOpen ? (
                <div id="juez-menu-panel" className="juez-menu__panel">
                  <div className="juez-menu__user">
                    <span className="juez-menu__user-avatar">{currentUserInitials}</span>
                    <strong>{currentUser?.name}</strong>
                  </div>

                  <div className="juez-menu__group">
                    <button
                      type="button"
                      className={`juez-menu__item ${viewMode === "matches" ? "is-active" : ""}`}
                      onClick={() => {
                        setViewMode("matches");
                        setMenuOpen(false);
                      }}
                    >
                      Partidos
                    </button>
                    <button
                      type="button"
                      className={`juez-menu__item ${viewMode === "referees" ? "is-active" : ""}`}
                      onClick={() => {
                        setViewMode("referees");
                        setMenuOpen(false);
                      }}
                    >
                      Jueces
                    </button>
                    {canManageAdministration ? (
                      <button
                        type="button"
                        className={`juez-menu__item ${viewMode === "administration" ? "is-active" : ""}`}
                        onClick={() => {
                          setViewMode("administration");
                          setMenuOpen(false);
                        }}
                      >
                        Admin
                      </button>
                    ) : null}
                  </div>

                  <div className="juez-menu__group juez-menu__group--last">
                    <button
                      type="button"
                      className="juez-menu__item juez-menu__item--danger"
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      Salir
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

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
            onDesignationChange={handleDesignationChange}
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
          <JuezAdministrationView referees={referees} assignments={assignments} onToggleRefereeRole={handleToggleRefereeRole} />
        ) : null}
      </section>
    </main>
  );
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function UserMenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}
