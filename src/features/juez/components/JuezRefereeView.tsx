import { AvailabilityEntry, Assignment, Match, Referee, ROLE_LABELS } from "../juez.types";
import { formatMatchDate, formatMatchLabel, getAssignedMatchesForReferee, getAssignedRoleLabel, getAvailabilityForReferee } from "../juez.utils";

type JuezRefereeViewProps = {
  selectedRefereeId: string;
  referees: Referee[];
  matches: Match[];
  availability: AvailabilityEntry[];
  assignments: Assignment[];
  onSelectReferee: (refereeId: string) => void;
  onToggleAvailability: (matchId: string) => void;
};

export function JuezRefereeView({
  selectedRefereeId,
  referees,
  matches,
  availability,
  assignments,
  onSelectReferee,
  onToggleAvailability
}: JuezRefereeViewProps) {
  const selectedReferee = referees.find((referee) => referee.id === selectedRefereeId) ?? referees[0];
  const openMatches = matches.filter((match) => match.status === "open");
  const assignedMatches = getAssignedMatchesForReferee(selectedReferee.id, matches, assignments);

  return (
    <section className="juez-layout-grid">
      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading juez-panel__heading--stack-mobile">
          <div>
            <p className="juez-eyebrow">Arbitros</p>
            <h2>Confirmar disponibilidad</h2>
          </div>
        </div>

        <div className="juez-referee-toolbar juez-referee-toolbar--stack-mobile">
          <label className="juez-field juez-field--compact">
            <span>Perfil demo</span>
            <select value={selectedReferee.id} onChange={(event) => onSelectReferee(event.target.value)}>
              {referees.map((referee) => (
                <option key={referee.id} value={referee.id}>
                  {referee.name}
                </option>
              ))}
            </select>
          </label>

          <div className="juez-role-strip">
            {selectedReferee.roles.map((role) => (
              <span key={role} className="juez-role-chip">
                {ROLE_LABELS[role]}
              </span>
            ))}
          </div>
        </div>
      </article>

      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">Partidos</p>
            <h2>Yo puedo ir a...</h2>
          </div>
        </div>

        <div className="juez-referee-match-list">
          {openMatches.map((match) => {
            const currentAvailability = getAvailabilityForReferee(selectedReferee.id, match.id, availability);
            return (
              <article key={match.id} className="juez-referee-match-card">
                <div className="juez-referee-match-card__head">
                  <div>
                    <strong>{formatMatchLabel(match)}</strong>
                    <p>{match.tournament}</p>
                  </div>
                  <div className="juez-referee-match-card__meta">
                    <span>{formatMatchDate(match.date, match.time)}</span>
                  </div>
                </div>

                <div className="juez-referee-availability-bar">
                  <p>El sistema despues decide si vas arriba, abajo o planilla segun tus roles habilitados.</p>
                  <button
                    type="button"
                    className={`juez-button ${currentAvailability ? "juez-button--primary" : ""}`}
                    onClick={() => onToggleAvailability(match.id)}
                  >
                    {currentAvailability ? "Confirmado para este partido" : "Puedo ir a este partido"}
                  </button>
                </div>
              </article>
            );
          })}
          {!openMatches.length ? <p className="juez-empty-inline">No hay partidos con inscripcion abierta.</p> : null}
        </div>
      </article>

      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">Designaciones</p>
            <h2>Mis partidos asignados</h2>
          </div>
        </div>

        <div className="juez-history-list">
          {assignedMatches.map((match) => {
            const assignment = assignments.find((item) => item.matchId === match.id);
            const roleLabel = getAssignedRoleLabel(selectedReferee.id, assignment);
            return (
              <article key={match.id} className="juez-history-card">
                <div>
                  <strong>{formatMatchLabel(match)}</strong>
                  <p>{formatMatchDate(match.date, match.time)}</p>
                </div>
                <span className="juez-pill juez-pill--green">{roleLabel}</span>
              </article>
            );
          })}
          {!assignedMatches.length ? <p className="juez-empty-inline">Este arbitro todavia no tiene designaciones oficiales.</p> : null}
        </div>
      </article>
    </section>
  );
}
