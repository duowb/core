import "./style.scss";
import { FastjsDom, dom } from "jsfast";
import { setupTopbar } from "./components/topbar";
import { setupRouter } from "./router";

import Home from "./pages/home/";
import Sponsor from "./pages/sponsor/";
import NotFound from "./pages/404";
import { mountBackground } from "./components/background/background";

const root = dom.select<FastjsDom>("#app");

setupTopbar(root);
setupRouter(root, [Home, Sponsor], NotFound).render(root);

mountBackground(root);
