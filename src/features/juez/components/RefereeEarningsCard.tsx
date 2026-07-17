import { useState } from "react";
import { Match, ROLE_LABELS } from "../juez.types";
import { formatCurrency, formatMatchLabel, RefereeEarningsSummary } from "../juez.utils";

type RefereeEarningsCardProps = {
  summary: RefereeEarningsSummary;
  matches: Match[];
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function RefereeEarningsCard({ summary, matches }: RefereeEarningsCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <article className="juez-referee-admin-card">
      <div className="juez-referee-admin-card__head">
        <div className="juez-referee-identity">
          <span className="juez-avatar">{getInitials(summary.name)}</span>
          <div>
            <strong>{summary.name}</strong>
            <p>
              {summary.lineItems.length} partido{summary.lineItems.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="juez-referee-admin-card__meta">
          <span>Total a cobrar: {formatCurrency(summary.totalEarnings)}</span>
        </div>
      </div>

      <button type="button" className="juez-button juez-button--ghost" onClick={() => setShowDetails((current) => !current)}>
        {showDetails ? "Ocultar detalles" : "Detalles"}
      </button>

      {showDetails ? (
        <div className="juez-designation-result__grid">
          {summary.lineItems.map((item, index) => {
            const match = matches.find((candidate) => candidate.id === item.matchId);
            return (
              <div key={`${item.matchId}-${item.role}-${index}`} className="juez-designation-result__row">
                <span>
                  {match ? formatMatchLabel(match) : "Partido"} · {ROLE_LABELS[item.role]}
                </span>
                <strong>{formatCurrency(item.amount)}</strong>
              </div>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}
