import { routes } from "@/shared/config/routes";
import { RouteModal } from "@/shared/ui/route-modal";
import { IncidentsTable, SourceIpIncidents } from "@/widgets/incidents-table";

// Прямой заход/F5 на /admin/incidents/ip/[sourceIp]: перехвата нет, поэтому сами рисуем
// список инцидентов подложкой и ту же модалку поверх, как при переходе из приложения.
// Закрытие ведёт на список (replace), т.к. в истории может не быть предыдущей страницы
export function SourceIpIncidentsPage({ sourceIp }: { sourceIp: string }) {
  return (
    <>
      <IncidentsTable />
      <RouteModal
        title={`Инциденты ${sourceIp}`}
        className="block gap-0 overflow-hidden rounded-[20px] border-0 p-0 shadow-[0_12px_32px_rgba(0,0,0,0.08)] sm:max-w-[min(1281px,calc(100%-2rem))]"
        closeClassName="top-[18px]"
        closeHref={routes.incidents}
      >
        <SourceIpIncidents sourceIp={sourceIp} variant="modal" />
      </RouteModal>
    </>
  );
}
