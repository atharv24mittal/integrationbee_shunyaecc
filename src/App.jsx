import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Bracket from "./pages/Bracket";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin-92hd82" element={<Admin />} />
        <Route path="/bracket" element={<Bracket />} />
      </Routes>
    </BrowserRouter>
  );
}