import { JuezPlayerDivision, JuezPlayerFormState, JuezPlayerSex, JuezPlayer } from "../juez.players.types";

type JuezPlayersViewProps = {
  filteredPlayers: JuezPlayer[];
  isLoading: boolean;
  team: string;
  setTeam: (value: string) => void;
  division: JuezPlayerDivision;
  setDivision: (value: JuezPlayerDivision) => void;
  sex: JuezPlayerSex;
  setSex: (value: JuezPlayerSex) => void;
  playerForm: JuezPlayerFormState;
  onChangePlayerForm: (field: keyof JuezPlayerFormState, value: string) => void;
  onCreatePlayer: () => void;
};

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat("es-UY", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export function JuezPlayersView({
  filteredPlayers,
  isLoading,
  team,
  setTeam,
  division,
  setDivision,
  sex,
  setSex,
  playerForm,
  onChangePlayerForm,
  onCreatePlayer
}: JuezPlayersViewProps) {
  return (
    <section className="juez-layout-grid">
      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">Categoria</p>
            <h2>Elegi equipo, division y sexo</h2>
            <p className="juez-empty-inline">Los jugadores que agregues y la lista de abajo van a usar esta categoria.</p>
          </div>
        </div>

        <div className="juez-form-grid juez-form-grid--mobile-first">
          <label className="juez-field juez-field--full-mobile">
            <span>Equipo</span>
            <input value={team} onChange={(event) => setTeam(event.target.value)} placeholder="Penarol" />
          </label>
          <label className="juez-field">
            <span>Division</span>
            <select value={division} onChange={(event) => setDivision(event.target.value as JuezPlayerDivision)}>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </label>
          <label className="juez-field">
            <span>Sexo</span>
            <select value={sex} onChange={(event) => setSex(event.target.value as JuezPlayerSex)}>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </label>
        </div>
      </article>

      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">Alta</p>
            <h2>Agregar jugador</h2>
          </div>
        </div>

        <div className="juez-form-grid juez-form-grid--mobile-first">
          <label className="juez-field juez-field--full-mobile">
            <span>Nombre</span>
            <input value={playerForm.name} onChange={(event) => onChangePlayerForm("name", event.target.value)} placeholder="Ana Gonzalez" />
          </label>
          <label className="juez-field">
            <span>Vencimiento</span>
            <input type="date" value={playerForm.expiryDate} onChange={(event) => onChangePlayerForm("expiryDate", event.target.value)} />
          </label>
          <label className="juez-field">
            <span>Cedula (opcional)</span>
            <input value={playerForm.cedula} onChange={(event) => onChangePlayerForm("cedula", event.target.value)} placeholder="1234567-8" />
          </label>
          <label className="juez-field">
            <span>Nacimiento (opcional)</span>
            <input type="date" value={playerForm.birthDate} onChange={(event) => onChangePlayerForm("birthDate", event.target.value)} />
          </label>
        </div>

        <button type="button" className="juez-button juez-button--primary juez-button--full-mobile" onClick={onCreatePlayer}>
          Agregar jugador
        </button>
      </article>

      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">
              {team || "Equipo"} {division} - {sex === "masculino" ? "Masculino" : "Femenino"}
            </p>
            <h2>Jugadores cargados</h2>
          </div>
        </div>

        {isLoading ? <p className="juez-empty-inline">Cargando jugadores...</p> : null}

        {!isLoading && !filteredPlayers.length ? (
          <p className="juez-empty-inline">Todavia no hay jugadores en esta categoria.</p>
        ) : null}

        <div className="juez-match-list">
          {filteredPlayers.map((player) => (
            <div key={player.id} className="juez-match-card">
              <div className="juez-match-card__main">
                <div>
                  <strong>{player.name}</strong>
                  <p>Vence: {formatDateOnly(player.expiryDate)}</p>
                </div>
              </div>
              {player.cedula || player.birthDate ? (
                <div className="juez-match-card__meta">
                  {player.cedula ? <span>CI: {player.cedula}</span> : null}
                  {player.birthDate ? <span>Nace: {formatDateOnly(player.birthDate)}</span> : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
