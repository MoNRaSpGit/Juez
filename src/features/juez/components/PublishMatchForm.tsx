import { MatchFormState } from "../juez.types";

const CLUB_OPTIONS = ["Club Estudiante", "Club Cerrito", "Polideportivo"] as const;

type PublishMatchFormProps = {
  matchForm: MatchFormState;
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
  currentTournament,
  isEditingTournament,
  tournamentDraft,
  onChangeMatchForm,
  onCreateMatch,
  onStartTournamentEdit,
  onTournamentDraftChange,
  onSaveTournament
}: PublishMatchFormProps) {
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

      <div className="juez-form-grid juez-form-grid--mobile-first">
        <label className="juez-field juez-field--full-mobile">
          <span>Cuadro A</span>
          <input
            value={matchForm.homeSide}
            onChange={(event) => onChangeMatchForm("homeSide", event.target.value)}
            placeholder="Atenas"
          />
        </label>
        <label className="juez-field juez-field--full-mobile">
          <span>Cuadro B</span>
          <input
            value={matchForm.awaySide}
            onChange={(event) => onChangeMatchForm("awaySide", event.target.value)}
            placeholder="Trouville"
          />
        </label>
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
