import { useAuth } from "../hooks/useAuth";
import { ShellLayout } from "./ShellLayout";

export function AppLayout() {
  const { user } = useAuth();
  return <ShellLayout scope="app" role={user?.role || "resident"} />;
}
