import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Слой страниц называется `views`, а не `pages` (см. spec.md, 4.2), и Steiger его не видит:
    // ссылки из views не учитываются, поэтому правило ложно считает виджеты и фичи
    // неиспользуемыми или используемыми один раз
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
  {
    // providers — устоявшееся имя сегмента для React-провайдеров слоя app
    files: ["./src/app/**"],
    rules: {
      "fsd/segments-by-purpose": "off",
    },
  },
]);
