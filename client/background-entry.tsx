import React from "react";
import ReactDOM from "react-dom/client";
import BackgroundPaths from "./BackgroundPaths";

const el = document.getElementById("bg-paths-root");
if (el) {
  ReactDOM.createRoot(el).render(<BackgroundPaths />);
}
