import { PageHeader, pageStackClass } from "@/shared/ui/page-header";

// Заглушка: экрана «Главная» в макете пока нет
export function HomePage() {
  return (
    <section className={pageStackClass}>
      <PageHeader title="Главная" description="Раздел в разработке" />
    </section>
  );
}
