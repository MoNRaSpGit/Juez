import { useState } from "react";
import { formatDaysUntilExpiry, getAge, getPlayerExpiryUrgency } from "../juez.utils";
import { buildJuezPlayerPhotoUrl } from "../juez.players.client";
import { JuezPlayer, JuezPlayerFormState } from "../juez.players.types";
import { JuezTeam } from "../juez.teams.types";
import { JuezPlayerEditModal } from "./JuezPlayerEditModal";

type JuezPlayersBrowseViewProps = {
  browsedPlayers: JuezPlayer[];
  isLoading: boolean;
  teams: JuezTeam[];
  browseTeamId: number | null;
  setBrowseTeamId: (teamId: number | null) => void;
  browseTeam: JuezTeam | null;
  editingPlayer: JuezPlayer | null;
  editForm: JuezPlayerFormState;
  onOpenEditPlayer: (player: JuezPlayer) => void;
  onCloseEditPlayer: () => void;
  onChangeEditForm: (field: keyof JuezPlayerFormState, value: string) => void;
  onSubmitEditPlayer: () => void;
};

function formatTeamLabel(team: JuezTeam) {
  return `${team.name} - ${team.division} - ${team.sex === "masculino" ? "Masculino" : "Femenino"}`;
}

const URGENCY_BADGE_LABEL: Record<string, string> = {
  expired: "Vencido",
  yellow: "Por vencer"
};

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat("es-UY", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function getInitials(name: string, lastName: string) {
  return `${name[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

function JuezPlayerCard({ player, onOpenEditPlayer }: { player: JuezPlayer; onOpenEditPlayer: (player: JuezPlayer) => void }) {
  const [showDetails, setShowDetails] = useState(false);
  const urgency = getPlayerExpiryUrgency(player.expiryDate);
  const badgeLabel = URGENCY_BADGE_LABEL[urgency];

  return (
    <article className={`juez-player-card juez-player-card--${urgency}`}>
      <div className="juez-player-card__top">
        <div className="juez-player-row">
          <span className="juez-avatar">
            {player.hasPhoto ? <img src={buildJuezPlayerPhotoUrl(player.id)} alt="" /> : getInitials(player.name, player.lastName)}
          </span>
          <strong className="juez-player-card__name">
            {player.name} {player.lastName}
          </strong>
        </div>
        {badgeLabel ? <span className={`juez-player-card__badge juez-player-card__badge--${urgency}`}>{badgeLabel}</span> : null}
      </div>

      <p className="juez-player-card__expiry">{formatDaysUntilExpiry(player.expiryDate)}</p>

      <div className="juez-player-card__actions">
        <button
          type="button"
          className={`juez-player-card__details-toggle ${showDetails ? "is-open" : ""}`}
          onClick={() => setShowDetails((current) => !current)}
        >
          {showDetails ? "Ocultar detalle" : "Detalle"}
          <span className="juez-player-card__details-chevron" aria-hidden="true">
            ⌄
          </span>
        </button>

        <button type="button" className="juez-player-card__edit" onClick={() => onOpenEditPlayer(player)}>
          Editar
        </button>
      </div>

      {showDetails ? (
        <dl className="juez-player-card__details">
          <div>
            <dt>Vencimiento</dt>
            <dd>{formatDateOnly(player.expiryDate)}</dd>
          </div>
          <div>
            <dt>Cedula</dt>
            <dd>{player.cedula || "Sin cargar"}</dd>
          </div>
          <div>
            <dt>Telefono</dt>
            <dd>{player.phone || "Sin cargar"}</dd>
          </div>
          <div>
            <dt>Nacimiento</dt>
            <dd>{player.birthDate ? `${formatDateOnly(player.birthDate)} (${getAge(player.birthDate)} anios)` : "Sin cargar"}</dd>
          </div>
        </dl>
      ) : null}
    </article>
  );
}

export function JuezPlayersBrowseView({
  browsedPlayers,
  isLoading,
  teams,
  browseTeamId,
  setBrowseTeamId,
  browseTeam,
  editingPlayer,
  editForm,
  onOpenEditPlayer,
  onCloseEditPlayer,
  onChangeEditForm,
  onSubmitEditPlayer
}: JuezPlayersBrowseViewProps) {
  return (
    <section className="juez-layout-grid">
      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">Filtro</p>
            <h2>Consultar jugadores</h2>
            <p className="juez-empty-inline">
              {browseTeam
                ? "Mostrando los jugadores de ese equipo."
                : "Mostrando jugadores por vencer o vencidos de todos los equipos. Elegi un equipo para filtrar."}
            </p>
          </div>
        </div>

        <label className="juez-field juez-field--full-mobile">
          <span>Equipo</span>
          <select
            value={browseTeamId ?? ""}
            onChange={(event) => setBrowseTeamId(event.target.value ? Number(event.target.value) : null)}
          >
            <option value="">Todos</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {formatTeamLabel(team)}
              </option>
            ))}
          </select>
        </label>
      </article>

      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">{browseTeam ? formatTeamLabel(browseTeam) : "Todos los equipos"}</p>
            <h2>Jugadores</h2>
          </div>
        </div>

        {isLoading ? <p className="juez-empty-inline">Cargando jugadores...</p> : null}

        {!isLoading && !browsedPlayers.length ? (
          <p className="juez-empty-inline">
            {browseTeam ? "No hay jugadores en esta categoria." : "No hay jugadores por vencer ni vencidos."}
          </p>
        ) : null}

        <div className="juez-player-grid">
          {browsedPlayers.map((player) => (
            <JuezPlayerCard key={player.id} player={player} onOpenEditPlayer={onOpenEditPlayer} />
          ))}
        </div>
      </article>

      {editingPlayer ? (
        <JuezPlayerEditModal
          player={editingPlayer}
          editForm={editForm}
          onChangeEditForm={onChangeEditForm}
          onSubmit={onSubmitEditPlayer}
          onClose={onCloseEditPlayer}
        />
      ) : null}
    </section>
  );
}
