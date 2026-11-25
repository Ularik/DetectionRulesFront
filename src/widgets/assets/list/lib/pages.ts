/** Номера страниц для пагинации макета: 1 2 3 … 250 (null — многоточие) */
export function getPageItems(page: number, totalPages: number): Array<number | null> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((item) => pages.add(item));
  if (page >= totalPages - 2) [totalPages - 3, totalPages - 2, totalPages - 1].forEach((item) => pages.add(item));

  const sorted = [...pages].filter((item) => item >= 1 && item <= totalPages).sort((a, b) => a - b);
  return sorted.flatMap((item, index) =>
    index > 0 && item - sorted[index - 1] > 1 ? [null, item] : [item],
  );
}
