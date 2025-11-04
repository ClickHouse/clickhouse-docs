---
slug: '/sql-reference/table-functions/mergeTreeIndex'
sidebar_label: mergeTreeIndex
sidebar_position: 77
description: 'Представляет содержимое индекса и файлов меток таблиц MergeTree. Он'
title: mergeTreeIndex
doc_type: reference
---
# mergeTreeIndex Табличная Функция

Представляет содержимое индексных и меточных файлов таблиц MergeTree. Может использоваться для интроспекции.

## Синтаксис {#syntax}

```sql
mergeTreeIndex(database, table [, with_marks = true] [, with_minmax = true])
```

## Аргументы {#arguments}

| Аргумент      | Описание                                         |
|---------------|---------------------------------------------------|
| `database`    | Имя базы данных для чтения индекса и меток.      |
| `table`       | Имя таблицы для чтения индекса и меток.          |
| `with_marks`  | Включить ли колонки с метками в результат.       |
| `with_minmax` | Включить ли минимально-максимальный индекс в результат. |

## Возвращаемое значение {#returned_value}

Объект таблицы с колонками значений первичного индекса и минимально-максимального индекса (если включен) исходной таблицы, колонками значений меток (если включены) для всех возможных файлов в частях данных исходной таблицы и виртуальными колонками:

- `part_name` - Имя части данных.
- `mark_number` - Номер текущей метки в части данных.
- `rows_in_granule` - Количество строк в текущей грануле.

Колонка меток может содержать значение `(NULL, NULL)`, если колонка отсутствует в части данных или метки для одного из её подстримов не записаны (например, в компактных частях).

## Пример использования {#usage-example}

```sql
CREATE TABLE test_table
(
    `id` UInt64,
    `n` UInt64,
    `arr` Array(UInt64)
)
ENGINE = MergeTree
ORDER BY id
SETTINGS index_granularity = 3, min_bytes_for_wide_part = 0, min_rows_for_wide_part = 8;

INSERT INTO test_table SELECT number, number, range(number % 5) FROM numbers(5);

INSERT INTO test_table SELECT number, number, range(number % 5) FROM numbers(10, 10);
```

```sql
SELECT * FROM mergeTreeIndex(currentDatabase(), test_table, with_marks = true);
```

```text
┌─part_name─┬─mark_number─┬─rows_in_granule─┬─id─┬─id.mark─┬─n.mark──┬─arr.size0.mark─┬─arr.mark─┐
│ all_1_1_0 │           0 │               3 │  0 │ (0,0)   │ (42,0)  │ (NULL,NULL)    │ (84,0)   │
│ all_1_1_0 │           1 │               2 │  3 │ (133,0) │ (172,0) │ (NULL,NULL)    │ (211,0)  │
│ all_1_1_0 │           2 │               0 │  4 │ (271,0) │ (271,0) │ (NULL,NULL)    │ (271,0)  │
└───────────┴─────────────┴─────────────────┴────┴─────────┴─────────┴────────────────┴──────────┘
┌─part_name─┬─mark_number─┬─rows_in_granule─┬─id─┬─id.mark─┬─n.mark─┬─arr.size0.mark─┬─arr.mark─┐
│ all_2_2_0 │           0 │               3 │ 10 │ (0,0)   │ (0,0)  │ (0,0)          │ (0,0)    │
│ all_2_2_0 │           1 │               3 │ 13 │ (0,24)  │ (0,24) │ (0,24)         │ (0,24)   │
│ all_2_2_0 │           2 │               3 │ 16 │ (0,48)  │ (0,48) │ (0,48)         │ (0,80)   │
│ all_2_2_0 │           3 │               1 │ 19 │ (0,72)  │ (0,72) │ (0,72)         │ (0,128)  │
│ all_2_2_0 │           4 │               0 │ 19 │ (0,80)  │ (0,80) │ (0,80)         │ (0,160)  │
└───────────┴─────────────┴─────────────────┴────┴─────────┴────────┴────────────────┴──────────┘
```

```sql
DESCRIBE mergeTreeIndex(currentDatabase(), test_table, with_marks = true) SETTINGS describe_compact_output = 1;
```

```text
┌─name────────────┬─type─────────────────────────────────────────────────────────────────────────────────────────────┐
│ part_name       │ String                                                                                           │
│ mark_number     │ UInt64                                                                                           │
│ rows_in_granule │ UInt64                                                                                           │
│ id              │ UInt64                                                                                           │
│ id.mark         │ Tuple(offset_in_compressed_file Nullable(UInt64), offset_in_decompressed_block Nullable(UInt64)) │
│ n.mark          │ Tuple(offset_in_compressed_file Nullable(UInt64), offset_in_decompressed_block Nullable(UInt64)) │
│ arr.size0.mark  │ Tuple(offset_in_compressed_file Nullable(UInt64), offset_in_decompressed_block Nullable(UInt64)) │
│ arr.mark        │ Tuple(offset_in_compressed_file Nullable(UInt64), offset_in_decompressed_block Nullable(UInt64)) │
└─────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────┘
```