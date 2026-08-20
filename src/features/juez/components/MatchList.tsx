import { Match } from "../juez.types";
import { formatMatchDate, formatMatchLabel, getStatusLabel, getStatusTone } from "../juez.utils";

type MatchListProps = {
  matches: Match[];
  selectedMatchId: string;
  onSelectMatch: (matchId: string) => void;
};

export function MatchList({ matches, selectedMatchId, onSelectMatch }: MatchListProps) {
  return (
    <article className="juez-panel juez-panel--span-2">
      <div className="juez-panel__heading">
        <div>
          <p className="juez-eyebrow">Jornada</p>
          <h2>Partidos publicados</h2>
          <p className="juez-empty-inline">Tocá &quot;Ver&quot; en un partido para ver o designar sus jueces.</p>
        </div>
      </div>

      <div className="juez-match-list">
        {matches.map((match) => (
          <div key={match.id} className={`juez-match-card ${selectedMatchId === match.id ? "is-active" : ""}`}>
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
            <div className="juez-match-card__footer">
              <button type="button" className="juez-button juez-button--ghost" onClick={() => onSelectMatch(match.id)}>
                Ver
              </button>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
