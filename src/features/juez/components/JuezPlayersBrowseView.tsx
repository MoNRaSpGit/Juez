import { useMemo, useState } from "react";
import { formatDaysUntilExpiry, getPlayerExpiryUrgency } from "../juez.utils";
import { buildJuezPlayerPhotoUrl } from "../juez.players.client";
import { JuezPlayer, JuezPlayerFormState } from "../juez.players.types";
import { JuezTeam } from "../juez.teams.types";
import { JuezPlayerEditModal } from "./JuezPlayerEditModal";

type JuezPlayersBrowseViewProps = {
  // Lista completa, sin filtrar (06/10/2026, pedido explicito: "pone tipo
  // diferentes categorias 'sin vencimiento' 'sin cedula' etc asi los
  // dividimos y los podemos arreglar bien") -- se usa para armar las
  // categorias de abajo cuando no hay equipo elegido.
  allPlayers: JuezPlayer[];
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
  // Usuario de solo lectura (06/10/2026, pedido explicito: "el admin va a
  // poder modificar los datos y el usuario solo verlos") -- sin boton de
  // Editar ni modal cuando es false.
  canEdit: boolean;
};

function formatComboLabel(team: JuezTeam) {
  return `${team.division} - ${team.sex === "masculino" ? "Masculino" : "Femenino"}`;
}

function formatTeamLabel(team: JuezTeam) {
  return `${team.name} - ${formatComboLabel(team)}`;
}

const URGENCY_BADGE_LABEL: Record<string, string> = {
  expired: "Vencido",
  yellow: "Por vencer",
  review: "Sin vencimiento",
  inactive: "Inactivo"
};

// Pedido explicito (07/10/2026): "al principio que no se vea nada, todo
// en blanco... si paso a la pestana vencidos me muestra todos los
// vencidos, por vencer los que les faltan pocos dias, inactivos los que
// llevan mas de 3 meses vencidos". null = pantalla inicial, sin pestana
// elegida todavia.
type StatusFilter = "vencidos" | "por_vencer" | "inactivos" | "sin_vencimiento" | "sin_cedula" | null;

const STATUS_FILTER_LABEL: Record<Exclude<StatusFilter, null>, string> = {
  vencidos: "Vencidos",
  por_vencer: "Por vencer",
  inactivos: "Inactivos",
  sin_vencimiento: "Sin vencimiento",
  sin_cedula: "Sin cedula"
};

