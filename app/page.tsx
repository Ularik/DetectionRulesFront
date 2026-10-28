import { redirect } from "next/navigation";
import { routes } from "@/shared/config";

export default function Page() {
  redirect(routes.login);
}
