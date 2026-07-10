import { MatchFormState, Match, Referee, AvailabilityEntry, Assignment, RefereeRole, ROLE_LABELS } from "../juez.types";
import {
  formatMatchDate,
  formatMatchLabel,
  getCompatibleReferees,
  getStatusLabel,
  getStatusTone
} from "../juez.utils";

type JuezAdminViewProps = {
  matches: Match[];
  referees: Referee[];
  availability: AvailabilityEntry[];
  assignments: Assignment[];
  selectedMatchId: string;
  matchForm: MatchFormState;
  designationDraft: Record<RefereeRole, string>;
  onSelectMatch: (matchId: string) => void;
  onChangeMatchForm: (field: keyof MatchFormState, value: string) => void;
  onCreateMatch: () => void;
  onCloseRegistration: (matchId: string) => void;
  onReopenRegistration: (matchId: string) => void;
  onDesignationChange: (role: RefereeRole, refereeId: string) => void;
  onConfirmDesignation: () => void;
};

export function JuezAdminView({
  matches,
  referees,
  availability,
  assignments,
  selectedMatchId,
  matchForm,
  designationDraft,
  onSelectMatch,
  onChangeMatchForm,
  onCreateMatch,
  onCloseRegistration,
  onReopenRegistration,
  onDesignationChange,
  onConfirmDesignation
}: JuezAdminViewProps) {
  const selectedMatch = matches.find((match) => match.id === selectedMatchId) ?? matches[0] ?? null;
  const selectedAssignment = assignments.find((assignment) => assignment.matchId === selectedMatch?.id);

  return (
    <section className="juez-layout-grid">
      <article className="juez-panel">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">Administrador</p>
            <h2>Publicar partidos</h2>
          </div>
        </div>

        <div className="juez-form-grid">
          <label className="juez-field">
            <span>Torneo</span>
            <input value={matchForm.tournament} onChange={(event) => onChangeMatchForm("tournament", event.target.value)} />
          </label>
          <label className="juez-field">
            <span>Local</span>
            <input value={matchForm.homeTeam} onChange={(event) => onChangeMatchForm("homeTeam", event.target.value)} />
          </label>
          <label className="juez-field">
            <span>Visitante</span>
            <input value={matchForm.awayTeam} onChange={(event) => onChangeMatchForm("awayTeam", event.target.value)} />
          </label>
          <label className="juez-field">
            <span>Fecha</span>
            <input type="date" value={matchForm.date} onChange={(event) => onChangeMatchForm("date", event.target.value)} />
          </label>
          <label className="juez-field">
            <span>Hora</span>
            <input type="time" value={matchForm.time} onChange={(event) => onChangeMatchForm("time", event.target.value)} />
          </label>
          <label className="juez-field">
            <span>Cancha</span>
            <input value={matchForm.court} onChange={(event) => onChangeMatchForm("court", event.target.value)} />
          </label>
          <label className="juez-field juez-field--full">
            <span>Dato relevante</span>
            <textarea value={matchForm.notes} onChange={(event) => onChangeMatchForm("notes", event.target.value)} rows={3} />
          </label>
        </div>

        <button type="button" className="juez-button juez-button--primary" onClick={onCreateMatch}>
          Publicar jornada
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
                <span>{formatMatchDate(match.date, match.time)}</span>
                <span>{match.court}</span>
              </div>
            </button>
          ))}
        </div>
      </article>

      {selectedMatch ? (
        <article className="juez-panel juez-panel--span-2">
          <div className="juez-panel__heading">
            <div>
              <p className="juez-eyebrow">Designacion</p>
              <h2>{formatMatchLabel(selectedMatch)}</h2>
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
            <span>{formatMatchDate(selectedMatch.date, selectedMatch.time)}</span>
            <span>{selectedMatch.court}</span>
            <span>{selectedMatch.notes || "Sin observaciones"}</span>
          </div>

          <div className="juez-designation-grid">
            {(["principal", "secundario", "planillero"] as RefereeRole[]).map((role) => {
              const compatibleReferees = getCompatibleReferees(role, selectedMatch.id, referees, availability);

              return (
                <section key={role} className="juez-role-card">
                  <div className="juez-role-card__header">
                    <h3>{ROLE_LABELS[role]}</h3>
                    <span>{compatibleReferees.length} disponibles</span>
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
                        <strong>{referee.name}</strong>
                        <span>{referee.city}</span>
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
              <strong>Regla visual activa:</strong> solo aparecen arbitros compatibles con cada rol.
            </div>
            <button
              type="button"
              className="juez-button juez-button--primary"
              onClick={onConfirmDesignation}
              disabled={selectedMatch.status === "open"}
            >
              Confirmar designacion oficial
            </button>
          </div>

          {selectedAssignment ? (
            <div className="juez-assignment-summary">
              <strong>Designacion confirmada:</strong>
              <ul>
                <li>
                  Principal: {referees.find((item) => item.id === selectedAssignment.principalRefereeId)?.name ?? "-"}
                </li>
                <li>
                  Secundario: {referees.find((item) => item.id === selectedAssignment.secondaryRefereeId)?.name ?? "-"}
                </li>
                <li>
                  Planillero: {referees.find((item) => item.id === selectedAssignment.scorerRefereeId)?.name ?? "-"}
                </li>
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
                  <p>{formatMatchDate(match.date, match.time)} · {match.court}</p>
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
