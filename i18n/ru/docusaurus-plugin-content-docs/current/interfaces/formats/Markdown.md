---
title: Markdown
slug: /interfaces/formats/Markdown
keywords: ['Markdown']
---

## Описание {#description}

Вы можете экспортировать результаты в формате [Markdown](https://en.wikipedia.org/wiki/Markdown), чтобы создать вывод, готовый для вставки в ваши `.md` файлы:

Таблица в формате markdown будет сгенерирована автоматически и может быть использована на платформах с поддержкой markdown, таких как Github. Этот формат используется только для вывода.

## Пример использования {#example-usage}

```sql
SELECT
    number,
    number * 2
FROM numbers(5)
FORMAT Markdown
```
```results
| number | multiply(number, 2) |
|-:|-:|
| 0 | 0 |
| 1 | 2 |
| 2 | 4 |
| 3 | 6 |
| 4 | 8 |
```

## Настройки формата {#format-settings}
