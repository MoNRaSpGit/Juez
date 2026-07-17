import { useEffect, useState } from "react";
import { Assignment, AvailabilityEntry, Match, Referee, RefereeRole, ROLE_LABELS } from "../juez.types";
import { formatCurrency, formatMatchDate, formatMatchLabel, getCompatibleReferees, getRefereeEarnings } from "../juez.utils";

type DesignationModalProps = {
  match: Match;
  referees: Referee[];
  availability: AvailabilityEntry[];
  assignments: Assignment[];
  designationDraft: Record<RefereeRole, string>;
  onDesignationChange: (role: RefereeRole, refereeId: string) => void;
  onConfirmDesignation: () => void;
  onClose: () => void;
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

export function DesignationModal({
  match,
  referees,
  availability,
  assignments,
  designationDraft,
  onDesignationChange,
  onConfirmDesignation,
  onClose
}: DesignationModalProps) {
  const selectedAssignment = assignments.find((assignment) => assignment.matchId === match.id);
  const selectedAvailability = availability.filter((entry) => entry.matchId === match.id);
  const selectedRefereeIds = Object.values(designationDraft).filter(Boolean);

  const [isRedesignating, setIsRedesignating] = useState(false);

  useEffect(() => {
    setIsRedesignating(false);
  }, [match.id]);

  const showPicker = !selectedAssignment || isRedesignating;

  return (
    <div className="juez-modal" role="presentation" onClick={onClose}>
      <div className="juez-modal__backdrop" />
      <article
        className="juez-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Designar jueces para ${formatMatchLabel(match)}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="juez-modal__header">
          <div>
            <p className="juez-eyebrow">Designacion</p>
            <h2>{formatMatchLabel(match)}</h2>
            <p className="juez-modal__meta">
              {match.tournament} · {match.venue} · {formatMatchDate(match.date, match.time)}
            </p>
          </div>
          <button type="button" className="juez-modal__close" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div className="juez-modal__summary">
          <span>{selectedAvailability.length} arbitros confirmados</span>
          {selectedAssignment ? <span>Ya asignado</span> : null}
        </div>

        {!showPicker && selectedAssignment ? (
          <>
            <div className="juez-designation-result__grid">
              <div className="juez-designation-result__row">
                <span>Juez arriba</span>
                <strong>{getRefereeName(referees, selectedAssignment.principalRefereeId)}</strong>
              </div>
              <div className="juez-designation-result__row">
                <span>Juez abajo</span>
                <strong>{getRefereeName(referees, selectedAssignment.secondaryRefereeId)}</strong>
              </div>
              <div className="juez-designation-result__row">
                <span>Planillero</span>
                <strong>{getRefereeName(referees, selectedAssignment.scorerRefereeId)}</strong>
              </div>
            </div>

            <div className="juez-modal__footer">
              <button type="button" className="juez-button juez-button--primary" onClick={() => setIsRedesignating(true)}>
                Redesignar jueces
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="juez-modal__grid">
              {(["principal", "secundario", "planillero"] as RefereeRole[]).map((role) => {
                const compatibleReferees = getCompatibleReferees(role, match.id, referees, availability).filter(
                  (referee) => referee.id === designationDraft[role] || !selectedRefereeIds.includes(referee.id)
                );

                return (
                  <section key={role} className="juez-modal__role">
                    <div className="juez-role-card__header">
                      <h3>{ROLE_LABELS[role]}</h3>
                      <span>{compatibleReferees.length}</span>
                    </div>

                    <div className="juez-judge-pick-list">
                      {compatibleReferees.map((referee) => {
                        const earnings = getRefereeEarnings(referee.id, assignments);
                        return (
                          <button
                            key={referee.id}
                            type="button"
                            className={`juez-judge-pick ${designationDraft[role] === referee.id ? "is-selected" : ""}`}
                            onClick={() => onDesignationChange(role, referee.id)}
                          >
                            <span className="juez-avatar juez-avatar--small">{getInitials(referee.name)}</span>
                            <span className="juez-judge-pick__name">{referee.name}</span>
                            {earnings > 0 ? <span className="juez-judge-pick__badge">+{formatCurrency(earnings)}</span> : null}
                          </button>
                        );
                      })}
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
          </>
        )}
      </article>
    </div>
  );
}
