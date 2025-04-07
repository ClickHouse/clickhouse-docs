---
description: 'Оценивает коэффициент сжатия заданной колонки без ее сжатия.'
sidebar_position: 132
slug: /sql-reference/aggregate-functions/reference/estimateCompressionRatio
title: 'estimateCompressionRatio'
---

## estimateCompressionRatio {#estimatecompressionration}

Оценивает коэффициент сжатия заданной колонки без ее сжатия.

**Синтаксис**

```sql
estimateCompressionRatio(codec, block_size_bytes)(column)
```

**Аргументы**

- `column` - Колонка любого типа

**Параметры**

- `codec` - [String](../../../sql-reference/data-types/string.md), содержащая [кодек сжатия](/sql-reference/statements/create/table#column_compression_codec) или несколько кодеков, разделенных запятыми, в одной строке.
- `block_size_bytes` - Размер блока сжатых данных. Это похоже на установку как [`max_compress_block_size`](../../../operations/settings/merge-tree-settings.md#max_compress_block_size), так и [`min_compress_block_size`](../../../operations/settings/merge-tree-settings.md#min_compress_block_size). Значение по умолчанию – 1 MiB (1048576 байт).

Оба параметра являются необязательными.

**Возвращаемые значения**

- Возвращает оценочный коэффициент сжатия для заданной колонки.

Тип: [Float64](/sql-reference/data-types/float).

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

```text title="Ответ"
┌───────────estimate─┐
│ 1.9988506608699999 │
└────────────────────┘
```

:::note
Результат выше будет отличаться в зависимости от кодека сжатия по умолчанию на сервере. См. [Кодеки сжатия колонок](/sql-reference/statements/create/table#column_compression_codec).
:::

```sql title="Запрос"
SELECT estimateCompressionRatio('T64')(number) AS estimate FROM compression_estimate_example;
```

```text title="Ответ"
┌──────────estimate─┐
│ 3.762758101688538 │
└───────────────────┘
```

Функция также может указывать несколько кодеков:

```sql title="Запрос"
SELECT estimateCompressionRatio('T64, ZSTD')(number) AS estimate FROM compression_estimate_example;
```

```response title="Ответ"
┌───────────estimate─┐
│ 143.60078980434392 │
└────────────────────┘
```
