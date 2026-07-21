import { useState } from "react";
import { formatDaysUntilExpiry, getAge, getPlayerExpiryUrgency } from "../juez.utils";
import { JuezPlayer, JuezPlayerDivision, JuezPlayerSex } from "../juez.players.types";

type JuezPlayersBrowseViewProps = {
  browsedPlayers: JuezPlayer[];
  isLoading: boolean;
  teamOptions: string[];
  browseTeam: string;
  setBrowseTeam: (value: string) => void;
  browseDivision: JuezPlayerDivision;
  setBrowseDivision: (value: JuezPlayerDivision) => void;
  browseSex: JuezPlayerSex;
  setBrowseSex: (value: JuezPlayerSex) => void;
};

const URGENCY_BADGE_LABEL: Record<string, string> = {
  expired: "Vencido",
  red: "Vence pronto",
  yellow: "Por vencer"
};

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat("es-UY", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function JuezPlayerCard({ player }: { player: JuezPlayer }) {
  const [showDetails, setShowDetails] = useState(false);
  const urgency = getPlayerExpiryUrgency(player.expiryDate);
  const badgeLabel = URGENCY_BADGE_LABEL[urgency];

  return (
    <article className={`juez-player-card juez-player-card--${urgency}`}>
      <div className="juez-player-card__top">
        <strong className="juez-player-card__name">{player.name}</strong>
        {badgeLabel ? <span className={`juez-player-card__badge juez-player-card__badge--${urgency}`}>{badgeLabel}</span> : null}
      </div>

      <p className="juez-player-card__expiry">{formatDaysUntilExpiry(player.expiryDate)}</p>

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
  teamOptions,
  browseTeam,
  setBrowseTeam,
  browseDivision,
  setBrowseDivision,
  browseSex,
  setBrowseSex
}: JuezPlayersBrowseViewProps) {
  return (
    <section className="juez-layout-grid">
      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">Filtro</p>
            <h2>Consultar jugadores</h2>
            <p className="juez-empty-inline">Elegi equipo, division y sexo para ver las tarjetas de esa categoria.</p>
          </div>
        </div>

        <div className="juez-form-grid juez-form-grid--mobile-first">
          <label className="juez-field juez-field--full-mobile">
            <span>Equipo</span>
            <select value={browseTeam} onChange={(event) => setBrowseTeam(event.target.value)}>
              {!teamOptions.length ? <option value="">Sin equipos cargados</option> : null}
              {teamOptions.map((teamOption) => (
                <option key={teamOption} value={teamOption}>
                  {teamOption}
                </option>
              ))}
            </select>
          </label>
          <label className="juez-field">
            <span>Division</span>
            <select value={browseDivision} onChange={(event) => setBrowseDivision(event.target.value as JuezPlayerDivision)}>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </label>
          <label className="juez-field">
            <span>Sexo</span>
            <select value={browseSex} onChange={(event) => setBrowseSex(event.target.value as JuezPlayerSex)}>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </label>
        </div>
      </article>

      <article className="juez-panel juez-panel--span-2">
        <div className="juez-panel__heading">
          <div>
            <p className="juez-eyebrow">
              {browseTeam || "Equipo"} {browseDivision} - {browseSex === "masculino" ? "Masculino" : "Femenino"}
            </p>
            <h2>Jugadores</h2>
          </div>
        </div>

        {isLoading ? <p className="juez-empty-inline">Cargando jugadores...</p> : null}

        {!isLoading && !browsedPlayers.length ? <p className="juez-empty-inline">No hay jugadores en esta categoria.</p> : null}

        <div className="juez-player-grid">
          {browsedPlayers.map((player) => (
            <JuezPlayerCard key={player.id} player={player} />
          ))}
        </div>
      </article>
    </section>
  );
}
