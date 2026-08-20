import { ChangeEvent } from "react";
import { compressImageFile } from "../juez.image";
import { buildJuezPlayerPhotoUrl } from "../juez.players.client";
import { JuezPlayer, JuezPlayerFormState } from "../juez.players.types";

type JuezPlayerEditModalProps = {
  player: JuezPlayer;
  editForm: JuezPlayerFormState;
  onChangeEditForm: (field: keyof JuezPlayerFormState, value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

function getInitials(name: string, lastName: string) {
  return `${name[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function JuezPlayerEditModal({ player, editForm, onChangeEditForm, onSubmit, onClose }: JuezPlayerEditModalProps) {
  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file);
      onChangeEditForm("photoDataUrl", compressed);
    } catch {
      onChangeEditForm("photoDataUrl", "");
    }
  }

  const previewSrc = editForm.photoDataUrl || (player.hasPhoto ? buildJuezPlayerPhotoUrl(player.id) : "");

  return (
    <div className="juez-modal" role="presentation" onClick={onClose}>
      <div className="juez-modal__backdrop" />
      <article
        className="juez-modal__dialog juez-modal__dialog--player"
        role="dialog"
        aria-modal="true"
        aria-label={`Editar jugador ${player.name} ${player.lastName}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="juez-modal__header">
          <div>
            <p className="juez-eyebrow">Editar jugador</p>
            <h2>
              {player.name} {player.lastName}
            </h2>
            <p className="juez-modal__meta">{player.team}</p>
          </div>
          <button type="button" className="juez-modal__close" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div className="juez-player-edit__photo">
          <span className="juez-avatar juez-avatar--large">
            {previewSrc ? <img src={previewSrc} alt="" /> : getInitials(editForm.name, editForm.lastName)}
          </span>
          <label className="juez-field">
            <span>Foto (opcional)</span>
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </label>
        </div>

        <div className="juez-form-grid juez-form-grid--mobile-first">
          <label className="juez-field juez-field--full-mobile">
            <span>Vencimiento</span>
            <input type="date" value={editForm.expiryDate} onChange={(event) => onChangeEditForm("expiryDate", event.target.value)} />
          </label>
          <label className="juez-field">
            <span>Nombre</span>
            <input value={editForm.name} onChange={(event) => onChangeEditForm("name", event.target.value)} placeholder="Ana" />
          </label>
          <label className="juez-field">
            <span>Apellido</span>
            <input
              value={editForm.lastName}
              onChange={(event) => onChangeEditForm("lastName", event.target.value)}
              placeholder="Gonzalez"
            />
          </label>
          <label className="juez-field">
            <span>Telefono (opcional)</span>
            <input value={editForm.phone} onChange={(event) => onChangeEditForm("phone", event.target.value)} placeholder="099123456" />
          </label>
          <label className="juez-field">
            <span>Cedula (opcional)</span>
            <input value={editForm.cedula} onChange={(event) => onChangeEditForm("cedula", event.target.value)} placeholder="1234567-8" />
          </label>
          <label className="juez-field juez-field--full-mobile">
            <span>Nacimiento (opcional)</span>
            <input type="date" value={editForm.birthDate} onChange={(event) => onChangeEditForm("birthDate", event.target.value)} />
          </label>
        </div>

        <div className="juez-modal__footer">
          <button type="button" className="juez-button juez-button--primary" onClick={onSubmit}>
            Guardar cambios
          </button>
        </div>
      </article>
    </div>
  );
}
