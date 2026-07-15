import { AvailabilityEntry, Assignment, Match, Referee, ROLE_LABELS } from "../juez.types";
import { formatMatchDate, formatMatchLabel, getAssignedMatchesForReferee, getAssignedRoleLabel, getAvailabilityForReferee } from "../juez.utils";

type JuezRefereeViewProps = {
  currentReferee: Referee;
  matches: Match[];
  availability: AvailabilityEntry[];
  assignments: Assignment[];
  onToggleAvailability: (matchId: string) => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function JuezRefereeView({
  currentReferee,
  matches,
  availability,
  assignments,
  onToggleAvailability
}: JuezRefereeViewProps) {
  const openMatches = matches.filter((match) => match.status === "open");
  const assignedMatches = getAssignedMatchesForReferee(currentReferee.id, matches, assignments);

  return (
    <section className="juez-layout-grid">
      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading juez-panel__heading--stack-mobile">
          <div>
            <p className="juez-eyebrow">Arbitros</p>
            <h2>Mi perfil</h2>
          </div>
        </div>

        <div className="juez-referee-toolbar juez-referee-toolbar--stack-mobile">
          <div className="juez-role-strip">
            <span className="juez-avatar juez-avatar--profile">{getInitials(currentReferee.name)}</span>
            <div className="juez-referee-profile">
              <strong>{currentReferee.name}</strong>
              <span>{currentReferee.city}</span>
            </div>
            {currentReferee.roles.map((role) => (
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
            <h2>Disponibles</h2>
          </div>
        </div>

        <div className="juez-referee-match-list">
          {openMatches.map((match) => {
            const currentAvailability = getAvailabilityForReferee(currentReferee.id, match.id, availability);
            return (
              <article key={match.id} className="juez-referee-match-card">
                <div className="juez-referee-match-card__head">
                  <div>
                    <strong>{formatMatchLabel(match)}</strong>
                    <p>{match.tournament} · {match.venue}</p>
                  </div>
                  <div className="juez-referee-match-card__meta">
                    <span>{formatMatchDate(match.date, match.time)}</span>
                  </div>
                </div>

                <div className="juez-referee-availability-bar">
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
            <h2>Asignados</h2>
          </div>
        </div>

        <div className="juez-history-list">
          {assignedMatches.map((match) => {
            const assignment = assignments.find((item) => item.matchId === match.id);
            const roleLabel = getAssignedRoleLabel(currentReferee.id, assignment);
            return (
              <article key={match.id} className="juez-history-card">
                <div>
                  <strong>{formatMatchLabel(match)}</strong>
                  <p>{match.venue} · {formatMatchDate(match.date, match.time)}</p>
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
