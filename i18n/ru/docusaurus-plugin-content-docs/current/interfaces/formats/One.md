---
alias: []
description: 'Документация по формату One'
input_format: true
keywords: ['One']
output_format: false
slug: /interfaces/formats/One
title: 'One'
doc_type: 'reference'
---

| Входные данные | Выходные данные | Псевдоним |
|----------------|-----------------|-----------|
| ✔              | ✗               |           |



## Описание {#description}

Формат `One` — это специальный входной формат, который не читает данные из файла и возвращает только одну строку со столбцом типа [`UInt8`](../../sql-reference/data-types/int-uint.md) с именем `dummy` и значением `0` (как в таблице `system.one`).
Может использоваться с виртуальными столбцами `_file/_path` для получения списка всех файлов без чтения их содержимого.


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
