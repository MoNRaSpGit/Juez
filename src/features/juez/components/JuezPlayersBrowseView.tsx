import { useMemo, useState } from "react";
import { formatDaysUntilExpiry, getPlayerExpiryUrgency } from "../juez.utils";
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

function formatComboLabel(team: JuezTeam) {
  return `${team.division} - ${team.sex === "masculino" ? "Masculino" : "Femenino"}`;
}

function formatTeamLabel(team: JuezTeam) {
  return `${team.name} - ${formatComboLabel(team)}`;
}

const URGENCY_BADGE_LABEL: Record<string, string> = {
  expired: "Vencido",
  yellow: "Por vencer"
};

function getInitials(name: string, lastName: string) {
  return `${name[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

function JuezPlayerCard({ player, onOpenEditPlayer }: { player: JuezPlayer; onOpenEditPlayer: (player: JuezPlayer) => void }) {
  const urgency = getPlayerExpiryUrgency(player.expiryDate);
  const badgeLabel = URGENCY_BADGE_LABEL[urgency];

  return (
    <article className={`juez-player-card juez-player-card--${urgency}`}>
      <div className="juez-player-card__top">
        <div className="juez-player-row">
          <span className="juez-avatar">
            {player.hasPhoto ? <img src={buildJuezPlayerPhotoUrl(player.id)} alt="" /> : getInitials(player.name, player.lastName)}
          </span>
          <div>
            <strong className="juez-player-card__name">
              {player.name} {player.lastName}
            </strong>
            <p className="juez-player-card__team">de {player.team}</p>
          </div>
        </div>
        {badgeLabel ? <span className={`juez-player-card__badge juez-player-card__badge--${urgency}`}>{badgeLabel}</span> : null}
      </div>

      <p className="juez-player-card__expiry">{formatDaysUntilExpiry(player.expiryDate)}</p>

      <div className="juez-player-card__actions">
        <button type="button" className="juez-player-card__edit" onClick={() => onOpenEditPlayer(player)}>
          Editar
        </button>
      </div>
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
  const teamNames = useMemo(
    () => Array.from(new Set(teams.map((team) => team.name))).sort((left, right) => left.localeCompare(right)),
    [teams]
  );

  const [teamName, setTeamName] = useState(() => browseTeam?.name ?? "");

  const matchingTeams = useMemo(() => teams.filter((team) => team.name === teamName), [teams, teamName]);
  const needsCombo = matchingTeams.length > 1;
  const isPendingCombo = needsCombo && !browseTeamId;

  function handleChangeTeamName(name: string) {
    setTeamName(name);

    if (!name) {
      setBrowseTeamId(null);
      return;
    }

    const matches = teams.filter((team) => team.name === name);
    setBrowseTeamId(matches.length === 1 ? matches[0].id : null);
  }

  return (
    <section className="juez-layout-grid">
      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">Filtro</p>
            <h2>Consulta de carnet de jugador</h2>
            <p className="juez-empty-inline">
              {browseTeam
                ? "Mostrando los jugadores de ese equipo."
                : "Mostrando jugadores por vencer o vencidos de todos los equipos. Elegi un equipo para filtrar."}
            </p>
          </div>
        </div>

        <div className="juez-form-grid juez-form-grid--mobile-first">
          <label className="juez-field juez-field--full-mobile">
            <span>Equipo</span>
            <select value={teamName} onChange={(event) => handleChangeTeamName(event.target.value)}>
              <option value="">Todos</option>
              {teamNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          {needsCombo ? (
            <label className="juez-field juez-field--full-mobile">
              <span>Division y sexo</span>
              <select
                value={browseTeamId ?? ""}
                onChange={(event) => setBrowseTeamId(event.target.value ? Number(event.target.value) : null)}
              >
                <option value="">Selecciona division y sexo</option>
                {matchingTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {formatComboLabel(team)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </article>

      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">{browseTeam ? formatTeamLabel(browseTeam) : "Todos los equipos"}</p>
            <h2>Jugadores</h2>
          </div>
        </div>

        {isLoading ? <p className="juez-empty-inline">Cargando jugadores...</p> : null}

        {isPendingCombo ? <p className="juez-empty-inline">Elegi division y sexo para ver las tarjetas.</p> : null}

        {!isLoading && !isPendingCombo && !browsedPlayers.length ? (
          <p className="juez-empty-inline">
            {browseTeam ? "No hay jugadores en esta categoria." : "No hay jugadores por vencer ni vencidos."}
          </p>
        ) : null}

        {!isPendingCombo ? (
          <div className="juez-player-grid">
            {browsedPlayers.map((player) => (
              <JuezPlayerCard key={player.id} player={player} onOpenEditPlayer={onOpenEditPlayer} />
            ))}
          </div>
        ) : null}
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
