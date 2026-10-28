import { redirect } from "next/navigation";
import { routes } from "@/shared/config";

export default function HuntersPage() {
  redirect(routes.incidents);
}
