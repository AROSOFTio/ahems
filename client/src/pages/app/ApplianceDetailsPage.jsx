import { useParams } from "react-router-dom";
import { ModuleWorkspace } from "../../components/ui/ModuleWorkspace";
import { pageContent } from "../../constants/pageContent";

export function ApplianceDetailsPage() {
  const { id } = useParams();

  return (
    <ModuleWorkspace
      content={{
        ...pageContent.appliances,
        eyebrow: "Appliance detail",
        title: `Appliance ${id}`,
        description:
          "Review current state, mode, dimming behavior, runtime estimate, cost contribution, and command history for this appliance.",
      }}
    />
  );
}

