---
'description': '指定されたカラムの圧縮率を圧縮せずに推定します。'
'sidebar_position': 132
'slug': '/sql-reference/aggregate-functions/reference/estimateCompressionRatio'
'title': 'estimateCompressionRatio'
---



## estimateCompressionRatio {#estimatecompressionration}

指定されたカラムの圧縮比率を圧縮せずに推定します。

**構文**

```sql
estimateCompressionRatio(codec, block_size_bytes)(column)
```

**引数**

- `column` - 任意の型のカラム

**パラメータ**

- `codec` - [圧縮コーデック](/sql-reference/statements/create/table#column_compression_codec)を含む[文字列](../../../sql-reference/data-types/string.md)または複数のカンマ区切りのコーデックを含む単一の文字列。
- `block_size_bytes` - 圧縮データのブロックサイズです。これは、[`max_compress_block_size`](../../../operations/settings/merge-tree-settings.md#max_compress_block_size) と [`min_compress_block_size`](../../../operations/settings/merge-tree-settings.md#min_compress_block_size)の両方を設定することに類似しています。デフォルト値は 1 MiB (1048576 バイト) です。

両方のパラメータはオプションです。

**返される値**

- 指定されたカラムの推定圧縮比率を返します。

タイプ: [Float64](/sql-reference/data-types/float)。

**例**

```sql title="入力テーブル"
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

```sql title="クエリ"
SELECT estimateCompressionRatio(number) AS estimate FROM compression_estimate_example;
```

```text title="レスポンス"
┌───────────estimate─┐
│ 1.9988506608699999 │
└────────────────────┘
```

:::note
上記の結果はサーバーのデフォルト圧縮コーデックに基づいて異なります。[カラム圧縮コーデック](/sql-reference/statements/create/table#column_compression_codec)を参照してください。
:::

```sql title="クエリ"
SELECT estimateCompressionRatio('T64')(number) AS estimate FROM compression_estimate_example;
```

```text title="レスポンス"
┌──────────estimate─┐
│ 3.762758101688538 │
└───────────────────┘
```

関数は複数のコーデックを指定することもできます：

```sql title="クエリ"
SELECT estimateCompressionRatio('T64, ZSTD')(number) AS estimate FROM compression_estimate_example;
```

```response title="レスポンス"
┌───────────estimate─┐
│ 143.60078980434392 │
└────────────────────┘
```
