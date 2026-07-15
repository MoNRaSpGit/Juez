import { AvailabilityEntry, Match, Referee } from "../juez.types";
import { formatMatchLabel, getAvailabilityForReferee } from "../juez.utils";

type JuezRefereeViewProps = {
  currentReferee: Referee;
  matches: Match[];
  availability: AvailabilityEntry[];
  onToggleAvailability: (matchId: string) => void;
};

function getToneClass(index: number) {
  const tones = [
    "juez-referee-match-card--violet",
    "juez-referee-match-card--cyan",
    "juez-referee-match-card--amber",
    "juez-referee-match-card--rose"
  ];

  return tones[index % tones.length];
}

function formatMatchDay(date: string, time: string) {
  const normalized = new Date(`${date}T${time}:00`);
  return new Intl.DateTimeFormat("es-UY", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).format(normalized);
}

function formatMatchHour(date: string, time: string) {
  const normalized = new Date(`${date}T${time}:00`);
  return new Intl.DateTimeFormat("es-UY", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(normalized);
}

export function JuezRefereeView({ currentReferee, matches, availability, onToggleAvailability }: JuezRefereeViewProps) {
  const openMatches = matches.filter((match) => match.status === "open");

  return (
    <section className="juez-layout-grid">
      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">Partidos</p>
            <h2>Disponibles</h2>
          </div>
        </div>

        <div className="juez-referee-match-list">
          {openMatches.map((match, index) => {
            const currentAvailability = getAvailabilityForReferee(currentReferee.id, match.id, availability);
            return (
              <article key={match.id} className={`juez-referee-match-card ${getToneClass(index)}`}>
                <div className="juez-referee-match-card__head">
                  <div>
                    <p className="juez-referee-match-card__eyebrow">{match.tournament}</p>
                    <strong>{formatMatchLabel(match)}</strong>
                    <p>{match.venue}</p>
                  </div>
                  <div className="juez-referee-match-card__meta">
                    <span className="juez-referee-match-card__date">{formatMatchDay(match.date, match.time)}</span>
                    <span className="juez-referee-match-card__time">{formatMatchHour(match.date, match.time)}</span>
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
    </section>
  );
}
