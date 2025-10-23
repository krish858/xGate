import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import Api from "./pages/Api";
import Wss from "./pages/Wss";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/api" element={<Api />} />
      <Route path="/wss" element={<Wss />} />
    </Routes>
  );
}

export default App;
