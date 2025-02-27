---
description: "すべてのテーブルのカラムに関する情報を含むシステムテーブル"
slug: /operations/system-tables/columns
title: "カラム"
keywords: ["システムテーブル", "カラム"]
---

すべてのテーブルのカラムに関する情報を含みます。

このテーブルを使用して、複数のテーブルに対する情報を、一度に取得することができます。これは、[DESCRIBE TABLE](../../sql-reference/statements/describe-table.md) クエリに類似しています。

[一時テーブル](../../sql-reference/statements/create/table.md#temporary-tables)のカラムは、それらが作成されたセッション内でのみ `system.columns` に表示されます。この場合、`database` フィールドは空で表示されます。

`system.columns` テーブルには、以下のカラムが含まれています（カラムのタイプは括弧内に示されています）：

- `database` ([String](../../sql-reference/data-types/string.md)) — データベース名。
- `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `name` ([String](../../sql-reference/data-types/string.md)) — カラム名。
- `type` ([String](../../sql-reference/data-types/string.md)) — カラムタイプ。
- `position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — テーブル内のカラムの順序位置（1から始まります）。
- `default_kind` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の式タイプ (`DEFAULT`, `MATERIALIZED`, `ALIAS`)、または未定義の場合は空の文字列。
- `default_expression` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の式、または未定義の場合は空の文字列。
- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 圧縮データのサイズ（バイト数）。
- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 非圧縮データのサイズ（バイト数）。
- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークのサイズ（バイト数）。
- `comment` ([String](../../sql-reference/data-types/string.md)) — カラムに関するコメント、または未定義の場合は空の文字列。
- `is_in_partition_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — カラムがパーティション式に含まれているかどうかを示すフラグ。
- `is_in_sorting_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — カラムがソートキー式に含まれているかどうかを示すフラグ。
- `is_in_primary_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — カラムが主キー式に含まれているかどうかを示すフラグ。
- `is_in_sampling_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — カラムがサンプリングキー式に含まれているかどうかを示すフラグ。
- `compression_codec` ([String](../../sql-reference/data-types/string.md)) — 圧縮コーデック名。
- `character_octet_length` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — バイナリデータ、文字データ、テキストデータ、および画像の最大長（バイト単位）。ClickHouseでは `FixedString` データ型にのみ意味があります。それ以外の場合は `NULL` 値が返されます。
- `numeric_precision` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — おおよその数値データ、正確な数値データ、整数データまたは金銭データの精度。ClickHouseでは整数型のビット幅および `Decimal` 型の小数精度です。それ以外の場合は `NULL` 値が返されます。
- `numeric_precision_radix` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — おおよその数値データ、正確な数値データ、整数データまたは金銭データの精度としての数値システムの基数。ClickHouseでは整数型のために2、`Decimal` 型のために10です。それ以外の場合は `NULL` 値が返されます。
- `numeric_scale` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — おおよその数値データ、正確な数値データ、整数データ、または金銭データのスケール。ClickHouseでは `Decimal` 型にのみ意味があります。それ以外の場合は `NULL` 値が返されます。
- `datetime_precision` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — `DateTime64` データ型の小数精度。他のデータ型の場合は `NULL` 値が返されます。

**例**

```sql
SELECT * FROM system.columns LIMIT 2 FORMAT Vertical;
```

```text
行 1:
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

行 2:
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
