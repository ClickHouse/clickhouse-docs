---
description: "すべてのテーブルのカラムに関する情報を含むシステムテーブル"
slug: /operations/system-tables/columns
title: "system.columns"
keywords: ["システムテーブル", "カラム"]
---

すべてのテーブルのカラムに関する情報を含んでいます。

このテーブルを使用して、複数のテーブルに対する情報を一度に取得することができます。これは [DESCRIBE TABLE](../../sql-reference/statements/describe-table.md) クエリと似ています。

[一時テーブル](../../sql-reference/statements/create/table.md#temporary-tables) のカラムは、それが作成されたセッション内でのみ `system.columns` に表示されます。これらは空の `database` フィールドとともに表示されます。

`system.columns` テーブルは以下のカラムを含んでいます（カラムの型は括弧内に示されています）：

- `database` ([String](../../sql-reference/data-types/string.md)) — データベース名。
- `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `name` ([String](../../sql-reference/data-types/string.md)) — カラム名。
- `type` ([String](../../sql-reference/data-types/string.md)) — カラムの型。
- `position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — テーブル内のカラムの序数位置（1から始まります）。
- `default_kind` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の表現型（`DEFAULT`, `MATERIALIZED`, `ALIAS`）または未定義の場合は空の文字列。
- `default_expression` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の表現、または未定義の場合は空の文字列。
- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 圧縮データのサイズ（バイト）。
- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 非圧縮データのサイズ（バイト）。
- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークのサイズ（バイト）。
- `comment` ([String](../../sql-reference/data-types/string.md)) — カラムに関するコメント、または未定義の場合は空の文字列。
- `is_in_partition_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — カラムがパーティション式に含まれているかを示すフラグ。
- `is_in_sorting_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — カラムがソートキー式に含まれているかを示すフラグ。
- `is_in_primary_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — カラムが主キー式に含まれているかを示すフラグ。
- `is_in_sampling_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — カラムがサンプリングキー式に含まれているかを示すフラグ。
- `compression_codec` ([String](../../sql-reference/data-types/string.md)) — 圧縮コーデック名。
- `character_octet_length` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — バイナリデータ、文字データ、またはテキストデータおよび画像の最大長（バイト）。ClickHouseでは、`FixedString` データ型にのみ意味があります。それ以外の場合は、`NULL` 値が返されます。
- `numeric_precision` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — おおよその数値データ、正確な数値データ、整数データ、または通貨データの精度。ClickHouseでは、整数型のビット幅と `Decimal` 型の小数精度です。それ以外の場合は、`NULL` 値が返されます。
- `numeric_precision_radix` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — おおよその数値データ、正確な数値データ、整数データ、または通貨データの精度の数値システムの基数。ClickHouseでは、整数型に対しては2、`Decimal` 型に対しては10です。それ以外の場合は、`NULL` 値が返されます。
- `numeric_scale` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — おおよその数値データ、正確な数値データ、整数データ、または通貨データのスケール。ClickHouseでは、`Decimal` 型にのみ意味があります。それ以外の場合は、`NULL` 値が返されます。
- `datetime_precision` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — `DateTime64` データ型の小数精度。その他のデータ型には、`NULL` 値が返されます。

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
