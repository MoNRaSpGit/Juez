import "./juez.css";
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
