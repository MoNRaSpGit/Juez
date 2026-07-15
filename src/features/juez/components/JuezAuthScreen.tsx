import { RefereeRole } from "../juez.types";
import { JuezHomePageController } from "../hooks/useJuezHomePageController";

type JuezAuthScreenProps = Pick<
  JuezHomePageController,
  "authMode" | "authForm" | "handleAuthSubmit" | "handleChangeAuthField" | "handleToggleAuthRole" | "setAuthForm" | "setAuthMode"
>;

export function JuezAuthScreen({
  authMode,
  authForm,
  handleAuthSubmit,
  handleChangeAuthField,
  handleToggleAuthRole,
  setAuthForm,
  setAuthMode
}: JuezAuthScreenProps) {
  return (
    <main className="juez-app juez-app--auth">
      <section className="juez-shell juez-shell--auth">
        <section className="juez-auth-card">
          <div className="juez-auth-card__header">
            <p className="juez-eyebrow">SaasPro Juez</p>
            <h1>Ingresar</h1>
            <p className="juez-auth-card__copy">Accedé con tu correo y contraseña para seguir con tus designaciones.</p>
          </div>

          <form className="juez-auth-form" onSubmit={handleAuthSubmit}>
            {authMode === "register" ? (
              <label className="juez-field">
                <span>Nombre</span>
                <input value={authForm.name} onChange={(event) => handleChangeAuthField("name", event.target.value)} />
              </label>
            ) : null}

            <label className="juez-field">
              <span>Email</span>
              <input
                type="email"
                value={authForm.email}
                onChange={(event) => handleChangeAuthField("email", event.target.value)}
                placeholder="tuemail@correo.com"
              />
            </label>

            <label className="juez-field">
              <span>Contraseña</span>
              <input
                type="password"
                value={authForm.password}
                onChange={(event) => handleChangeAuthField("password", event.target.value)}
                placeholder="********"
              />
            </label>

            {authMode === "register" ? (
              <label className="juez-field">
                <span>Confirmar contraseña</span>
                <input
                  type="password"
                  value={authForm.confirmPassword}
                  onChange={(event) => handleChangeAuthField("confirmPassword", event.target.value)}
                  placeholder="********"
                />
              </label>
            ) : null}

            {authMode === "register" ? (
              <div className="juez-auth-roles">
                <span className="juez-field-label">Roles</span>
                <div className="juez-role-toggle-row">
                  {(["principal", "secundario", "planillero"] as RefereeRole[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      className={`juez-role-toggle ${authForm.roles[role] ? "is-checked" : ""}`}
                      onClick={() => handleToggleAuthRole(role)}
                    >
                      <span className="juez-role-toggle__dot" />
                      {role === "principal" ? "Juez arriba" : role === "secundario" ? "Juez abajo" : "Planillero"}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <button type="submit" className="juez-button juez-button--primary juez-button--full-mobile">
              {authMode === "login" ? "Entrar" : "Crear cuenta"}
            </button>

            <div className="juez-auth-switch">
              <span>{authMode === "login" ? "¿No tenés cuenta?" : "¿Ya tenés cuenta?"}</span>
              <button
                type="button"
                className="juez-auth-switch__link"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setAuthForm({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    roles: {
                      principal: false,
                      secundario: false,
                      planillero: false
                    }
                  });
                }}
              >
                {authMode === "login" ? "Regístrese aquí" : "Volver al ingreso"}
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
