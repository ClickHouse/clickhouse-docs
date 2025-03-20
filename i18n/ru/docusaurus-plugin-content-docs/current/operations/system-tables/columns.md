---
description: 'Системная таблица, содержащая информацию о колонках во всех таблицах'
slug: /operations/system-tables/columns
title: 'system.columns'
keywords: ['системная таблица', 'колонки']
---

Содержит информацию о колонках во всех таблицах.

Вы можете использовать эту таблицу для получения информации, аналогичной запросу [DESCRIBE TABLE](../../sql-reference/statements/describe-table.md), но для нескольких таблиц одновременно.

Колонки из [временных таблиц](../../sql-reference/statements/create/table.md#temporary-tables) видны в `system.columns` только в тех сессиях, где они были созданы. Они отображаются с пустым полем `database`.

Таблица `system.columns` содержит следующие колонки (тип колонки указан в скобках):

- `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных.
- `table` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы.
- `name` ([String](../../sql-reference/data-types/string.md)) — Имя колонки.
- `type` ([String](../../sql-reference/data-types/string.md)) — Тип колонки.
- `position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Порядковый номер колонки в таблице, начиная с 1.
- `default_kind` ([String](../../sql-reference/data-types/string.md)) — Тип выражения (`DEFAULT`, `MATERIALIZED`, `ALIAS`) для значения по умолчанию или пустая строка, если не определено.
- `default_expression` ([String](../../sql-reference/data-types/string.md)) — Выражение для значения по умолчанию или пустая строка, если не определено.
- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Размер сжатых данных в байтах.
- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Размер несжатых данных в байтах.
- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Размер меток в байтах.
- `comment` ([String](../../sql-reference/data-types/string.md)) — Комментарий к колонке или пустая строка, если не определено.
- `is_in_partition_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Флаг, указывающий, находится ли колонка в выражении партиции.
- `is_in_sorting_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Флаг, указывающий, находится ли колонка в выражении сортировки.
- `is_in_primary_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Флаг, указывающий, находится ли колонка в выражении первичного ключа.
- `is_in_sampling_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Флаг, указывающий, находится ли колонка в выражении выборки.
- `compression_codec` ([String](../../sql-reference/data-types/string.md)) — Имя кодека сжатия.
- `character_octet_length` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальная длина в байтах для двоичных данных, символьных данных, текстовых данных и изображений. В ClickHouse имеет смысл только для типа данных `FixedString`. В противном случае возвращается значение `NULL`.
- `numeric_precision` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Точность приблизительных числовых данных, точных числовых данных, целочисленных данных или денежных данных. В ClickHouse это ширина бита для целочисленных типов и десятичная точность для типов `Decimal`. В противном случае возвращается значение `NULL`.
- `numeric_precision_radix` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Основание числовой системы, точность приблизительных числовых данных, точных числовых данных, целочисленных данных или денежных данных. В ClickHouse это 2 для целочисленных типов и 10 для типов `Decimal`. В противном случае возвращается значение `NULL`.
- `numeric_scale` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Масштаб приблизительных числовых данных, точных числовых данных, целочисленных данных или денежных данных. В ClickHouse имеет смысл только для типов `Decimal`. В противном случае возвращается значение `NULL`.
- `datetime_precision` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Десятичная точность типа данных `DateTime64`. Для других типов данных возвращается значение `NULL`.

**Пример**

```sql
SELECT * FROM system.columns LIMIT 2 FORMAT Vertical;
```

```text
Row 1:
──────
database:                INFORMATION_SCHEMA
table:                   COLUMNS
name:                    table_catalog
type:                    String
position:                1
default_kind:
default_expression:
data_compressed_bytes:   0
data_uncompressed_bytes: 0
marks_bytes:             0
comment:
is_in_partition_key:     0
is_in_sorting_key:       0
is_in_primary_key:       0
is_in_sampling_key:      0
compression_codec:
character_octet_length:  ᴺᵁᴸᴸ
numeric_precision:       ᴺᵁᴸᴸ
numeric_precision_radix: ᴺᵁᴸᴸ
numeric_scale:           ᴺᵁᴸᴸ
datetime_precision:      ᴺᵁᴸᴸ

Row 2:
──────
database:                INFORMATION_SCHEMA
table:                   COLUMNS
name:                    table_schema
type:                    String
position:                2
default_kind:
default_expression:
data_compressed_bytes:   0
data_uncompressed_bytes: 0
marks_bytes:             0
comment:
is_in_partition_key:     0
is_in_sorting_key:       0
is_in_primary_key:       0
is_in_sampling_key:      0
compression_codec:
character_octet_length:  ᴺᵁᴸᴸ
numeric_precision:       ᴺᵁᴸᴸ
numeric_precision_radix: ᴺᵁᴸᴸ
numeric_scale:           ᴺᵁᴸᴸ
datetime_precision:      ᴺᵁᴸᴸ
```
