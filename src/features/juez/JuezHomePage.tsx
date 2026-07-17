import "./juez.shell.css";
import "./juez.topbar.css";
import "./juez.forms.css";
import "./juez.matches.css";
import "./juez.modal.css";
import "./juez.referee.css";
import "./juez.mobile.css";
import "./juez.desktop.css";
import "./juez.layout.css";
import "./juez.auth.css";
import { JuezAuthScreen } from "./components/JuezAuthScreen";
import { JuezDashboardScreen } from "./components/JuezDashboardScreen";
import { useJuezHomePageController } from "./hooks/useJuezHomePageController";

export function JuezHomePage() {
  const controller = useJuezHomePageController();

  if (!controller.currentUser) {
    return <JuezAuthScreen {...controller} />;
  }

  return <JuezDashboardScreen {...controller} />;
}
