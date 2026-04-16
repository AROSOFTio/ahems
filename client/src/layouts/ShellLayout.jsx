import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/navigation/Sidebar";
import { Topbar } from "../components/navigation/Topbar";

export function ShellLayout({ role }) {
  return (
    <div className="min-h-screen">
      <Sidebar role={role} />
      <div className="min-h-screen">
        <Topbar role={role} />
        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 xl:pl-80">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

