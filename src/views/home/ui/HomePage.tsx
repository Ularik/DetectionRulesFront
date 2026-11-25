// Заглушка: экрана «Главная» в макете пока нет
export function HomePage() {
  return (
    <section className="flex flex-col gap-[18px]">
      <div className="w-fit rounded-xl bg-brand-soft/40 px-3 py-1.5">
        <h1 className="text-base font-medium text-brand-light">Главная</h1>
        <p className="text-xs text-ink-muted">Раздел в разработке</p>
      </div>
    </section>
  );
}
