import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import {
  listJudgeAccounts,
  loginJudgeAccount,
  registerJudgeAccount,
  updateJudgeAccountRoles,
  type JudgeAuthUser
} from "../juez.auth.client";
import { INITIAL_REFEREES } from "../juez.mock";
import { Referee, RefereeRole } from "../juez.types";

export type AuthMode = "login" | "register";

export type AuthFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  roles: Record<RefereeRole, boolean>;
};

const SESSION_STORAGE_KEY = "juez-session";
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,72}$/;

function createEmptyAuthForm(): AuthFormState {
  return {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    roles: {
      principal: false,
      secundario: false,
      planillero: false
    }
  };
}

function loadStoredSession() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(SESSION_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

const NUMERIC_ID_REGEX = /^\d+$/;

function createRefereeFromJudgeUser(user: JudgeAuthUser): Referee {
  return {
    id: String(user.id),
    name: user.fullName?.trim() || user.email,
    city: user.city?.trim() || "Montevideo",
    accountRole: user.accountRole,
    email: user.email,
    roles: user.roles
  };
}

function upsertRefereeFromJudgeUser(current: Referee[], user: JudgeAuthUser) {
  const existing = current.find((referee) => referee.email?.toLowerCase() === user.email.toLowerCase());
  const nextReferee = existing
    ? {
        ...existing,
        name: user.fullName?.trim() || existing.name,
        city: user.city?.trim() || existing.city,
        accountRole: user.accountRole,
        email: user.email,
        roles: user.roles
      }
    : createRefereeFromJudgeUser(user);

  const withoutCurrent = current.filter((referee) => referee.email?.toLowerCase() !== user.email.toLowerCase());
  return { nextReferee, referees: [nextReferee, ...withoutCurrent] };
}

export function useAuthSession() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authForm, setAuthForm] = useState<AuthFormState>(() => createEmptyAuthForm());
  const [referees, setReferees] = useState<Referee[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>(() => loadStoredSession());

  const currentUser = useMemo(
    () => referees.find((referee) => referee.id === currentUserId) ?? null,
    [currentUserId, referees]
  );
  const canManageAdministration = currentUser?.accountRole === "admin";

  useEffect(() => {
    let active = true;

    async function loadReferees() {
      try {
        const accounts = await listJudgeAccounts();
        if (active) setReferees(accounts.map(createRefereeFromJudgeUser));
      } catch {
        if (active) toast.error("No se pudieron cargar los jueces.");
      }
    }

    void loadReferees();
    return () => {
      active = false;
    };
  }, []);

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

  useEffect(() => {
    if (currentUserId && !currentUser) {
      setCurrentUserId("");
    }
  }, [currentUser, currentUserId]);

  function handleChangeAuthField(field: keyof Omit<AuthFormState, "roles">, value: string) {
    setAuthForm((current) => ({ ...current, [field]: value }));
  }

  function handleToggleAuthRole(role: RefereeRole) {
    setAuthForm((current) => ({
      ...current,
      roles: {
        ...current.roles,
        [role]: !current.roles[role]
      }
    }));
  }

  function loginWithTestReferee(matchEmail: string, fallback: Referee) {
    const existing = referees.find((referee) => referee.email?.toLowerCase() === matchEmail.toLowerCase());
    const matched = existing ?? fallback;

    if (!existing) {
      setReferees((current) => [matched, ...current]);
    }

    setCurrentUserId(matched.id);
    setAuthForm(createEmptyAuthForm());
    toast.success("Sesion iniciada.");
  }

  // Accesos rapidos de prueba para los botones de la pantalla de login.
  function handleQuickLogin(preset: "admin" | "juez" | "ramon") {
    if (preset === "admin") {
      loginWithTestReferee("admin", INITIAL_REFEREES[0]);
      return;
    }
    if (preset === "juez") {
      loginWithTestReferee("lucia@juez.local", INITIAL_REFEREES[1]);
      return;
    }
    loginWithTestReferee("ramon@juez.local", INITIAL_REFEREES[2]);
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = authForm.email.trim().toLowerCase();
    const password = authForm.password.trim();
    const name = authForm.name.trim();
    const confirmPassword = authForm.confirmPassword.trim();
    const selectedRoles = (Object.entries(authForm.roles) as Array<[RefereeRole, boolean]>)
      .filter(([, isChecked]) => isChecked)
      .map(([role]) => role);

    if (authMode === "login") {
      // Entrar sin escribir nada tambien cuenta como acceso rapido de admin.
      const isBlankSubmit = !email && !password;

      if (isBlankSubmit || (email === "admin" && password === "admin")) {
        const existingAdmin = referees.find((referee) => referee.accountRole === "admin" || referee.email === "admin");
        const matchedAdmin = existingAdmin ?? INITIAL_REFEREES[0];

        if (!existingAdmin) {
          setReferees((current) => [matchedAdmin, ...current]);
        }

        setCurrentUserId(matchedAdmin.id);
        setAuthForm(createEmptyAuthForm());
        toast.success("Sesion iniciada.");
        return;
      }

      // Acceso rapido de prueba para el rol juez, en espejo del bypass de admin.
      if (email === "juez" && password === "juez") {
        loginWithTestReferee("lucia@juez.local", INITIAL_REFEREES[1]);
        return;
      }

      // Segundo usuario de prueba, con los 3 roles de juez.
      if (email === "ramon" && password === "ramon") {
        loginWithTestReferee("ramon@juez.local", INITIAL_REFEREES[2]);
        return;
      }

      try {
        const user = await loginJudgeAccount(email, password);
        const { nextReferee, referees: nextReferees } = upsertRefereeFromJudgeUser(referees, user);
        setReferees(nextReferees);
        setCurrentUserId(nextReferee.id);
        setAuthForm(createEmptyAuthForm());
        toast.success("Sesion iniciada.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo iniciar sesion.");
      }
      return;
    }

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Completa nombre, email y contrasenas.");
      return;
    }

    if (!STRONG_PASSWORD_REGEX.test(password)) {
      toast.error("Usa una contraseña de 12 caracteres o mas, con mayuscula, minuscula, numero y simbolo.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contrasenas no coinciden.");
      return;
    }

    if (!selectedRoles.length) {
      toast.error("Selecciona al menos un rol.");
      return;
    }

    try {
      await registerJudgeAccount({
        fullName: name,
        city: "Montevideo",
        email,
        password,
        roles: selectedRoles,
        redirectUrl: `${window.location.origin}/verify-email`
      });

      setAuthForm(createEmptyAuthForm());
      setAuthMode("login");
      toast.success("Cuenta creada. Ya podés iniciar sesión.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar la cuenta.");
    }
  }

  async function handleToggleRefereeRole(refereeId: string, role: RefereeRole) {
    const referee = referees.find((item) => item.id === refereeId);
    if (!referee) return;

    const hasRole = referee.roles.includes(role);
    const nextRoles = hasRole ? referee.roles.filter((item) => item !== role) : [...referee.roles, role];

    if (!nextRoles.length) {
      toast.error("Cada juez debe conservar al menos un rol.");
      return;
    }

    // Los ids numericos son cuentas reales del backend; los accesos rapidos
    // de prueba (admin-1, ref-1, etc.) solo existen en memoria del navegador.
    if (!NUMERIC_ID_REGEX.test(refereeId)) {
      setReferees((current) => current.map((item) => (item.id === refereeId ? { ...item, roles: nextRoles } : item)));
      return;
    }

    try {
      await updateJudgeAccountRoles(Number(refereeId), nextRoles);
      setReferees((current) => current.map((item) => (item.id === refereeId ? { ...item, roles: nextRoles } : item)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron actualizar los roles.");
    }
  }

  function logout() {
    setCurrentUserId("");
  }

  return {
    authMode,
    authForm,
    referees,
    currentUser,
    canManageAdministration,
    handleAuthSubmit,
    handleChangeAuthField,
    handleToggleAuthRole,
    handleToggleRefereeRole,
    handleQuickLogin,
    setAuthForm,
    setAuthMode,
    logout
  };
}
