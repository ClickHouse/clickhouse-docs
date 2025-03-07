---
title: Один
slug: /interfaces/formats/One
keywords: ['One']
input_format: true
output_format: false
alias: []
---


| Ввод | Вывод | Псевдоним |
|-------|--------|-------|
| ✔     | ✗      |       |

## Описание {#description}

Формат `One` — это специальный формат ввода, который не считывает данные из файла и возвращает только одну строку с колонкой типа [`UInt8`](../../sql-reference/data-types/int-uint.md), названием `dummy` и значением `0` (как в таблице `system.one`). 
Может использоваться с виртуальными колонками `_file/_path`, чтобы перечислить все файлы без чтения фактических данных.

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
