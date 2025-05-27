---
'description': 'System table containing information about columns in all tables'
'keywords':
- 'system table'
- 'columns'
'slug': '/operations/system-tables/columns'
'title': 'system.columns'
---



以下は、テキストの日本語訳です。

---

すべてのテーブルにおけるカラムに関する情報を含みます。

このテーブルを使用して、複数のテーブルに対して、[DESCRIBE TABLE](../../sql-reference/statements/describe-table.md) クエリに似た情報を取得できます。

[一時テーブル](../../sql-reference/statements/create/table.md#temporary-tables)のカラムは、作成されたセッション内のみで `system.columns` に表示されます。これらは空の `database` フィールドで表示されます。

`system.columns` テーブルには以下のカラムが含まれています（カラムのタイプは括弧内に示されています）：

- `database` ([String](../../sql-reference/data-types/string.md)) — データベース名。
- `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `name` ([String](../../sql-reference/data-types/string.md)) — カラム名。
- `type` ([String](../../sql-reference/data-types/string.md)) — カラムタイプ。
- `position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — テーブル内のカラムの序数位置（1から始まる）。
- `default_kind` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の式タイプ（`DEFAULT`, `MATERIALIZED`, `ALIAS`）、定義されていない場合は空文字列。
- `default_expression` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の式、定義されていない場合は空文字列。
- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 圧縮データのサイズ（バイト）。
- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 非圧縮データのサイズ（バイト）。
- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークのサイズ（バイト）。
- `comment` ([String](../../sql-reference/data-types/string.md)) — カラムに関するコメント、定義されていない場合は空文字列。
- `is_in_partition_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — カラムがパーティション式に含まれているかを示すフラグ。
- `is_in_sorting_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — カラムがソートキー式に含まれているかを示すフラグ。
- `is_in_primary_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — カラムが主キー式に含まれているかを示すフラグ。
- `is_in_sampling_key` ([UInt8](../../sql-reference/data-types/int-uint.md)) — カラムがサンプリングキー式に含まれているかを示すフラグ。
- `compression_codec` ([String](../../sql-reference/data-types/string.md)) — 圧縮コーデック名。
- `character_octet_length` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — バイナリデータ、キャラクターデータ、テキストデータ、および画像に対する最大バイト長。ClickHouseでは`FixedString`データ型にのみ意味があります。それ以外では`NULL`値が返されます。
- `numeric_precision` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — おおよその数値データ、正確な数値データ、整数データ、または貨幣データの精度。ClickHouseでは整数型のビット幅および`Decimal`型の小数精度を示します。それ以外では`NULL`値が返されます。
- `numeric_precision_radix` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 数値システムの基数は、おおよその数値データ、正確な数値データ、整数データ、または貨幣データの精度です。ClickHouseでは整数型が2、`Decimal`型が10です。それ以外では`NULL`値が返されます。
- `numeric_scale` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — おおよその数値データ、正確な数値データ、整数データ、または貨幣データのスケールです。ClickHouseでは`Decimal`型にのみ意味があります。それ以外では`NULL`値が返されます。
- `datetime_precision` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — `DateTime64`データ型の小数精度。その他のデータ型については、`NULL`値が返されます。

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

---

この翻訳が元のテキストの意味を明確に伝えることを確認しました。また、HTMLタグやMarkdown構造はすべて保持されています。
