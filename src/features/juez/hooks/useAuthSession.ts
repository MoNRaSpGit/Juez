import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { loginJudgeAccount, registerJudgeAccount, type JudgeAuthUser } from "../juez.auth.client";
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

const REFEREES_STORAGE_KEY = "juez-referees";
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

function loadStoredReferees() {
  if (typeof window === "undefined") return INITIAL_REFEREES;

  try {
    const raw = window.localStorage.getItem(REFEREES_STORAGE_KEY);
    if (!raw) return INITIAL_REFEREES;

    const parsed = JSON.parse(raw) as Referee[];
    if (!Array.isArray(parsed) || !parsed.length) return INITIAL_REFEREES;

    const normalized = parsed.map((referee) => ({
      ...referee,
      accountRole: referee.accountRole ?? (referee.email === "admin" ? "admin" : "juez")
    }));

    if (normalized.some((referee) => referee.accountRole === "admin" || referee.email === "admin")) {
      return normalized;
    }

    return [INITIAL_REFEREES[0], ...normalized];
  } catch {
    return INITIAL_REFEREES;
  }
}

function loadStoredSession() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(SESSION_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function createRefereeFromJudgeUser(user: JudgeAuthUser): Referee {
  return {
    id: `juez-${user.id}`,
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
  const [referees, setReferees] = useState<Referee[]>(() => loadStoredReferees());
  const [currentUserId, setCurrentUserId] = useState<string>(() => loadStoredSession());

  const currentUser = useMemo(
    () => referees.find((referee) => referee.id === currentUserId) ?? null,
    [currentUserId, referees]
  );
  const canManageAdministration = currentUser?.accountRole === "admin";

  useEffect(() => {
    try {
      window.localStorage.setItem(REFEREES_STORAGE_KEY, JSON.stringify(referees));
    } catch {
      // ignore
    }
  }, [referees]);

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
        const existingTestJudge = referees.find((referee) => referee.email === "lucia@juez.local");
        const matchedTestJudge = existingTestJudge ?? INITIAL_REFEREES[1];

        if (!existingTestJudge) {
          setReferees((current) => [matchedTestJudge, ...current]);
        }

        setCurrentUserId(matchedTestJudge.id);
        setAuthForm(createEmptyAuthForm());
        toast.success("Sesion iniciada.");
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

  function handleToggleRefereeRole(refereeId: string, role: RefereeRole) {
    setReferees((current) =>
      current.map((referee) => {
        if (referee.id !== refereeId) return referee;

        const hasRole = referee.roles.includes(role);
        const nextRoles = hasRole ? referee.roles.filter((item) => item !== role) : [...referee.roles, role];

        if (!nextRoles.length) {
          toast.error("Cada juez debe conservar al menos un rol.");
          return referee;
        }

        return { ...referee, roles: nextRoles };
      })
    );
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
    setAuthForm,
    setAuthMode,
    logout
  };
}
