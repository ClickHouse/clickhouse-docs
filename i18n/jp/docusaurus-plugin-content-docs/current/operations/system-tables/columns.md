---
'description': '全テーブルのカラムに関する情報を含むシステムテーブル'
'keywords':
- 'system table'
- 'columns'
'slug': '/operations/system-tables/columns'
'title': 'system.columns'
'doc_type': 'reference'
---

カラムに関する情報をすべてのテーブルから取得できます。

このテーブルを使用して、複数のテーブルに対して同時に情報を取得できる [DESCRIBE TABLE](../../sql-reference/statements/describe-table.md) クエリと類似の情報を得ることができます。

[一時テーブル](../../sql-reference/statements/create/table.md#temporary-tables)のカラムは、作成されたセッションでのみ `system.columns` に表示されます。これらは空の `database` フィールドで示されます。

`system.columns` テーブルには以下のカラムが含まれています（カラムタイプは括弧内に示されています）：

- `database` （[String](../../sql-reference/data-types/string.md)） — データベース名。
- `table` （[String](../../sql-reference/data-types/string.md)） — テーブル名。
- `name` （[String](../../sql-reference/data-types/string.md)） — カラム名。
- `type` （[String](../../sql-reference/data-types/string.md)） — カラムタイプ。
- `position` （[UInt64](../../sql-reference/data-types/int-uint.md)） — テーブルにおけるカラムの序列位置（1から始まる）。
- `default_kind` （[String](../../sql-reference/data-types/string.md)） — デフォルト値の式タイプ（`DEFAULT`、`MATERIALIZED`、`ALIAS`）、未定義の場合は空文字列。
- `default_expression` （[String](../../sql-reference/data-types/string.md)） — デフォルト値の式、未定義の場合は空文字列。
- `data_compressed_bytes` （[UInt64](../../sql-reference/data-types/int-uint.md)） — 圧縮データのサイズ（バイト単位）。
- `data_uncompressed_bytes` （[UInt64](../../sql-reference/data-types/int-uint.md)） — 非圧縮データのサイズ（バイト単位）。
- `marks_bytes` （[UInt64](../../sql-reference/data-types/int-uint.md)） — マークのサイズ（バイト単位）。
- `comment` （[String](../../sql-reference/data-types/string.md)） — カラムに関するコメント、未定義の場合は空文字列。
- `is_in_partition_key` （[UInt8](../../sql-reference/data-types/int-uint.md)） — カラムがパーティション式に含まれているかどうかを示すフラグ。
- `is_in_sorting_key` （[UInt8](../../sql-reference/data-types/int-uint.md)） — カラムがソートキー式に含まれているかどうかを示すフラグ。
- `is_in_primary_key` （[UInt8](../../sql-reference/data-types/int-uint.md)） — カラムが主キー式に含まれているかどうかを示すフラグ。
- `is_in_sampling_key` （[UInt8](../../sql-reference/data-types/int-uint.md)） — カラムがサンプリングキー式に含まれているかどうかを示すフラグ。
- `compression_codec` （[String](../../sql-reference/data-types/string.md)） — 圧縮コーデックの名前。
- `character_octet_length` （[Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)）） — バイナリデータ、文字データ、テキストデータ、画像の最大長（バイト単位）。ClickHouseでは `FixedString` データタイプに対してのみ意味を持ちます。それ以外の場合は `NULL` 値が返されます。
- `numeric_precision` （[Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)）） — おおよその数値データ、正確な数値データ、整数データ、または金銭データの精度。ClickHouseでは整数タイプのビット幅と `Decimal` タイプの小数精度です。それ以外の場合は `NULL` 値が返されます。
- `numeric_precision_radix` （[Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)）） — おおよその数値データ、正確な数値データ、整数データ、または金銭データの精度を表す数値システムの基数。ClickHouseでは整数タイプには 2、`Decimal` タイプには 10 が対応します。それ以外の場合は `NULL` 値が返されます。
- `numeric_scale` （[Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)）） — おおよその数値データ、正確な数値データ、整数データ、または金銭データのスケール。ClickHouseでは `Decimal` タイプに対してのみ意味を持ちます。それ以外の場合は `NULL` 値が返されます。
- `datetime_precision` （[Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)）） — `DateTime64` データタイプの小数精度。その他のデータタイプでは `NULL` 値が返されます。

**例**

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
