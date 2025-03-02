import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Import i18n configuration
import "./lib/i18n";
// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")!).render(<App />);
