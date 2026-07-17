import { Assignment, Match, Referee } from "../juez.types";
import { buildRefereeEarningsSummary } from "../juez.utils";
import { RefereeEarningsCard } from "./RefereeEarningsCard";

type RefereeEarningsPanelProps = {
  referees: Referee[];
  assignments: Assignment[];
  matches: Match[];
};

export function RefereeEarningsPanel({ referees, assignments, matches }: RefereeEarningsPanelProps) {
  const earningsSummary = buildRefereeEarningsSummary(referees, assignments);

  return (
    <article className="juez-panel juez-panel--span-2">
      <div className="juez-panel__heading">
        <div>
          <p className="juez-eyebrow">Resumen</p>
          <h2>Cuanto va cobrando cada juez</h2>
        </div>
      </div>

      <div className="juez-referee-admin-list">
        {earningsSummary.map((summary) => (
          <RefereeEarningsCard key={summary.refereeId} summary={summary} matches={matches} />
        ))}
        {!earningsSummary.length ? <p className="juez-empty-inline">Todavia no hay designaciones confirmadas.</p> : null}
      </div>
    </article>
  );
}
