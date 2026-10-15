// Pie de pagina con nuestra propaganda (14/10/2026, pedido explicito:
// mismo pie que armamos en frontend-qq). Logo duplicado a mano en
// public/logoLogicLab.png (decision explicita: nada de alojarlo en otro
// proyecto y apuntar ahi, cada sitio queda autocontenido con su propia
// copia).
//
// Segunda vuelta (mismo dia, pedido explicito): "no quiero que salga
// 'Desarrollado por'... un termino medio, que se vea pero no tome tanto
// protagonismo" -- se saco el chip con fondo/borde y la frase; ahora es
// una sola linea de derechos de autor con el logo chiquito adentro, y el
// contacto de WhatsApp como link discreto debajo.
const LOGICLAB_WHATSAPP_RAW = "092 945 696";

function toWhatsAppNumber(raw: string) {
  const digits = raw.replace(/\D/g, "");
  const withoutLeadingZero = digits.replace(/^0+/, "");
  return withoutLeadingZero.startsWith("598") ? withoutLeadingZero : `598${withoutLeadingZero}`;
}

const LOGICLAB_WHATSAPP_HREF = `https://wa.me/${toWhatsAppNumber(LOGICLAB_WHATSAPP_RAW)}?text=${encodeURIComponent(
  "Hola! Vi el sistema de Juez y quiero consultar por uno para mi negocio."
)}`;

export function Footer() {
  return (
    <footer className="juez-footer">
      <p className="juez-footer-copyright">
        <img src={`${import.meta.env.BASE_URL}logoLogicLab.png`} alt="Logic Lab" className="juez-footer-logo" />©{" "}
        {new Date().getFullYear()} LogicLab. Todos los derechos reservados.
      </p>

      <a href={LOGICLAB_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="juez-footer-contact">
        <svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor" aria-hidden="true" className="juez-footer-whatsapp-icon">
          <path d="M16.02 3C9.4 3 4 8.36 4 15c0 2.28.64 4.42 1.75 6.24L4 29l7.98-1.7A11.9 11.9 0 0 0 16.02 27C22.64 27 28 21.64 28 15S22.64 3 16.02 3Zm6.54 16.9c-.28.79-1.62 1.5-2.24 1.58-.6.08-1.31.11-2.11-.13a19.4 19.4 0 0 1-1.94-.72c-3.42-1.48-5.65-4.91-5.82-5.14-.17-.23-1.39-1.85-1.39-3.52 0-1.67.87-2.49 1.18-2.83.31-.34.68-.42.91-.42.23 0 .45.002.65.011.21.01.49-.08.76.58.28.68.95 2.35 1.03 2.52.08.17.14.37.03.6-.11.23-.17.37-.34.57-.17.2-.36.45-.51.6-.17.17-.35.36-.15.71.2.34.88 1.45 1.89 2.35 1.3 1.16 2.4 1.52 2.74 1.69.34.17.54.14.74-.09.2-.23.85-.99 1.08-1.33.23-.34.46-.28.77-.17.31.11 1.97.93 2.31 1.1.34.17.57.26.65.4.08.14.08.8-.2 1.59Z" />
        </svg>
        {LOGICLAB_WHATSAPP_RAW}
      </a>
    </footer>
  );
}