function getInitials(name: string, lastName: string) {
  return `${name[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

function JuezPlayerCard({
  player,
  onOpenEditPlayer,
  canEdit
}: {
  player: JuezPlayer;
  onOpenEditPlayer: (player: JuezPlayer) => void;
  canEdit: boolean;
}) {
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
      {!player.cedula ? <p className="juez-player-card__no-cedula">Sin cedula cargada</p> : null}

      {canEdit ? (
        <div className="juez-player-card__actions">
          <button type="button" className="juez-player-card__edit" onClick={() => onOpenEditPlayer(player)}>
            Editar
          </button>
        </div>
      ) : null}
    </article>
  );
}

export function JuezPlayersBrowseView({
  allPlayers,
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
  onSubmitEditPlayer,
  canEdit
}: JuezPlayersBrowseViewProps) {
  // Pestanas (07/10/2026, pedido explicito): arranca en blanco (null),
  // sin mostrar nada, hasta que se elija una pestana o un equipo. Con
  // equipo elegido se ignora la pestana y se ve el plantel completo
  // (igual que antes) -- las pestanas son solo para cuando no hay
  // equipo, para ir navegando por estado.
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(null);

  const statusCounts = useMemo(
    () => ({
      vencidos: allPlayers.filter((player) => getPlayerExpiryUrgency(player.expiryDate) === "expired").length,
      por_vencer: allPlayers.filter((player) => getPlayerExpiryUrgency(player.expiryDate) === "yellow").length,
      inactivos: allPlayers.filter((player) => getPlayerExpiryUrgency(player.expiryDate) === "inactive").length,
      sin_vencimiento: allPlayers.filter((player) => getPlayerExpiryUrgency(player.expiryDate) === "review").length,
      sin_cedula: allPlayers.filter((player) => !player.cedula).length
    }),
    [allPlayers]
  );

  // Antes era un selector en 2 pasos (nombre, despues division/sexo si
  // habia mas de un equipo con ese nombre) -- pedido explicito (07/10/2026,
  // bug reportado: "pongo Alma Fuerte y no me muestra ninguno"): varios
  // clubes (Alma Fuerte, Cerrito, Ubuntu, Peñarol...) tienen 2 o 3 equipos
  // con el mismo nombre, y el segundo paso quedaba escondido/confuso --
  // se perdia ahi. Ahora es un solo selector con cada equipo ya
  // distinguido por nombre + division + sexo en la misma linea, nada que
  // elegir en 2 pasos.
  const sortedTeams = useMemo(
    () =>
      [...teams].sort(
        (left, right) =>
          left.name.localeCompare(right.name) || left.division.localeCompare(right.division) || left.sex.localeCompare(right.sex)
      ),
    [teams]
  );

  // Filtro en 3 pasos, progresivo (07/10/2026, pedido explicito): "elijo
  // el club, me salen todos los del club (masculino y femenino). Elijo
  // A, me salen todos los de A". No espera a que quede un solo equipo --
  // cada paso que se agrega achica la lista de jugadores, no de equipos.
  // Convive con el selector de abajo ("Todos") -- usar uno limpia el otro.
  const clubNames = useMemo(
    () => Array.from(new Set(teams.map((team) => team.name))).sort((left, right) => left.localeCompare(right)),
    [teams]
  );
  const [stepClub, setStepClub] = useState("");
  const [stepDivision, setStepDivision] = useState<"" | "A" | "B">("");
  const [stepSex, setStepSex] = useState<"" | "masculino" | "femenino">("");
  const isStepFilterActive = Boolean(stepClub || stepDivision || stepSex);

  const stepFilteredPlayers = useMemo(
    () =>
      allPlayers.filter(
        (player) =>
          (!stepClub || player.team.toLowerCase() === stepClub.toLowerCase()) &&
          (!stepDivision || player.division === stepDivision) &&
          (!stepSex || player.sex === stepSex)
      ),
    [allPlayers, stepClub, stepDivision, stepSex]
  );

  const playersForStatus = useMemo(() => {
    if (browseTeam) return browsedPlayers;
    if (isStepFilterActive) return stepFilteredPlayers;
    if (statusFilter === "vencidos") return allPlayers.filter((player) => getPlayerExpiryUrgency(player.expiryDate) === "expired");
    if (statusFilter === "por_vencer") return allPlayers.filter((player) => getPlayerExpiryUrgency(player.expiryDate) === "yellow");
    if (statusFilter === "inactivos") return allPlayers.filter((player) => getPlayerExpiryUrgency(player.expiryDate) === "inactive");
    if (statusFilter === "sin_vencimiento") return allPlayers.filter((player) => getPlayerExpiryUrgency(player.expiryDate) === "review");
    if (statusFilter === "sin_cedula") return allPlayers.filter((player) => !player.cedula);
    return []; // sin pestana elegida: pantalla en blanco a proposito
  }, [browseTeam, browsedPlayers, isStepFilterActive, stepFilteredPlayers, statusFilter, allPlayers]);

  return (
    <section className="juez-layout-grid">
      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">Filtro</p>
            <h2>Consulta de carnet de jugador</h2>
            <p className="juez-empty-inline">
              {browseTeam ? "Mostrando los jugadores de ese equipo." : "Elegi un equipo, o una pestana de abajo, para ver jugadores."}
            </p>
          </div>
        </div>

        <div className="juez-form-grid juez-form-grid--mobile-first">
          <label className="juez-field juez-field--full-mobile">
            <span>Club</span>
            <select
              value={stepClub}
              onChange={(event) => {
                setStepClub(event.target.value);
                setBrowseTeamId(null);
                setStatusFilter(null);
              }}
            >
              <option value="">Elegi un club</option>
              {clubNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <div className="juez-field">
            <span>Division</span>
            <div className="juez-toggle-buttons">
              {(["A", "B"] as const).map((division) => (
                <button
                  key={division}
                  type="button"
                  className={stepDivision === division ? "juez-toggle-btn is-active" : "juez-toggle-btn"}
                  onClick={() => {
                    setStepDivision((current) => (current === division ? "" : division));
                    setBrowseTeamId(null);
                    setStatusFilter(null);
                  }}
                >
                  <span className="juez-toggle-btn__light" />
                  {division}
                </button>
              ))}
            </div>
          </div>

          <div className="juez-field">
            <span>Sexo</span>
            <div className="juez-toggle-buttons">
              {(
                [
                  ["masculino", "Masculino"],
                  ["femenino", "Femenino"]
                ] as const
              ).map(([sex, label]) => (
                <button
                  key={sex}
                  type="button"
                  className={stepSex === sex ? "juez-toggle-btn is-active" : "juez-toggle-btn"}
                  onClick={() => {
                    setStepSex((current) => (current === sex ? "" : sex));
                    setBrowseTeamId(null);
                    setStatusFilter(null);
                  }}
                >
                  <span className="juez-toggle-btn__light" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="juez-form-grid juez-form-grid--mobile-first">
          <label className="juez-field juez-field--full-mobile">
            <span>O elegi de la lista completa</span>
            <select
              value={browseTeamId ?? ""}
              onChange={(event) => {
                setBrowseTeamId(event.target.value ? Number(event.target.value) : null);
                setStepClub("");
                setStepDivision("");
                setStepSex("");
                setStatusFilter(null);
              }}
            >
              <option value="">Todos</option>
              {sortedTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {formatTeamLabel(team)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </article>

      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">
              {browseTeam
                ? formatTeamLabel(browseTeam)
                : isStepFilterActive
                  ? [stepClub, stepDivision, stepSex && (stepSex === "masculino" ? "Masculino" : "Femenino")].filter(Boolean).join(" - ")
                  : "Todos los equipos"}
            </p>
            <h2>Jugadores</h2>
          </div>
        </div>

        {!browseTeam ? (
          <div className="juez-status-filters">
            {(Object.keys(STATUS_FILTER_LABEL) as Exclude<StatusFilter, null>[]).map((status) => (
              <button
                key={status}
                type="button"
                className={statusFilter === status ? "juez-status-chip is-active" : "juez-status-chip"}
                onClick={() => {
                  setStatusFilter((current) => (current === status ? null : status));
                  setBrowseTeamId(null);
                  setStepClub("");
                  setStepDivision("");
                  setStepSex("");
                }}
              >
                {STATUS_FILTER_LABEL[status]} <strong>{statusCounts[status]}</strong>
              </button>
            ))}
          </div>
        ) : null}

        {isLoading ? <p className="juez-empty-inline">Cargando jugadores...</p> : null}

        {!isLoading && !browseTeam && !isStepFilterActive && !statusFilter ? (
          <p className="juez-empty-inline">Elegi una pestana (Vencidos, Por vencer, Inactivos...) o un equipo para ver jugadores.</p>
        ) : null}

        {!isLoading && (browseTeam || isStepFilterActive || statusFilter) && !playersForStatus.length ? (
          <p className="juez-empty-inline">No hay jugadores en esta categoria.</p>
        ) : null}

        <div className="juez-player-grid">
          {playersForStatus.map((player) => (
            <JuezPlayerCard key={player.id} player={player} onOpenEditPlayer={onOpenEditPlayer} canEdit={canEdit} />
          ))}
        </div>
      </article>

      {editingPlayer && canEdit ? (
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
