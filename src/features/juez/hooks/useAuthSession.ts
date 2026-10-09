import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { recordJuezLogin } from "../juez.audit.client";
import { Referee } from "../juez.types";

export type AuthFormState = {
  username: string;
  password: string;
};

const SESSION_STORAGE_KEY = "juez-session";

// Login simple, 2 cuentas fijas (06/10/2026, pedido explicito: "vamos a
// cambiar el login, hacerlo bien simple... una cuenta admin/admin y una
// usuario/usuario -- el admin va a poder modificar los datos y el
// usuario solo verlos"). Sin registro, sin roles, sin backend de
// cuentas -- eso queda intacto en juez.auth.client.ts por si se vuelve
// a necesitar, pero el login ya no lo usa.
const ACCOUNTS: Record<string, Referee> = {
  admin: {
    id: "admin",
    name: "Admin",
    roles: ["principal", "secundario", "planillero"],
    city: "Montevideo",
    accountRole: "admin",
    email: "admin"
  },
  usuario: {
    id: "usuario",
    name: "Usuario",
    roles: ["planillero"],
    city: "Montevideo",
    accountRole: "juez",
    email: "usuario"
  }
};

function createEmptyAuthForm(): AuthFormState {
  return { username: "", password: "" };
}

function loadStoredSession() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(SESSION_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function useAuthSession() {
  const [authForm, setAuthForm] = useState<AuthFormState>(() => createEmptyAuthForm());
  const [currentUserId, setCurrentUserId] = useState<string>(() => loadStoredSession());

  const currentUser = currentUserId && ACCOUNTS[currentUserId] ? ACCOUNTS[currentUserId] : null;
  // El admin puede modificar datos (editar jugadores); el usuario solo
  // los puede ver -- ver JuezPlayersBrowseView.tsx (prop canEdit).
  const canManageAdministration = currentUser?.accountRole === "admin";

  useEffect(() => {
    if (!currentUserId) {
      try {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        // ignore
      }
      return;
    }

    try {
      window.localStorage.setItem(SESSION_STORAGE_KEY, currentUserId);
    } catch {
      // ignore
    }
  }, [currentUserId]);

  function handleChangeAuthField(field: keyof AuthFormState, value: string) {
    setAuthForm((current) => ({ ...current, [field]: value }));
  }

  function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const username = authForm.username.trim().toLowerCase();
    const password = authForm.password.trim();

    if (!ACCOUNTS[username] || password !== username) {
      toast.error("Usuario o contraseña incorrectos.");
      return;
    }

    setCurrentUserId(username);
    setAuthForm(createEmptyAuthForm());
    recordJuezLogin(username);
    toast.success("Sesion iniciada.");
  }

  // La vista de Jueces/Admin esta oculta por ahora (ver
  // JuezDashboardScreen.tsx, SHOW_FULL_JUEZ_MENU) -- se deja esta funcion
  // solo para que el resto del codigo siga compilando igual.
  function handleToggleRefereeRole() {
    toast.error("No disponible.");
  }

  function logout() {
    setCurrentUserId("");
  }

  return {
    authForm,
    referees: Object.values(ACCOUNTS),
    currentUser,
    canManageAdministration,
    handleAuthSubmit,
    handleChangeAuthField,
    handleToggleRefereeRole,
    setAuthForm,
    logout
  };
}
