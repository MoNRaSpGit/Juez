import { useState } from "react";
import { JuezAdminView } from "./JuezAdminView";
import { JuezAdministrationView } from "./JuezAdministrationView";
import { JuezPlayersBrowseView } from "./JuezPlayersBrowseView";
import { JuezPlayersView } from "./JuezPlayersView";
import { JuezRefereeView } from "./JuezRefereeView";
import { JuezHomePageController } from "../hooks/useJuezHomePageController";

type JuezDashboardScreenProps = Pick<
  JuezHomePageController,
  | "availability"
  | "assignments"
  | "browseTeam"
  | "browseTeamId"
  | "browsedPlayers"
  | "canManageAdministration"
  | "currentTournament"
  | "currentUser"
  | "designationDraft"
  | "editForm"
  | "editingPlayer"
  | "handleChangeEditForm"
  | "handleChangeMatchForm"
  | "handleChangePlayerForm"
  | "handleChangeTeamForm"
  | "handleCloseEditPlayer"
  | "handleConfirmDesignation"
  | "handleCreateMatch"
  | "handleCreatePlayer"
  | "handleCreateTeam"
  | "handleDesignationChange"
  | "handleLogout"
  | "handleOpenEditPlayer"
  | "handleResetAssignment"
  | "handleStartRedesignation"
  | "handleSaveTournament"
  | "handleStartTournamentEdit"
  | "handleSubmitEditPlayer"
  | "handleToggleAvailability"
  | "handleToggleRefereeRole"
  | "isEditingTournament"
  | "isLoadingPlayers"
  | "isTeamsLoading"
  | "matchForm"
  | "matches"
  | "playerForm"
  | "redesigningMatchId"
  | "referees"
  | "selectedMatchId"
  | "selectedTeam"
  | "selectedTeamId"
  | "setBrowseTeamId"
  | "setSelectedMatchId"
  | "setSelectedTeamId"
  | "setTournamentDraft"
  | "teamForm"
  | "teams"
  | "tournamentDraft"
  | "viewMode"
  | "setViewMode"
>;

// Pedido explicito (06/10/2026): "por ahora ocultarle todo menos lo que
// muestra que jugador esta vencido... saca la parte de crear partido,
// pero no lo borres, solo oculto". En vez de borrar las vistas de
// Crear Partido / Jueces / Crear equipo / Admin, quedan atras de este
// flag -- false las esconde del menu y de la pantalla, sin tocar el
// resto del codigo. Para volver a mostrarlas, alcanza con poner esto en
// true.
const SHOW_FULL_JUEZ_MENU = false;

