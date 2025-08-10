// App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MissionPage from "./components/mission/MissionPage";
import MissionResult from "./components/mission/afterConfirmation/MissionResult";

import PrivateRoute from "./auth/PrivateRoute";
import Login from "./auth/Login";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<MissionPage />} />
          <Route path="/mission-result" element={<MissionResult />} />
        </Route>

        {/* Public route – Login */}
        <Route path="/login" element={<Login />} />

        {/* Catch‑all */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
