import { ChangeEvent, useState } from "react";
import { compressImageFile } from "../juez.image";

type JuezPhotoInputProps = {
  label?: string;
  previewSrc: string;
  initials: string;
  onPhotoChange: (dataUrl: string) => void;
};

export function JuezPhotoInput({ label = "Foto (opcional)", previewSrc, initials, onPhotoChange }: JuezPhotoInputProps) {
  const [fileName, setFileName] = useState("");

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName("");
      onPhotoChange("");
      return;
    }

    setFileName(file.name);

    try {
      const compressed = await compressImageFile(file);
      onPhotoChange(compressed);
    } catch {
      setFileName("");
      onPhotoChange("");
    }
  }

  return (
    <div className="juez-photo-input">
      <span className="juez-avatar juez-avatar--medium">
        {previewSrc ? <img src={previewSrc} alt="" /> : initials}
      </span>
      <div className="juez-photo-input__control">
        <span className="juez-photo-input__label">{label}</span>
        <label className="juez-file-input">
          <input type="file" accept="image/*" className="juez-file-input__native" onChange={handleChange} />
          <span className="juez-file-input__button">Elegir foto</span>
          <span className="juez-file-input__filename">{fileName || "Sin archivo seleccionado"}</span>
        </label>
      </div>
    </div>
  );
}
