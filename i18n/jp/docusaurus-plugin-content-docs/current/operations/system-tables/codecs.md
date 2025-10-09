---
'description': 'キュー内のコーデックに関する情報を含むシステムテーブル.'
'keywords':
- 'system table'
- 'codecs'
- 'compression'
'slug': '/operations/system-tables/codecs'
'title': 'system.codecs'
'doc_type': 'reference'
---

圧縮および暗号化コーデックに関する情報が含まれています。

この表を使用して、利用可能な圧縮および暗号化コーデックに関する情報を取得できます。

`system.codecs` テーブルには、以下のカラムが含まれています（カラムの型は括弧内に示されています）：

- `name` ([String](../../sql-reference/data-types/string.md)) — コーデック名。
- `method_byte` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 圧縮ファイル内のコーデックを示すバイト。
- `is_compression` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — このコーデックが何かを圧縮する場合は True。そうでない場合、それは単に圧縮を助ける変換です。
- `is_generic_compression` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — コーデックが lz4 や zstd などの一般的な圧縮アルゴリズムであることを示します。
- `is_encryption` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — コーデックがデータを暗号化します。
- `is_timeseries_codec` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — コーデックが浮動小数点の時系列データ用であることを示します。
- `is_experimental` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — コーデックが実験的であることを示します。
- `description` ([String](../../sql-reference/data-types/string.md)) — コーデックの高レベルな説明。

**例**

クエリ：

```sql
SELECT * FROM system.codecs WHERE name='LZ4'
```

結果：

```text
Row 1:
──────
name:                   LZ4
method_byte:            130
is_compression:         1
is_generic_compression: 1
is_encryption:          0
is_timeseries_codec:    0
is_experimental:        0
description:            Extremely fast; good compression; balanced speed and efficiency.
```
