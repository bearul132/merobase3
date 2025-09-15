import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import SampleDetail from "./SampleDetail.jsx"; // 👈 make sure to create this file

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/sample/:id" element={<SampleDetail />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
