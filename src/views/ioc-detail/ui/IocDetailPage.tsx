import { IocDetails } from "@/widgets/ioc-details";

export function IocDetailPage({ iocId }: { iocId: string }) {
  return <IocDetails iocId={iocId} />;
}
