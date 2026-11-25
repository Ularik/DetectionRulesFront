import { RouteModal } from "@/shared/ui/route-modal";
import { SourceIpIncidents } from "@/widgets/incidents-table";

// Все инциденты одного source_ip поверх списка инцидентов (макет CERT-KG SIEM, Figma 110:312).
// Клик по строке открывает детальную модалку инцидента, «назад» возвращает к этой таблице
export function SourceIpIncidentsModalPage({
  sourceIp,
  closeHref,
}: {
  sourceIp: string;
  /** Задаётся при прямом заходе/F5, когда закрытие должно вести на список, а не назад */
  closeHref?: string;
}) {
  return (
    <RouteModal
      title={`Инциденты ${sourceIp}`}
      className="block gap-0 overflow-hidden rounded-[20px] border-0 p-0 shadow-[0_12px_32px_rgba(0,0,0,0.08)] sm:max-w-[min(1281px,calc(100%-2rem))]"
      closeClassName="top-[18px]"
      closeHref={closeHref}
    >
      <SourceIpIncidents sourceIp={sourceIp} variant="modal" />
    </RouteModal>
  );
}
