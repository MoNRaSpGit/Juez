import { Referee, RefereeRole, ROLE_LABELS } from "../juez.types";

type JuezAdministrationViewProps = {
  referees: Referee[];
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

export function JuezAdministrationView({ referees, onToggleRefereeRole }: JuezAdministrationViewProps) {
  return (
    <section className="juez-layout-grid">
      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">Administracion</p>
            <h2>Roles</h2>
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
    </section>
  );
}
