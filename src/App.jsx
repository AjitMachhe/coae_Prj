import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./pages/Login";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import HeaderSettings from "./admin/HeaderSettings";
import MenuManager from "./admin/MenuManager";
import MegaEditor from "./admin/MegaEditor";
import PagesList from "./admin/PagesList";
import PageEditor from "./admin/PageEditor";
import SiteLayout from "./site/SiteLayout";
import Home from "./site/Home";
import PageView from "./site/PageView";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/:slug" element={<PageView />} />
          </Route>

          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="header" element={<HeaderSettings />} />
            <Route path="menu" element={<MenuManager />} />
            <Route path="mega/:id" element={<MegaEditor />} />
            <Route path="pages" element={<PagesList />} />
            <Route path="pages/new" element={<PageEditor />} />
            <Route path="pages/:id" element={<PageEditor />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}