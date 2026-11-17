import { signOut } from "firebase/auth";
import { NavLink, Outlet } from "react-router-dom";
import { auth } from "../firebase";

export default function AdminLayout() {
  return (
    <div className="admin">
      <aside className="sidebar">
        <div className="sidebar-title">Admin</div>

        <nav className="side-nav">
          <NavLink to="/admin" end>Dashboard</NavLink>
          <NavLink to="/admin/header">Header</NavLink>
          <NavLink to="/admin/menu">Menu</NavLink>
          <NavLink to="/admin/pages">Pages</NavLink>
        </nav>

        <button className="logout" onClick={() => signOut(auth)}>
          Logout
        </button>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}