description: 'すべてのテーブルのカラムに関する情報を含むシステムテーブル'
keywords: ['system table', 'columns']
slug: /operations/system-tables/columns
title: 'system.columns'
```

Contains information about columns in all tables.

You can use this table to get information similar to the [DESCRIBE TABLE](../../sql-reference/statements/describe-table.md) クエリ, but for multiple tables at once.

Columns from [temporary tables](../../sql-reference/statements/create/table.md#temporary-tables) are visible in the `system.columns` only in those session where they have been created. They are shown with the empty `database` field.

The `system.columns` table contains the following columns (the column type is shown in brackets):

- `database` ([String](../../sql-reference/data-types/string.md)) — データベース名.
- `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名.
- `name` ([String](../../sql-reference/data-types/string.md)) — カラム名.
- `type` ([String](../../sql-reference/data-types/string.md)) — カラムタイプ.
- `position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — テーブル内のカラムの順序位置（1から始まる）.
- `default_kind` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の式タイプ（`DEFAULT`, `MATERIALIZED`, `ALIAS`）、定義されていない場合は空文字.
- `default_expression` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の式、定義されていない場合は空文字.
- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 圧縮データのサイズ（バイト単位）.
- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 解凍データのサイズ（バイト単位）.
- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークのサイズ（バイト単位）.
- `comment` ([String](../../sql-reference/data-types/string.md)) — カラムに関するコメント、定義されていない場合は空文字.
- `is_in_partition_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — カラムがパーティション式に含まれているかどうかを示すフラグ.
- `is_in_sorting_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — カラムがソートキー式に含まれているかどうかを示すフラグ.
- `is_in_primary_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — カラムが主キー式に含まれているかどうかを示すフラグ.
- `is_in_sampling_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — カラムがサンプリングキー式に含まれているかどうかを示すフラグ.
- `compression_codec` ([String](../../sql-reference/data-types/string.md)) — 圧縮コーデック名.
- `character_octet_length` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — バイナリデータ、文字データ、テキストデータおよび画像の最大バイト長。ClickHouseでは`FixedString`データタイプに対してのみ意味があります。それ以外の場合は`NULL`値が返されます.
- `numeric_precision` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — おおよその数値データ、正確な数値データ、整数データまたは貨幣データの精度。ClickHouseでは整数型のビット幅と`Decimal`型の小数精度です。それ以外の場合は`NULL`値が返されます.
- `numeric_precision_radix` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — おおよその数値データ、正確な数値データ、整数データまたは貨幣データの精度の数値システムの基数。ClickHouseでは整数型の2と`Decimal`型の10です。それ以外の場合は`NULL`値が返されます.
- `numeric_scale` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — おおよその数値データ、正確な数値データ、整数データまたは貨幣データのスケール。ClickHouseでは`Decimal`型に対してのみ意味があります。それ以外の場合は`NULL`値が返されます.
- `datetime_precision` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — `DateTime64`データタイプの小数精度。他のデータタイプの場合は`NULL`値が返されます.

**Example**

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
