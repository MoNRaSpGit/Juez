import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { recordJuezLogin } from "../juez.audit.client";
import { Referee } from "../juez.types";

export type AuthFormState = {
  username: string;
  password: string;
};

const SESSION_STORAGE_KEY = "juez-session";

// Login simple, cuentas fijas (06/10/2026, pedido explicito: "vamos a
// cambiar el login, hacerlo bien simple... una cuenta admin/admin y una
// usuario/usuario -- el admin va a poder modificar los datos y el
// usuario solo verlos"). Sin registro, sin roles, sin backend de
// cuentas -- eso queda intacto en juez.auth.client.ts por si se vuelve
// a necesitar, pero el login ya no lo usa.
//
// "camila" (10/10/2026, pedido explicito): cuenta de solo lectura
// restringida a un unico equipo (Peñarol Fem = team id 69 en
// saas_juez_teams: Peñarol, division A, femenino) -- ver lockedTeamId en
// juez.types.ts. Contraseña propia (ya no vale "password === username"
// como con admin/usuario).
// Señuelo (20/10/2026, pedido explicito): admin/admin ya NO deja entrar
// (ver handleAuthSubmit, el error "505" es inventado por nosotros) -- el
// admin real ahora es "voley". La cuenta admin queda en este objeto solo
// para que el chequeo de abajo la reconozca y dispare el señuelo.
const ACCOUNTS: Record<string, Referee> = {
  admin: {
    id: "admin",
    name: "Admin",
    roles: ["principal", "secundario", "planillero"],
    city: "Montevideo",
    accountRole: "admin",
    email: "admin",
    password: "admin"
  },
  voley: {
    id: "voley",
    name: "Voley",
    roles: ["principal", "secundario", "planillero"],
    city: "Montevideo",
    accountRole: "admin",
    email: "voley",
    password: "voley"
  },
  usuario: {
    id: "usuario",
    name: "Usuario",
    roles: ["planillero"],
    city: "Montevideo",
    accountRole: "juez",
    email: "usuario",
    password: "usuario"
  },
  camila: {
    id: "camila",
    name: "Camila",
    roles: ["planillero"],
    city: "Montevideo",
    accountRole: "juez",
    email: "camila",
    password: "camila54321",
    lockedTeamId: 69,
    lockedTeamLabel: "Peñarol Fem"
  }
};

function createEmptyAuthForm(): AuthFormState {
  return { username: "", password: "" };
}

// sessionStorage, NO localStorage (14/10/2026, pedido explicito): "si
// cierra la app que no quede ninguna sesion activa... si entra otro se
// tiene que volver a loguear" -- localStorage sobrevive aunque se cierre
// la app del todo (el admin quedaba logueado para quien abriera despues).
// sessionStorage se borra solo al cerrar la pestaña/app, pero sigue
// sirviendo para no perder la sesion con un simple refresh de pagina
// mientras se sigue usando.
function loadStoredSession() {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(SESSION_STORAGE_KEY) || "";
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
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        // ignore
      }
      return;
    }

    try {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, currentUserId);
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

    // Señuelo (20/10/2026, pedido explicito): admin/admin nunca entra --
    // muestra un error inventado por nosotros (no es un error real) y
    // deja constancia de que alguien lo probo. El admin real es "voley".
    if (username === "admin" && password === "admin") {
      toast.error("Algo salió mal, error 505");
      recordJuezLogin("admin", true);
      return;
    }

    const account = ACCOUNTS[username];

    if (!account || password !== account.password) {
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
