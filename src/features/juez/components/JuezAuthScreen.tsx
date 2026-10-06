import { JuezHomePageController } from "../hooks/useJuezHomePageController";

type JuezAuthScreenProps = Pick<JuezHomePageController, "authForm" | "handleAuthSubmit" | "handleChangeAuthField">;

// Login simple (06/10/2026, pedido explicito: "hacerlo bien simple,
// pone un login normal, saca todo eso que tiene" -- sin registro, sin
// roles, sin pruebas rapidas). 2 cuentas fijas: admin/admin y
// usuario/usuario (ver useAuthSession.ts).
export function JuezAuthScreen({ authForm, handleAuthSubmit, handleChangeAuthField }: JuezAuthScreenProps) {
  return (
    <main className="juez-app juez-app--auth">
      <section className="juez-shell juez-shell--auth">
        <section className="juez-auth-card">
          <div className="juez-auth-card__header">
            <p className="juez-eyebrow">SaasPro Juez</p>
            <h1>Ingresar</h1>
          </div>

          <form className="juez-auth-form" onSubmit={handleAuthSubmit}>
            <label className="juez-field">
              <span>Usuario</span>
              <input
                value={authForm.username}
                onChange={(event) => handleChangeAuthField("username", event.target.value)}
                autoFocus
                autoComplete="username"
              />
            </label>

            <label className="juez-field">
              <span>Contraseña</span>
              <input
                type="password"
                value={authForm.password}
                onChange={(event) => handleChangeAuthField("password", event.target.value)}
                autoComplete="current-password"
              />
            </label>

            <button type="submit" className="juez-button juez-button--primary juez-button--full-mobile">
              Entrar
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
