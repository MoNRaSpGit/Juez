import { API_BASE_URL } from "../../shared/config/api";
import { RefereeRole } from "./juez.types";

export type JudgeAuthUser = {
  id: number;
  email: string;
  fullName: string | null;
  city: string | null;
  roles: RefereeRole[];
  accountRole: "admin" | "juez";
  verifiedAt: string | null;
};

type JudgeAuthResponse = {
  user: JudgeAuthUser;
};

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export async function registerJudgeAccount(payload: {
  fullName: string;
  city: string;
  email: string;
  password: string;
  roles: RefereeRole[];
  redirectUrl?: string;
}) {
  const response = await fetch(buildUrl("/juez-auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = (await response.json().catch(() => ({}))) as Partial<{ message: string }>;
  if (!response.ok) {
    throw new Error(data.message || "No se pudo registrar la cuenta.");
  }

  return data as { success: true; verificationRequired: true };
}

export async function loginJudgeAccount(email: string, password: string) {
  const response = await fetch(buildUrl("/juez-auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = (await response.json().catch(() => ({}))) as Partial<JudgeAuthResponse> & { message?: string };
  if (!response.ok || !data.user) {
    throw new Error(data.message || "No se pudo iniciar sesion.");
  }

  return data.user;
}

export async function confirmJudgeEmail(token: string) {
  const response = await fetch(buildUrl("/juez-auth/confirm-email"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token })
  });

  const data = (await response.json().catch(() => ({}))) as Partial<JudgeAuthResponse> & { message?: string };
  if (!response.ok) {
    throw new Error(data.message || "No se pudo confirmar el correo.");
  }

  return data.user ?? null;
}
