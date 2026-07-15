import { Assignment, AvailabilityEntry, Match, MatchFormState, Referee, RefereeRole, ROLE_LABELS } from "../juez.types";
import { formatMatchDate, formatMatchLabel, getCompatibleReferees, getStatusLabel, getStatusTone } from "../juez.utils";

const CLUB_OPTIONS = ["Club Estudiante", "Club Cerrito", "Polideportivo"] as const;

type JuezAdminViewProps = {
  matches: Match[];
  referees: Referee[];
  availability: AvailabilityEntry[];
  assignments: Assignment[];
  selectedMatchId: string;
  matchForm: MatchFormState;
  designationDraft: Record<RefereeRole, string>;
  currentTournament: string;
  isEditingTournament: boolean;
  tournamentDraft: string;
  onSelectMatch: (matchId: string) => void;
  onChangeMatchForm: (field: keyof MatchFormState, value: string) => void;
  onCreateMatch: () => void;
  onDesignationChange: (role: RefereeRole, refereeId: string) => void;
  onConfirmDesignation: () => void;
  onStartTournamentEdit: () => void;
  onTournamentDraftChange: (value: string) => void;
  onSaveTournament: () => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getRefereeName(referees: Referee[], refereeId: string) {
  return referees.find((referee) => referee.id === refereeId)?.name ?? "Sin asignar";
}

export function JuezAdminView({
  matches,
  referees,
  availability,
  assignments,
  selectedMatchId,
  matchForm,
  designationDraft,
  currentTournament,
  isEditingTournament,
  tournamentDraft,
  onSelectMatch,
  onChangeMatchForm,
  onCreateMatch,
  onDesignationChange,
  onConfirmDesignation,
  onStartTournamentEdit,
  onTournamentDraftChange,
  onSaveTournament
}: JuezAdminViewProps) {
  const selectedMatch = matches.find((match) => match.id === selectedMatchId) ?? null;
  const selectedAssignment = assignments.find((assignment) => assignment.matchId === selectedMatch?.id);
  const selectedAvailability = selectedMatch ? availability.filter((entry) => entry.matchId === selectedMatch.id) : [];
  const selectedRefereeIds = Object.values(designationDraft).filter(Boolean);
  const selectedMatchResult = selectedMatch && selectedAssignment ? selectedAssignment : null;

  return (
    <section className="juez-layout-grid">
      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading juez-panel__heading--stack-mobile">
          <div>
            <p className="juez-eyebrow">Partidos</p>
            <h2>Publicar partidos</h2>
          </div>
          <div className="juez-tournament-box" onDoubleClick={onStartTournamentEdit}>
            <span className="juez-tournament-box__label">Torneo fijo</span>
            {isEditingTournament ? (
              <div className="juez-tournament-box__editor">
                <input
                  value={tournamentDraft}
                  onChange={(event) => onTournamentDraftChange(event.target.value)}
                  onBlur={onSaveTournament}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      onSaveTournament();
                    }
                  }}
                  autoFocus
                />
              </div>
            ) : (
              <strong>{currentTournament}</strong>
            )}
          </div>
        </div>

        <div className="juez-form-grid juez-form-grid--mobile-first">
          <label className="juez-field juez-field--full-mobile">
            <span>Cuadro A</span>
            <input
              value={matchForm.homeSide}
              onChange={(event) => onChangeMatchForm("homeSide", event.target.value)}
              placeholder="Atenas"
            />
          </label>
          <label className="juez-field juez-field--full-mobile">
            <span>Cuadro B</span>
            <input
              value={matchForm.awaySide}
              onChange={(event) => onChangeMatchForm("awaySide", event.target.value)}
              placeholder="Trouville"
            />
          </label>
          <label className="juez-field juez-field--full-mobile">
            <span>Lugar / Club</span>
            <select value={matchForm.venue} onChange={(event) => onChangeMatchForm("venue", event.target.value)}>
              <option value="">Seleccionar</option>
              {CLUB_OPTIONS.map((club) => (
                <option key={club} value={club}>
                  {club}
                </option>
              ))}
            </select>
          </label>
          <label className="juez-field">
            <span>Fecha</span>
            <input type="date" value={matchForm.date} onChange={(event) => onChangeMatchForm("date", event.target.value)} />
          </label>
          <label className="juez-field">
            <span>Hora</span>
            <input type="time" value={matchForm.time} onChange={(event) => onChangeMatchForm("time", event.target.value)} />
          </label>
        </div>

        <button type="button" className="juez-button juez-button--primary juez-button--full-mobile" onClick={onCreateMatch}>
          Publicar partido
        </button>
      </article>

      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">Jornada</p>
            <h2>Partidos publicados</h2>
          </div>
        </div>

        <div className="juez-match-list">
          {matches.map((match) => (
            <button
              key={match.id}
              type="button"
              className={`juez-match-card ${selectedMatchId === match.id ? "is-active" : ""}`}
              onClick={() => onSelectMatch(match.id)}
            >
              <div className="juez-match-card__main">
                <div>
                  <strong>{formatMatchLabel(match)}</strong>
                  <p>{match.tournament}</p>
                </div>
                <span className={`juez-pill juez-pill--${getStatusTone(match.status)}`}>{getStatusLabel(match.status)}</span>
              </div>
              <div className="juez-match-card__meta">
                <span>{match.venue}</span>
                <span>{formatMatchDate(match.date, match.time)}</span>
              </div>
            </button>
          ))}
        </div>

        <article className="juez-designation-result">
          <div className="juez-designation-result__head">
            <div>
              <p className="juez-eyebrow">Resultado de designaciones</p>
              <h3>{selectedMatch ? formatMatchLabel(selectedMatch) : "Selecciona un partido"}</h3>
            </div>
            {selectedMatch ? <span className={`juez-pill juez-pill--${getStatusTone(selectedMatch.status)}`}>{getStatusLabel(selectedMatch.status)}</span> : null}
          </div>

          {selectedMatchResult ? (
            <div className="juez-designation-result__grid">
              <div className="juez-designation-result__row">
                <span>Juez arriba</span>
                <strong>{getRefereeName(referees, selectedMatchResult.principalRefereeId)}</strong>
              </div>
              <div className="juez-designation-result__row">
                <span>Juez abajo</span>
                <strong>{getRefereeName(referees, selectedMatchResult.secondaryRefereeId)}</strong>
              </div>
              <div className="juez-designation-result__row">
                <span>Planillero</span>
                <strong>{getRefereeName(referees, selectedMatchResult.scorerRefereeId)}</strong>
              </div>
            </div>
          ) : selectedMatch ? (
            <div className="juez-designation-result__empty">
              <p className="juez-empty-inline">Todavía no tiene una designación confirmada.</p>
            </div>
          ) : (
            <p className="juez-empty-inline">Elegí un partido publicado para ver o confirmar su designación abajo.</p>
          )}

          {selectedMatch ? (
            <div className="juez-designation-result__actions">
              <button type="button" className="juez-button juez-button--ghost" onClick={() => onSelectMatch(selectedMatch.id)}>
                Cambiar jueces
              </button>
              <p className="juez-designation-result__hint">Se puede editar aunque el partido ya esté cerrado.</p>
            </div>
          ) : null}
        </article>
      </article>

      {selectedMatch ? (
        <div className="juez-modal" role="presentation" onClick={() => onSelectMatch("")}>
          <div className="juez-modal__backdrop" />
          <article
            className="juez-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Designar jueces para ${formatMatchLabel(selectedMatch)}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="juez-modal__header">
              <div>
                <p className="juez-eyebrow">Designacion</p>
                <h2>{formatMatchLabel(selectedMatch)}</h2>
                <p className="juez-modal__meta">
                  {selectedMatch.tournament} · {selectedMatch.venue} · {formatMatchDate(selectedMatch.date, selectedMatch.time)}
                </p>
              </div>
              <button type="button" className="juez-modal__close" onClick={() => onSelectMatch("")}>
                Cerrar
              </button>
            </div>

            <div className="juez-modal__summary">
              <span>{selectedAvailability.length} arbitros confirmados</span>
              {selectedAssignment ? <span>Ya asignado</span> : null}
            </div>

            <div className="juez-modal__grid">
              {(["principal", "secundario", "planillero"] as RefereeRole[]).map((role) => {
                const compatibleReferees = getCompatibleReferees(role, selectedMatch.id, referees, availability).filter(
                  (referee) => referee.id === designationDraft[role] || !selectedRefereeIds.includes(referee.id)
                );

                return (
                  <section key={role} className="juez-modal__role">
                    <div className="juez-role-card__header">
                      <h3>{ROLE_LABELS[role]}</h3>
                      <span>{compatibleReferees.length}</span>
                    </div>

                    <div className="juez-judge-pick-list">
                      {compatibleReferees.map((referee) => (
                        <button
                          key={referee.id}
                          type="button"
                          className={`juez-judge-pick ${designationDraft[role] === referee.id ? "is-selected" : ""}`}
                          onClick={() => onDesignationChange(role, referee.id)}
                        >
                          <span className="juez-avatar juez-avatar--small">{getInitials(referee.name)}</span>
                          <span className="juez-judge-pick__name">{referee.name}</span>
                        </button>
                      ))}
                    </div>
                    {!compatibleReferees.length ? <p className="juez-empty-inline">-</p> : null}
                  </section>
                );
              })}
            </div>

            <div className="juez-modal__footer">
              <button type="button" className="juez-button juez-button--primary" onClick={onConfirmDesignation}>
                Guardar y cerrar
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
