import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { loginJudgeAccount, registerJudgeAccount, type JudgeAuthUser } from "../juez.auth.client";
import {
  DEFAULT_TOURNAMENT,
  EMPTY_MATCH_FORM,
  INITIAL_ASSIGNMENTS,
  INITIAL_AVAILABILITY,
  INITIAL_MATCHES,
  INITIAL_REFEREES
} from "../juez.mock";
import { buildMatchId } from "../juez.utils";
import { Assignment, Match, MatchFormState, Referee, RefereeRole } from "../juez.types";

export type ViewMode = "matches" | "referees" | "administration";
export type AuthMode = "login" | "register";

export type AuthFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  roles: Record<RefereeRole, boolean>;
};

const EMPTY_DRAFT: Record<RefereeRole, string> = {
  principal: "",
  secundario: "",
  planillero: ""
};

function createDesignationDraftFromAssignment(assignment?: Assignment | null) {
  if (!assignment) {
    return { ...EMPTY_DRAFT };
  }

  return {
    principal: assignment.principalRefereeId,
    secundario: assignment.secondaryRefereeId,
    planillero: assignment.scorerRefereeId
  };
}

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

export function useJuezHomePageController() {
  const [viewMode, setViewMode] = useState<ViewMode>("matches");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authForm, setAuthForm] = useState<AuthFormState>(() => createEmptyAuthForm());
  const [referees, setReferees] = useState<Referee[]>(() => loadStoredReferees());
  const [currentUserId, setCurrentUserId] = useState<string>(() => loadStoredSession());
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [availability, setAvailability] = useState(INITIAL_AVAILABILITY);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [matchForm, setMatchForm] = useState<MatchFormState>(EMPTY_MATCH_FORM);
  const [designationDraft, setDesignationDraft] = useState<Record<RefereeRole, string>>(EMPTY_DRAFT);
  const [currentTournament, setCurrentTournament] = useState(DEFAULT_TOURNAMENT);
  const [tournamentDraft, setTournamentDraft] = useState(DEFAULT_TOURNAMENT);
  const [isEditingTournament, setIsEditingTournament] = useState(false);

  const currentUser = useMemo(
    () => referees.find((referee) => referee.id === currentUserId) ?? null,
    [currentUserId, referees]
  );
  const canManageAdministration = currentUser?.accountRole === "admin";

  const summary = useMemo(() => {
    const openMatches = matches.filter((match) => match.status === "open").length;
    const pendingMatches = matches.filter((match) => match.status === "closed").length;
    const assignedMatches = matches.filter((match) => match.status === "assigned").length;
    return { openMatches, pendingMatches, assignedMatches };
  }, [matches]);

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

  function handleChangeMatchForm(field: keyof MatchFormState, value: string) {
    setMatchForm((current) => ({ ...current, [field]: value }));
  }

  function handleSelectMatch(matchId: string) {
    setSelectedMatchId(matchId);
    const existingAssignment = assignments.find((assignment) => assignment.matchId === matchId);
    setDesignationDraft(createDesignationDraftFromAssignment(existingAssignment));
  }

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
      if (email === "admin" && password === "admin") {
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

  function handleLogout() {
    setCurrentUserId("");
    setViewMode("matches");
    setDesignationDraft(EMPTY_DRAFT);
  }

  function handleCreateMatch() {
    if (!matchForm.homeSide || !matchForm.awaySide || !matchForm.venue || !matchForm.date || !matchForm.time) {
      toast.error("Completa cuadro A, cuadro B, lugar, fecha y hora para publicar el partido.");
      return;
    }

    const nextMatch: Match = {
      id: buildMatchId(),
      tournament: currentTournament,
      homeSide: matchForm.homeSide,
      awaySide: matchForm.awaySide,
      venue: matchForm.venue,
      date: matchForm.date,
      time: matchForm.time,
      status: "open"
    };

    setMatches((current) => [nextMatch, ...current]);
    setSelectedMatchId(nextMatch.id);
    setMatchForm(EMPTY_MATCH_FORM);
    toast.success("Partido publicado para que los jueces confirmen si pueden ir.");
  }

  function handleToggleAvailability(matchId: string) {
    if (!currentUser) return;

    const existing = availability.find((entry) => entry.refereeId === currentUser.id && entry.matchId === matchId);

    if (existing) {
      setAvailability((current) => current.filter((entry) => entry !== existing));
      toast.info("Se quito tu confirmacion para este partido.");
      return;
    }

    setAvailability((current) => [...current, { refereeId: currentUser.id, matchId, createdAt: new Date().toISOString() }]);
    toast.success("Quedaste confirmado para este partido.");
  }

  function handleCloseRegistration(matchId: string) {
    setMatches((current) => current.map((match) => (match.id === matchId ? { ...match, status: "closed" } : match)));
    toast.success("Inscripcion cerrada. Ahora podes asignar los jueces manualmente.");
  }

  function handleReopenRegistration(matchId: string) {
    setMatches((current) => current.map((match) => (match.id === matchId ? { ...match, status: "open" } : match)));
    setDesignationDraft(EMPTY_DRAFT);
    toast.info("Inscripcion reabierta para seguir sumando disponibilidad.");
  }

  function handleDesignationChange(role: RefereeRole, refereeId: string) {
    setDesignationDraft((current) => ({ ...current, [role]: refereeId }));
  }

  function handleConfirmDesignation() {
    const selectedMatch = matches.find((match) => match.id === selectedMatchId);
    if (!selectedMatch) {
      toast.error("Selecciona un partido para designar.");
      return;
    }

    if (!designationDraft.principal || !designationDraft.secundario || !designationDraft.planillero) {
      toast.error("La designacion debe completar principal, secundario y planillero.");
      return;
    }

    const uniqueReferees = new Set(Object.values(designationDraft));
    if (uniqueReferees.size !== 3) {
      toast.error("Cada puesto debe quedar asignado a una persona distinta.");
      return;
    }

    const nextAssignment: Assignment = {
      matchId: selectedMatch.id,
      principalRefereeId: designationDraft.principal,
      secondaryRefereeId: designationDraft.secundario,
      scorerRefereeId: designationDraft.planillero,
      confirmedAt: new Date().toISOString()
    };

    setAssignments((current) => {
      const withoutCurrent = current.filter((assignment) => assignment.matchId !== selectedMatch.id);
      return [nextAssignment, ...withoutCurrent];
    });
    setMatches((current) => current.map((match) => (match.id === selectedMatch.id ? { ...match, status: "assigned" } : match)));
    setSelectedMatchId("");
    setDesignationDraft(EMPTY_DRAFT);
    toast.success("Designacion oficial confirmada.");
  }

  function handleStartTournamentEdit() {
    setTournamentDraft(currentTournament);
    setIsEditingTournament(true);
  }

  function handleSaveTournament() {
    const nextTournament = tournamentDraft.trim();
    if (!nextTournament) {
      setTournamentDraft(currentTournament);
      setIsEditingTournament(false);
      return;
    }

    setCurrentTournament(nextTournament);
    setIsEditingTournament(false);
    toast.success("Torneo predefinido actualizado.");
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

  return {
    authMode,
    authForm,
    canManageAdministration,
    currentTournament,
    currentUser,
    designationDraft,
    handleAuthSubmit,
    handleChangeAuthField,
    handleChangeMatchForm,
    handleCloseRegistration,
    handleConfirmDesignation,
    handleCreateMatch,
    handleDesignationChange,
    handleLogout,
    handleReopenRegistration,
    handleSaveTournament,
    handleStartTournamentEdit,
    handleToggleAuthRole,
    handleToggleAvailability,
    handleToggleRefereeRole,
    isEditingTournament,
    matchForm,
    matches,
    referees,
    selectedMatchId,
    setAuthForm,
    setAuthMode,
    setSelectedMatchId: handleSelectMatch,
    setTournamentDraft,
    summary,
    tournamentDraft,
    viewMode,
    setViewMode,
    availability,
    assignments
  };
}

export type JuezHomePageController = ReturnType<typeof useJuezHomePageController>;


