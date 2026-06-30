import { Routes, Route } from "react-router-dom";
import ScanPage from "./ScanPage";
import AdminApp from "./admin/AdminApp";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ScanPage />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  );
}
