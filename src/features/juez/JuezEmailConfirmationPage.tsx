import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./juez.css";
import "./juez.layout.css";
import "./juez.auth.css";
import { confirmJudgeEmail } from "./juez.auth.client";

type ConfirmationState = "loading" | "success" | "error";

export function JuezEmailConfirmationPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [state, setState] = useState<ConfirmationState>("loading");
  const [message, setMessage] = useState("Confirmando el correo...");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Falta el token de confirmacion.");
      return;
    }

    let alive = true;

    confirmJudgeEmail(token)
      .then(() => {
        if (!alive) return;
        setState("success");
        setMessage("Tu correo quedo confirmado. Ya podes volver e iniciar sesion.");
      })
      .catch((error: unknown) => {
        if (!alive) return;
        setState("error");
        setMessage(error instanceof Error ? error.message : "No se pudo confirmar el correo.");
      });

    return () => {
      alive = false;
    };
  }, [token]);

  return (
    <main className="juez-app">
      <section className="juez-shell juez-shell--auth">
        <article className="juez-auth-card">
          <p className="juez-eyebrow">SaasPro</p>
          <h1 className="juez-title" style={{ color: "#0f172a", marginBottom: "12px" }}>
            Confirmacion de correo
          </h1>
          <p className="juez-section-copy">{message}</p>
          <div className="juez-inline-actions" style={{ marginTop: "18px" }}>
            <Link className="juez-button juez-button--primary" to="/">
              Volver al inicio
            </Link>
          </div>
          {state === "loading" ? <p className="juez-section-copy">Esto lleva un momento.</p> : null}
        </article>
      </section>
    </main>
  );
}
