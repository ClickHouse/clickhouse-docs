---
alias: []
description: 'Документация для формата One'
input_format: true
keywords: ['One']
output_format: false
slug: /interfaces/formats/One
title: 'One'
---


| Входные данные | Выходные данные | Псевдоним |
|----------------|----------------|-----------|
| ✔              | ✗              |           |

## Описание {#description}

Формат `One` является специальным форматом ввода, который не читает никаких данных из файла и возвращает только одну строку с колонкой типа [`UInt8`](../../sql-reference/data-types/int-uint.md), именем `dummy` и значением `0` (аналогично таблице `system.one`). 
Может использоваться с виртуальными колонками `_file/_path` для перечисления всех файлов без чтения фактических данных.

## Пример использования {#example-usage}

Пример:

```sql title="Запрос"
SELECT _file FROM file('path/to/files/data*', One);
```

```text title="Ответ"
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
