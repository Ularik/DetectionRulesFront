import { redirect } from "next/navigation";
import { routes } from "@/shared/config";

export default async function Page({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  // params уже URL-кодированы: декодируем, чтобы routes.scenario не закодировал дважды
  redirect(routes.scenario(decodeURIComponent(scenarioId)));
}
