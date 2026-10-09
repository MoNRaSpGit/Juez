import { useState } from "react";
import { displayDigitsToIsoDate, formatDateInputDraft, isoDateToDisplay } from "../juez.utils";

type JuezDateFieldProps = {
  value: string;
  onChange: (isoDate: string) => void;
  placeholder?: string;
};

// Input de fecha tipeable a mano, formato dd/mm/aaaa (10/10/2026, pedido
// explicito: "que se pueda poner a mano con el formato 09/10/2027"). El
// input nativo type="date" no se podia tipear asi en todos los
// navegadores -- este reemplazo guarda el ISO (yyyy-mm-dd) hacia afuera,
// igual que antes, pero el usuario siempre ve/tipea dd/mm/aaaa.
//
// Mismo patron que el input de dia en frontend-gym: el texto que se ve
// (draft) es independiente del valor aplicado -- solo se propaga hacia
// afuera cuando los 8 digitos estan completos, para no mandar una fecha a
// medio tipear.
export function JuezDateField({ value, onChange, placeholder = "dd/mm/aaaa" }: JuezDateFieldProps) {
  const [draft, setDraft] = useState(() => isoDateToDisplay(value));

  function handleChange(rawValue: string) {
    const formatted = formatDateInputDraft(rawValue);
    setDraft(formatted);

    const digits = formatted.replace(/\D/g, "");
    if (digits.length === 0) {
      onChange("");
      return;
    }

    const iso = displayDigitsToIsoDate(digits);
    if (iso) {
      onChange(iso);
      setDraft(isoDateToDisplay(iso));
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={draft}
      onChange={(event) => handleChange(event.target.value)}
      onFocus={() => setDraft(isoDateToDisplay(value))}
    />
  );
}
