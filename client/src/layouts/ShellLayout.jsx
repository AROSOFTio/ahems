import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/navigation/Sidebar";
import { Topbar } from "../components/navigation/Topbar";

export function ShellLayout({ role, scope }) {
  return (
    <div className="min-h-screen">
      <Sidebar role={role} scope={scope} />
      <div className="min-h-screen">
        <Topbar role={role} scope={scope} />
        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 xl:pl-80">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
