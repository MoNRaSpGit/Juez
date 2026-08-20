import { useState } from "react";
import { MatchFormState } from "../juez.types";
import { JuezPlayerDivision, JuezPlayerSex } from "../juez.players.types";
import { JuezTeam } from "../juez.teams.types";

const CLUB_OPTIONS = ["Club Estudiante", "Club Cerrito", "Polideportivo"] as const;

type MatchCategory = { division: JuezPlayerDivision; sex: JuezPlayerSex };

const CATEGORY_OPTIONS: MatchCategory[] = [
  { division: "A", sex: "masculino" },
  { division: "B", sex: "masculino" },
  { division: "A", sex: "femenino" },
  { division: "B", sex: "femenino" }
];

function formatCategoryLabel(category: MatchCategory) {
  return `${category.sex === "masculino" ? "Masculino" : "Femenino"} ${category.division}`;
}

function isSameCategory(left: MatchCategory | null, right: MatchCategory) {
  return left?.division === right.division && left?.sex === right.sex;
}

type PublishMatchFormProps = {
  matchForm: MatchFormState;
  teams: JuezTeam[];
  currentTournament: string;
  isEditingTournament: boolean;
  tournamentDraft: string;
  onChangeMatchForm: (field: keyof MatchFormState, value: string) => void;
  onCreateMatch: () => void;
  onStartTournamentEdit: () => void;
  onTournamentDraftChange: (value: string) => void;
  onSaveTournament: () => void;
};

export function PublishMatchForm({
  matchForm,
  teams,
  currentTournament,
  isEditingTournament,
  tournamentDraft,
  onChangeMatchForm,
  onCreateMatch,
  onStartTournamentEdit,
  onTournamentDraftChange,
  onSaveTournament
}: PublishMatchFormProps) {
  const [category, setCategory] = useState<MatchCategory | null>(null);

  const categoryTeams = category
    ? teams
        .filter((team) => team.division === category.division && team.sex === category.sex)
        .sort((left, right) => left.name.localeCompare(right.name))
    : [];

  return (
    <article className="juez-panel juez-panel--span-2">
      <div className="juez-panel__heading juez-panel__heading--stack-mobile">
        <div>
          <p className="juez-eyebrow">Partidos</p>
          <h2>Publicar partidos</h2>
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
        </div>
      </div>

      <div className="juez-field juez-field--full-mobile">
        <span>Categoria</span>
        <div className="juez-role-toggle-row">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={`${option.division}-${option.sex}`}
              type="button"
              className={`juez-role-toggle ${isSameCategory(category, option) ? "is-checked" : ""}`}
              onClick={() => setCategory(option)}
            >
              <span className="juez-role-toggle__dot" />
              {formatCategoryLabel(option)}
            </button>
          ))}
        </div>
      </div>

      <div className="juez-form-grid juez-form-grid--mobile-first">
        <div className="juez-field juez-field--full-mobile">
          <span>Partido</span>
          <div className="juez-vs-field">
            <select
              value={matchForm.homeSide}
              onChange={(event) => onChangeMatchForm("homeSide", event.target.value)}
              disabled={!category}
              aria-label="Equipo local"
            >
              <option value="">{category ? "Local" : "Elegi categoria"}</option>
              {categoryTeams.map((team) => (
                <option key={team.id} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>
            <span className="juez-vs-field__vs">Vs</span>
            <select
              value={matchForm.awaySide}
              onChange={(event) => onChangeMatchForm("awaySide", event.target.value)}
              disabled={!category}
              aria-label="Equipo visitante"
            >
              <option value="">{category ? "Visitante" : "Elegi categoria"}</option>
              {categoryTeams.map((team) => (
                <option key={team.id} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="juez-field juez-field--full-mobile">
          <span>Lugar / Club</span>
          <select value={matchForm.venue} onChange={(event) => onChangeMatchForm("venue", event.target.value)}>
            <option value="">Seleccionar</option>
            {CLUB_OPTIONS.map((club) => (
              <option key={club} value={club}>
                {club}
              </option>
            ))}
          </select>
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
  );
}
