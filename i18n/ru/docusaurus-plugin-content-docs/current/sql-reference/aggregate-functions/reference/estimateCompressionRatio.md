---
description: 'Оценивает коэффициент сжатия указанного столбца без выполнения сжатия.'
sidebar_position: 132
slug: /sql-reference/aggregate-functions/reference/estimateCompressionRatio
title: 'estimateCompressionRatio'
doc_type: 'reference'
---



## estimateCompressionRatio {#estimatecompressionration}

Оценивает коэффициент сжатия указанного столбца без его фактического сжатия.

**Синтаксис**

```sql
estimateCompressionRatio(codec, block_size_bytes)(column)
```

**Аргументы**

- `column` — столбец любого типа.

**Параметры**

- `codec` — [String](../../../sql-reference/data-types/string.md), содержащий [кодек сжатия](/sql-reference/statements/create/table#column_compression_codec) или несколько кодеков, разделённых запятыми, в одной строке.
- `block_size_bytes` — размер блока сжатых данных. Аналогично одновременной установке параметров [`max_compress_block_size`](../../../operations/settings/merge-tree-settings.md#max_compress_block_size) и [`min_compress_block_size`](../../../operations/settings/merge-tree-settings.md#min_compress_block_size). Значение по умолчанию — 1 МиБ (1048576 байт).

Оба параметра являются необязательными.

**Возвращаемое значение**

- Возвращает оценочный коэффициент сжатия для указанного столбца.

Type: [Float64](/sql-reference/data-types/float).

**Примеры**

```sql title="Входная таблица"
CREATE TABLE compression_estimate_example
(
    `number` UInt64
)
ENGINE = MergeTree()
ORDER BY number
SETTINGS min_bytes_for_wide_part = 0;

INSERT INTO compression_estimate_example
SELECT number FROM system.numbers LIMIT 100_000;
```

```sql title="Запрос"
SELECT estimateCompressionRatio(number) AS estimate FROM compression_estimate_example;
```

```text title="Результат"
┌───────────estimate─┐
│ 1.9988506608699999 │
└────────────────────┘
```

:::note
Приведённый выше результат будет отличаться в зависимости от кодека сжатия, используемого на сервере по умолчанию. См. [Кодеки сжатия столбцов](/sql-reference/statements/create/table#column_compression_codec).
:::

```sql title="Запрос"
SELECT estimateCompressionRatio('T64')(number) AS estimate FROM compression_estimate_example;
```

```text title="Результат"
┌──────────estimate─┐
│ 3.762758101688538 │
└───────────────────┘
```

Функция также может принимать несколько кодеков:

```sql title="Запрос"
SELECT estimateCompressionRatio('T64, ZSTD')(number) AS estimate FROM compression_estimate_example;
```

```response title="Результат"
┌───────────estimate─┐
│ 143.60078980434392 │
└────────────────────┘
```
