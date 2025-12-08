---
alias: ['MD']
description: 'Документация по формату Markdown'
keywords: ['Markdown']
slug: /interfaces/formats/Markdown
title: 'Markdown'
doc_type: 'reference'
---

| Вход | Выход | Сокращение |
|-------|--------|-------|
| ✗     | ✔      | `MD`  |

## Описание {#description}

Вы можете экспортировать результаты в формате [Markdown](https://en.wikipedia.org/wiki/Markdown), чтобы получить данные, готовые для вставки в ваши файлы `.md`:

Таблица в формате Markdown будет сгенерирована автоматически и может использоваться на платформах с поддержкой Markdown, таких как GitHub. Этот формат используется только для представления результатов.

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

## Параметры форматирования {#format-settings}