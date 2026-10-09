import { API_BASE_URL } from "../../shared/config/api";

// Dispara y no espera -- si falla, no debe romper el login (eso es solo
// para que nosotros sepamos quien entro, no un requisito para poder usar
// la app).
export function recordJuezLogin(actor: string) {
  fetch(`${API_BASE_URL}/juez-audit/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actor })
  }).catch(() => {
    // Silencioso a proposito.
  });
}