export function JuezDashboardScreen({
  availability,
  assignments,
  browseTeam,
  browseTeamId,
  browsedPlayers,
  canManageAdministration,
  currentTournament,
  currentUser,
  designationDraft,
  editForm,
  editingPlayer,
  handleChangeEditForm,
  handleChangeMatchForm,
  handleChangePlayerForm,
  handleChangeTeamForm,
  handleCloseEditPlayer,
  handleConfirmDesignation,
  handleCreateMatch,
  handleCreatePlayer,
  handleCreateTeam,
  handleDesignationChange,
  handleLogout,
  handleOpenEditPlayer,
  handleResetAssignment,
  handleStartRedesignation,
  handleSaveTournament,
  handleStartTournamentEdit,
  handleSubmitEditPlayer,
  handleToggleAvailability,
  handleToggleRefereeRole,
  isEditingTournament,
  isLoadingPlayers,
  isTeamsLoading,
  matchForm,
  matches,
  playerForm,
  redesigningMatchId,
  referees,
  selectedMatchId,
  selectedTeam,
  selectedTeamId,
  setBrowseTeamId,
  setSelectedMatchId,
  setSelectedTeamId,
  setTournamentDraft,
  teamForm,
  teams,
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
                    {SHOW_FULL_JUEZ_MENU ? (
                      <button
                        type="button"
                        className={`juez-menu__item ${viewMode === "matches" ? "is-active" : ""}`}
                        onClick={() => {
                          setViewMode("matches");
                          setMenuOpen(false);
                        }}
                      >
                        Crear Partido
                      </button>
                    ) : null}
                    {SHOW_FULL_JUEZ_MENU ? (
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
                    ) : null}
                    {SHOW_FULL_JUEZ_MENU && canManageAdministration ? (
                      <button
                        type="button"
                        className={`juez-menu__item ${viewMode === "players" ? "is-active" : ""}`}
                        onClick={() => {
                          setViewMode("players");
                          setMenuOpen(false);
                        }}
                      >
                        Crear equipo
                      </button>
                    ) : null}
                    {/* Carnet visible para cualquier usuario logueado (admin o
                        usuario), no solo admin -- pedido explicito
                        (06/10/2026): "el admin va a poder modificar los
                        datos y el usuario solo verlos" -- el usuario
                        tiene que poder entrar igual, solo que sin editar. */}
                    <button
                      type="button"
                      className={`juez-menu__item ${viewMode === "players-browse" ? "is-active" : ""}`}
                      onClick={() => {
                        setViewMode("players-browse");
                        setMenuOpen(false);
                      }}
                    >
                      Carnet
                    </button>
                    {SHOW_FULL_JUEZ_MENU && canManageAdministration ? (
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

        {SHOW_FULL_JUEZ_MENU && viewMode === "matches" ? (
          <JuezAdminView
            matches={matches}
            referees={referees}
            availability={availability}
            assignments={assignments}
            teams={teams}
            selectedMatchId={selectedMatchId}
            matchForm={matchForm}
            designationDraft={designationDraft}
            redesigningMatchId={redesigningMatchId}
            currentTournament={currentTournament}
            isEditingTournament={isEditingTournament}
            tournamentDraft={tournamentDraft}
            onSelectMatch={setSelectedMatchId}
            onChangeMatchForm={handleChangeMatchForm}
            onCreateMatch={handleCreateMatch}
            onDesignationChange={handleDesignationChange}
            onConfirmDesignation={handleConfirmDesignation}
            onResetAssignment={handleResetAssignment}
            onStartRedesignation={handleStartRedesignation}
            onStartTournamentEdit={handleStartTournamentEdit}
            onTournamentDraftChange={setTournamentDraft}
            onSaveTournament={handleSaveTournament}
          />
        ) : null}

        {SHOW_FULL_JUEZ_MENU && viewMode === "referees" ? (
          <JuezRefereeView
            currentReferee={currentUser!}
            matches={matches}
            availability={availability}
            assignments={assignments}
            onToggleAvailability={handleToggleAvailability}
          />
        ) : null}

        {SHOW_FULL_JUEZ_MENU && viewMode === "administration" && canManageAdministration ? (
          <JuezAdministrationView referees={referees} assignments={assignments} onToggleRefereeRole={handleToggleRefereeRole} />
        ) : null}

        {SHOW_FULL_JUEZ_MENU && viewMode === "players" && canManageAdministration ? (
          <JuezPlayersView
            teams={teams}
            isTeamsLoading={isTeamsLoading}
            teamForm={teamForm}
            onChangeTeamForm={handleChangeTeamForm}
            onCreateTeam={handleCreateTeam}
            selectedTeamId={selectedTeamId}
            onSelectTeam={setSelectedTeamId}
            selectedTeam={selectedTeam}
            playerForm={playerForm}
            onChangePlayerForm={handleChangePlayerForm}
            onCreatePlayer={handleCreatePlayer}
          />
        ) : null}

        {viewMode === "players-browse" ? (
          <JuezPlayersBrowseView
            browsedPlayers={browsedPlayers}
            isLoading={isLoadingPlayers}
            teams={teams}
            browseTeamId={browseTeamId}
            setBrowseTeamId={setBrowseTeamId}
            browseTeam={browseTeam}
            editingPlayer={editingPlayer}
            editForm={editForm}
            onOpenEditPlayer={handleOpenEditPlayer}
            onCloseEditPlayer={handleCloseEditPlayer}
            onChangeEditForm={handleChangeEditForm}
            onSubmitEditPlayer={handleSubmitEditPlayer}
            canEdit={canManageAdministration}
          />
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
