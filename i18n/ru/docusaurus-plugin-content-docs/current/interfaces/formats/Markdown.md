---
description: 'Документация для формата Markdown'
keywords: ['Markdown']
slug: /interfaces/formats/Markdown
title: 'Markdown'
---

## Описание {#description}

Вы можете экспортировать результаты в формате [Markdown](https://en.wikipedia.org/wiki/Markdown) для генерации вывода, готового к вставке в ваши `.md` файлы:

Markdown-таблица будет сгенерирована автоматически и может быть использована на платформах, поддерживающих markdown, таких как Github. Этот формат используется только для вывода.

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
