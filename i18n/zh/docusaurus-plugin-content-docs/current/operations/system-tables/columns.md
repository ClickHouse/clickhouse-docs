包含所有表中列的信息。

您可以使用此表获取类似于 [DESCRIBE TABLE](../../sql-reference/statements/describe-table.md) 查询的信息，但可以同时针对多个表。

来自 [临时表](../../sql-reference/statements/create/table.md#temporary-tables) 的列仅在创建它们的会话中可见。它们的 `database` 字段为空。

`system.columns` 表包含以下列（列类型在括号内显示）：

- `database` ([String](../../sql-reference/data-types/string.md)) — 数据库名称。
- `table` ([String](../../sql-reference/data-types/string.md)) — 表名称。
- `name` ([String](../../sql-reference/data-types/string.md)) — 列名称。
- `type` ([String](../../sql-reference/data-types/string.md)) — 列类型。
- `position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 表中列的顺序位置，从 1 开始。
- `default_kind` ([String](../../sql-reference/data-types/string.md)) — 默认值的表达式类型（`DEFAULT`、`MATERIALIZED`、`ALIAS`），如果未定义，则为空字符串。
- `default_expression` ([String](../../sql-reference/data-types/string.md)) — 默认值的表达式，如果未定义，则为空字符串。
- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 压缩数据的大小，以字节为单位。
- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 解压缩数据的大小，以字节为单位。
- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 标记的大小，以字节为单位。
- `comment` ([String](../../sql-reference/data-types/string.md)) — 列的注释，如果未定义，则为空字符串。
- `is_in_partition_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 表示列是否在分区表达式中的标志。
- `is_in_sorting_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 表示列是否在排序键表达式中的标志。
- `is_in_primary_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 表示列是否在主键表达式中的标志。
- `is_in_sampling_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 表示列是否在采样键表达式中的标志。
- `compression_codec` ([String](../../sql-reference/data-types/string.md)) — 压缩编解码器名称。
- `character_octet_length` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 二进制数据、字符数据或文本数据和图像的最大字节长度。在 ClickHouse 中，仅对 `FixedString` 数据类型有效。否则，将返回 `NULL` 值。
- `numeric_precision` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 近似数值数据、精确数值数据、整数数据或货币数据的精度。在 ClickHouse 中，它是整数类型的位宽和 `Decimal` 类型的小数精度。否则，将返回 `NULL` 值。
- `numeric_precision_radix` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 数字系统的基数是近似数值数据、精确数值数据、整数数据或货币数据的精度。在 ClickHouse 中，整数类型为 2，`Decimal` 类型为 10。否则，将返回 `NULL` 值。
- `numeric_scale` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 近似数值数据、精确数值数据、整数数据或货币数据的规模。在 ClickHouse 中，仅对 `Decimal` 类型有效。否则，将返回 `NULL` 值。
- `datetime_precision` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — `DateTime64` 数据类型的小数精度。对于其他数据类型，将返回 `NULL` 值。

**示例**

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
