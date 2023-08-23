import "./index.css";
import { render } from "solid-js/web";
import { lazy } from "solid-js";
import { Router, Routes, Route } from "@solidjs/router";
import HomePage from "./pages/home";

const ChatPage = lazy(() => import("./pages/chat"));

const root = document.getElementById("root");

render(
  () => (
    <Router>
      <Routes>
        <Route path="/" component={HomePage} />
        <Route path="/chat" component={ChatPage} />
      </Routes>
    </Router>
  ),
  root!
);
