---
alias: []
description: 'Документация для формата One'
input_format: true
keywords: ['One']
output_format: false
slug: /interfaces/formats/One
title: 'One'
---

| Вход     | Выход   | Псевдоним |
|----------|---------|-----------|
| ✔        | ✗       |           |

## Описание {#description}

Формат `One` является специальным входным форматом, который не считывает никаких данных из файла и возвращает только одну строку со столбцом типа [`UInt8`](../../sql-reference/data-types/int-uint.md), именем `dummy` и значением `0` (как таблица `system.one`).  
Может использоваться с виртуальными столбцами `_file/_path` для перечисления всех файлов без считывания фактических данных.

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
