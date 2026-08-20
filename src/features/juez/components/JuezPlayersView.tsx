import { ChangeEvent } from "react";
import { compressImageFile } from "../juez.image";
import { buildJuezPlayerPhotoUrl } from "../juez.players.client";
import { JuezPlayerDivision, JuezPlayerFormState, JuezPlayerSex, JuezPlayer } from "../juez.players.types";
import { JuezTeam, JuezTeamFormState } from "../juez.teams.types";

type JuezPlayersViewProps = {
  filteredPlayers: JuezPlayer[];
  isLoading: boolean;

  teams: JuezTeam[];
  isTeamsLoading: boolean;
  teamForm: JuezTeamFormState;
  onChangeTeamForm: (field: keyof JuezTeamFormState, value: string) => void;
  onCreateTeam: () => void;
  selectedTeamId: number | null;
  onSelectTeam: (teamId: number | null) => void;
  selectedTeam: JuezTeam | null;

  playerForm: JuezPlayerFormState;
  onChangePlayerForm: (field: keyof JuezPlayerFormState, value: string) => void;
  onCreatePlayer: () => void;
};

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat("es-UY", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function getInitials(name: string, lastName: string) {
  return `${name[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

function formatTeamLabel(team: JuezTeam) {
  return `${team.name} - ${team.division} - ${team.sex === "masculino" ? "Masculino" : "Femenino"}`;
}

export function JuezPlayersView({
  filteredPlayers,
  isLoading,
  teams,
  isTeamsLoading,
  teamForm,
  onChangeTeamForm,
  onCreateTeam,
  selectedTeamId,
  onSelectTeam,
  selectedTeam,
  playerForm,
  onChangePlayerForm,
  onCreatePlayer
}: JuezPlayersViewProps) {
  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      onChangePlayerForm("photoDataUrl", "");
      return;
    }

    try {
      const compressed = await compressImageFile(file);
      onChangePlayerForm("photoDataUrl", compressed);
    } catch {
      onChangePlayerForm("photoDataUrl", "");
    }
  }

  return (
    <section className="juez-layout-grid">
      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">Paso 1</p>
            <h2>Crear equipo</h2>
            <p className="juez-empty-inline">Nombre, division y sexo del equipo.</p>
          </div>
        </div>

        <div className="juez-form-grid juez-form-grid--mobile-first">
          <label className="juez-field juez-field--full-mobile">
            <span>Nombre</span>
            <input value={teamForm.name} onChange={(event) => onChangeTeamForm("name", event.target.value)} placeholder="Penarol" />
          </label>
          <label className="juez-field">
            <span>Division</span>
            <select value={teamForm.division} onChange={(event) => onChangeTeamForm("division", event.target.value as JuezPlayerDivision)}>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </label>
          <label className="juez-field">
            <span>Sexo</span>
            <select value={teamForm.sex} onChange={(event) => onChangeTeamForm("sex", event.target.value as JuezPlayerSex)}>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </label>
        </div>

        <button type="button" className="juez-button juez-button--primary juez-button--full-mobile" onClick={onCreateTeam}>
          Crear equipo
        </button>
      </article>

      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">Paso 2</p>
            <h2>Elegi el equipo</h2>
            <p className="juez-empty-inline">Los jugadores que agregues abajo van a quedar dentro de este equipo.</p>
          </div>
        </div>

        {isTeamsLoading ? <p className="juez-empty-inline">Cargando equipos...</p> : null}

        {!isTeamsLoading && !teams.length ? (
          <p className="juez-empty-inline">Todavia no creaste ningun equipo. Crea uno arriba para poder agregar jugadores.</p>
        ) : null}

        {!isTeamsLoading && teams.length ? (
          <label className="juez-field juez-field--full-mobile">
            <span>Equipo</span>
            <select
              value={selectedTeamId ?? ""}
              onChange={(event) => onSelectTeam(event.target.value ? Number(event.target.value) : null)}
            >
              <option value="">Selecciona un equipo</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {formatTeamLabel(team)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </article>

      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">Paso 3</p>
            <h2>Agregar jugador</h2>
            {!selectedTeam ? <p className="juez-empty-inline">Elegi un equipo arriba para poder cargar jugadores.</p> : null}
          </div>
        </div>

        {selectedTeam ? (
          <>
            <div className="juez-form-grid juez-form-grid--mobile-first">
              <label className="juez-field">
                <span>Nombre</span>
                <input value={playerForm.name} onChange={(event) => onChangePlayerForm("name", event.target.value)} placeholder="Ana" />
              </label>
              <label className="juez-field">
                <span>Apellido</span>
                <input
                  value={playerForm.lastName}
                  onChange={(event) => onChangePlayerForm("lastName", event.target.value)}
                  placeholder="Gonzalez"
                />
              </label>
              <label className="juez-field">
                <span>Vencimiento</span>
                <input
                  type="date"
                  value={playerForm.expiryDate}
                  onChange={(event) => onChangePlayerForm("expiryDate", event.target.value)}
                />
              </label>
              <label className="juez-field">
                <span>Telefono (opcional)</span>
                <input
                  value={playerForm.phone}
                  onChange={(event) => onChangePlayerForm("phone", event.target.value)}
                  placeholder="099123456"
                />
              </label>
              <label className="juez-field">
                <span>Cedula (opcional)</span>
                <input
                  value={playerForm.cedula}
                  onChange={(event) => onChangePlayerForm("cedula", event.target.value)}
                  placeholder="1234567-8"
                />
              </label>
              <label className="juez-field">
                <span>Nacimiento (opcional)</span>
                <input
                  type="date"
                  value={playerForm.birthDate}
                  onChange={(event) => onChangePlayerForm("birthDate", event.target.value)}
                />
              </label>
              <label className="juez-field juez-field--full-mobile">
                <span>Foto (opcional)</span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} />
              </label>
            </div>

            <button type="button" className="juez-button juez-button--primary juez-button--full-mobile" onClick={onCreatePlayer}>
              Agregar jugador
            </button>
          </>
        ) : null}
      </article>

      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">{selectedTeam ? formatTeamLabel(selectedTeam) : "Equipo"}</p>
            <h2>Jugadores cargados</h2>
          </div>
        </div>

        {!selectedTeam ? <p className="juez-empty-inline">Elegi un equipo para ver sus jugadores.</p> : null}

        {selectedTeam && isLoading ? <p className="juez-empty-inline">Cargando jugadores...</p> : null}

        {selectedTeam && !isLoading && !filteredPlayers.length ? (
          <p className="juez-empty-inline">Todavia no hay jugadores en este equipo.</p>
        ) : null}

        {selectedTeam ? (
          <div className="juez-match-list">
            {filteredPlayers.map((player) => (
              <div key={player.id} className="juez-match-card">
                <div className="juez-match-card__main">
                  <div className="juez-player-row">
                    <span className="juez-avatar juez-avatar--small">
                      {player.hasPhoto ? <img src={buildJuezPlayerPhotoUrl(player.id)} alt="" /> : getInitials(player.name, player.lastName)}
                    </span>
                    <div>
                      <strong>
                        {player.name} {player.lastName}
                      </strong>
                      <p>Vence: {formatDateOnly(player.expiryDate)}</p>
                    </div>
                  </div>
                </div>
                {player.cedula || player.phone || player.birthDate ? (
                  <div className="juez-match-card__meta">
                    {player.cedula ? <span>CI: {player.cedula}</span> : null}
                    {player.phone ? <span>Tel: {player.phone}</span> : null}
                    {player.birthDate ? <span>Nace: {formatDateOnly(player.birthDate)}</span> : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}
