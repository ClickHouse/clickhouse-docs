---
slug: '/interfaces/formats/Markdown'
description: 'Документация для формата Markdown'
title: Markdown
keywords: ['Markdown']
doc_type: reference
---
## Описание {#description}

Вы можете экспортировать результаты в формате [Markdown](https://en.wikipedia.org/wiki/Markdown) для генерации вывода, готового для вставки в ваши `.md` файлы:

Таблица markdown будет сгенерирована автоматически и может быть использована на платформах, поддерживающих markdown, таких как Github. Этот формат используется только для вывода.

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