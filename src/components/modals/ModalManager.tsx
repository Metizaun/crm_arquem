import { useApp } from "@/context/AppContext";
import { LeadModal } from "./LeadModal";
import { LeadDrawer } from "@/components/drawers/LeadDrawer";

export function ModalManager() {
  const { ui, closeModal } = useApp();

  return (
    <>
      {ui.modal?.type === "createLead" && (
        <LeadModal isOpen={true} onClose={closeModal} />
      )}

      <LeadDrawer />
    </>
  );
}
