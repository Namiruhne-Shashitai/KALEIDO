import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

function PwaBootstrap() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
          // Offline support is an enhancement; the app remains fully usable without it.
        });
      }, { once: true });
    }
  }, []);

  return null;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PwaBootstrap />
    <App />
  </React.StrictMode>,
);
