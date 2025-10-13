---
slug: '/interfaces/formats/One'
description: 'Документация по формату One'
title: One
keywords: ['One']
doc_type: reference
input_format: true
output_format: false
---
| Вход | Выход | Псевдоним |
|------|-------|-----------|
| ✔    | ✗     |           |

## Описание {#description}

Формат `One` — это специальный формат ввода, который не считывает данные из файла и возвращает только одну строку с колонкой типа [`UInt8`](../../sql-reference/data-types/int-uint.md), с именем `dummy` и значением `0` (аналогично таблице `system.one`).
Может быть использован с виртуальными колонками `_file/_path` для перечисления всех файлов без считывания фактических данных.

## Пример использования {#example-usage}

Пример:

```sql title="Query"
SELECT _file FROM file('path/to/files/data*', One);
```

```text title="Response"
┌─_file────┐
│ data.csv │
└──────────┘
┌─_file──────┐
│ data.jsonl │
└────────────┘
┌─_file────┐
│ data.tsv │
└──────────┘
┌─_file────────┐
│ data.parquet │
└──────────────┘
```

## Настройки формата {#format-settings}