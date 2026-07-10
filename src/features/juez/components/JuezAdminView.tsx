import { Assignment, AvailabilityEntry, Match, MatchFormState, Referee, RefereeRole, ROLE_LABELS } from "../juez.types";
import { formatMatchDate, formatMatchLabel, getCompatibleReferees, getStatusLabel, getStatusTone } from "../juez.utils";

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
  onCloseRegistration: (matchId: string) => void;
  onReopenRegistration: (matchId: string) => void;
  onDesignationChange: (role: RefereeRole, refereeId: string) => void;
  onUseSuggestedDesignation: () => void;
  onConfirmDesignation: () => void;
  onStartTournamentEdit: () => void;
  onTournamentDraftChange: (value: string) => void;
  onSaveTournament: () => void;
  onToggleRefereeRole: (refereeId: string, role: RefereeRole) => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
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
  onCloseRegistration,
  onReopenRegistration,
  onDesignationChange,
  onUseSuggestedDesignation,
  onConfirmDesignation,
  onStartTournamentEdit,
  onTournamentDraftChange,
  onSaveTournament,
  onToggleRefereeRole
}: JuezAdminViewProps) {
  const selectedMatch = matches.find((match) => match.id === selectedMatchId) ?? matches[0] ?? null;
  const selectedAssignment = assignments.find((assignment) => assignment.matchId === selectedMatch?.id);
  const selectedAvailability = selectedMatch
    ? availability.filter((entry) => entry.matchId === selectedMatch.id)
    : [];

  return (
    <section className="juez-layout-grid">
      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading juez-panel__heading--stack-mobile">
          <div>
            <p className="juez-eyebrow">Administrador</p>
            <h2>Publicar partidos</h2>
            <p className="juez-section-copy">Carga rapida para la jornada. Pensado para armar partidos desde el celu en pocos toques.</p>
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
            <small>Doble click para cambiar el torneo base.</small>
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
            <input
              value={matchForm.venue}
              onChange={(event) => onChangeMatchForm("venue", event.target.value)}
              placeholder="Club Atenas"
            />
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
            <p className="juez-section-copy">Cada tarjeta resume el cruce, el estado y el horario.</p>
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
      </article>

      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">Roles</p>
            <h2>Jueces registrados</h2>
            <p className="juez-section-copy">Define rapido qué puede hacer cada juez antes de cerrar inscripciones.</p>
          </div>
        </div>

        <div className="juez-referee-admin-list">
          {referees.map((referee) => (
            <article key={referee.id} className="juez-referee-admin-card">
              <div className="juez-referee-admin-card__head">
                <div className="juez-referee-identity">
                  <span className="juez-avatar">{getInitials(referee.name)}</span>
                  <div>
                    <strong>{referee.name}</strong>
                    <p>{referee.city}</p>
                  </div>
                </div>
                <div className="juez-referee-admin-card__meta">
                  <span>{referee.roles.length} roles activos</span>
                </div>
              </div>

              <div className="juez-role-toggle-row">
                {(["principal", "secundario", "planillero"] as RefereeRole[]).map((role) => {
                  const isChecked = referee.roles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      className={`juez-role-toggle ${isChecked ? "is-checked" : ""}`}
                      onClick={() => onToggleRefereeRole(referee.id, role)}
                    >
                      <span className="juez-role-toggle__dot" />
                      {ROLE_LABELS[role]}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </article>

      {selectedMatch ? (
        <article className="juez-panel juez-panel--span-2">
          <div className="juez-panel__heading juez-panel__heading--stack-mobile">
            <div>
              <p className="juez-eyebrow">Designacion</p>
              <h2>{formatMatchLabel(selectedMatch)}</h2>
              <p className="juez-section-copy">El sistema propone una terna en base a disponibilidad real y roles compatibles.</p>
            </div>
            <div className="juez-inline-actions">
              {selectedMatch.status === "open" ? (
                <button type="button" className="juez-button" onClick={() => onCloseRegistration(selectedMatch.id)}>
                  Cerrar inscripcion
                </button>
              ) : null}
              {selectedMatch.status !== "open" ? (
                <button type="button" className="juez-button juez-button--ghost" onClick={() => onReopenRegistration(selectedMatch.id)}>
                  Reabrir
                </button>
              ) : null}
            </div>
          </div>

          <div className="juez-selected-match-meta">
            <span>{selectedMatch.tournament}</span>
            <span>{selectedMatch.venue}</span>
            <span>{formatMatchDate(selectedMatch.date, selectedMatch.time)}</span>
            <span>{selectedAvailability.length} arbitros confirmados</span>
          </div>

          <div className="juez-designation-callout">
            <strong>Funcion del sistema</strong>
            <p>El arbitro solo confirma si puede ir al partido. El sistema propone automaticamente quien va arriba, abajo y planilla segun los roles habilitados. El admin puede aceptar o editar.</p>
          </div>

          <div className="juez-designation-grid">
            {(["principal", "secundario", "planillero"] as RefereeRole[]).map((role) => {
              const compatibleReferees = getCompatibleReferees(role, selectedMatch.id, referees, availability);

              return (
                <section key={role} className="juez-role-card">
                  <div className="juez-role-card__header">
                    <h3>{ROLE_LABELS[role]}</h3>
                    <span>{compatibleReferees.length} compatibles</span>
                  </div>

                  <select
                    value={designationDraft[role]}
                    onChange={(event) => onDesignationChange(role, event.target.value)}
                    disabled={selectedMatch.status === "open"}
                  >
                    <option value="">Seleccionar</option>
                    {compatibleReferees.map((referee) => (
                      <option key={referee.id} value={referee.id}>
                        {referee.name}
                      </option>
                    ))}
                  </select>

                  <div className="juez-mini-list">
                    {compatibleReferees.map((referee) => (
                      <div key={referee.id} className="juez-mini-list__item">
                        <div className="juez-mini-list__identity">
                          <span className="juez-avatar juez-avatar--small">{getInitials(referee.name)}</span>
                          <strong>{referee.name}</strong>
                        </div>
                        <span>{referee.roles.map((item) => ROLE_LABELS[item]).join(" - ")}</span>
                      </div>
                    ))}
                    {!compatibleReferees.length ? <p className="juez-empty-inline">Sin arbitros compatibles todavia.</p> : null}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="juez-confirm-bar">
            <div>
              <strong>Sugerencia automatica:</strong> el sistema intenta armar la terna con los disponibles y roles compatibles.
            </div>
            <div className="juez-inline-actions">
              <button type="button" className="juez-button" onClick={onUseSuggestedDesignation} disabled={selectedMatch.status === "open"}>
                Usar sugerencia del sistema
              </button>
              <button type="button" className="juez-button juez-button--primary" onClick={onConfirmDesignation} disabled={selectedMatch.status === "open"}>
                Aceptar designacion
              </button>
            </div>
          </div>

          {selectedAssignment ? (
            <div className="juez-assignment-summary">
              <strong>Designacion confirmada:</strong>
              <ul>
                <li>Principal: {referees.find((item) => item.id === selectedAssignment.principalRefereeId)?.name ?? "-"}</li>
                <li>Secundario: {referees.find((item) => item.id === selectedAssignment.secondaryRefereeId)?.name ?? "-"}</li>
                <li>Planillero: {referees.find((item) => item.id === selectedAssignment.scorerRefereeId)?.name ?? "-"}</li>
              </ul>
            </div>
          ) : null}
        </article>
      ) : null}

      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">Historial</p>
            <h2>Designaciones oficiales</h2>
          </div>
        </div>

        <div className="juez-history-list">
          {assignments.map((assignment) => {
            const match = matches.find((item) => item.id === assignment.matchId);
            if (!match) return null;

            return (
              <article key={assignment.matchId} className="juez-history-card">
                <div>
                  <strong>{formatMatchLabel(match)}</strong>
                  <p>{match.venue} · {formatMatchDate(match.date, match.time)}</p>
                </div>
                <div className="juez-history-card__roles">
                  <span>P: {referees.find((item) => item.id === assignment.principalRefereeId)?.name}</span>
                  <span>S: {referees.find((item) => item.id === assignment.secondaryRefereeId)?.name}</span>
                  <span>Pl: {referees.find((item) => item.id === assignment.scorerRefereeId)?.name}</span>
                </div>
              </article>
            );
          })}
        </div>
      </article>
    </section>
  );
}
