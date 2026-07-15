import { Navigate, Route, Routes } from "react-router-dom";
import { JuezHomePage } from "../features/juez/JuezHomePage";
import { JuezEmailConfirmationPage } from "../features/juez/JuezEmailConfirmationPage";

function HealthPage() {
  return (
    <main style={{ fontFamily: "Inter, Segoe UI, sans-serif", padding: "2rem" }}>
      <h2>Frontend Juez OK</h2>
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<JuezHomePage />} />
      <Route path="/verify-email" element={<JuezEmailConfirmationPage />} />
      <Route path="/health" element={<HealthPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
