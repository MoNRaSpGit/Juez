import { API_BASE_URL } from "../../shared/config/api";

// Dispara y no espera -- si falla, no debe romper el login (eso es solo
// para que nosotros sepamos quien entro, no un requisito para poder usar
// la app). blocked=true es para el señuelo admin/admin (20/10/2026): no
// entra, pero igual queremos saber si alguien lo probo.
export function recordJuezLogin(actor: string, blocked = false) {
  fetch(`${API_BASE_URL}/juez-audit/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actor, blocked })
  }).catch(() => {
    // Silencioso a proposito.
  });
}
