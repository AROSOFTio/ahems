import { ModuleWorkspace } from "../../components/ui/ModuleWorkspace";
import { pageContent } from "../../constants/pageContent";

export function UsersPage() {
  return <ModuleWorkspace content={pageContent.adminUsers} />;
}

