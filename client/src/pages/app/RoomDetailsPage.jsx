import { useParams } from "react-router-dom";
import { ModuleWorkspace } from "../../components/ui/ModuleWorkspace";
import { pageContent } from "../../constants/pageContent";

export function RoomDetailsPage() {
  const { id } = useParams();

  return (
    <ModuleWorkspace
      content={{
        ...pageContent.rooms,
        eyebrow: "Room detail",
        title: `Room ${id}`,
        description:
          "Inspect thresholds, occupancy history, assigned appliances, energy contribution, and current simulation posture for this room.",
      }}
    />
  );
}

