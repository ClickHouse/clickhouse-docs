---
description: '指定したカラムを実際には圧縮せずに、その圧縮率を推定します。'
sidebar_position: 132
slug: /sql-reference/aggregate-functions/reference/estimateCompressionRatio
title: 'estimateCompressionRatio'
doc_type: 'reference'
---



## estimateCompressionRatio {#estimatecompressionration}

指定されたカラムを実際に圧縮せずに圧縮率を推定します。

**構文**

```sql
estimateCompressionRatio(codec, block_size_bytes)(column)
```

**引数**

- `column` - 任意の型のカラム

**パラメータ**

- `codec` - [圧縮コーデック](/sql-reference/statements/create/table#column_compression_codec)、または単一の文字列内にカンマ区切りで複数のコーデックを含む[String](../../../sql-reference/data-types/string.md)。
- `block_size_bytes` - 圧縮データのブロックサイズ。これは[`max_compress_block_size`](../../../operations/settings/merge-tree-settings.md#max_compress_block_size)と[`min_compress_block_size`](../../../operations/settings/merge-tree-settings.md#min_compress_block_size)の両方を設定することに相当します。デフォルト値は1 MiB（1048576バイト）です。

両方のパラメータは省略可能です。

**返り値**

- 指定されたカラムの推定圧縮率を返します。

型: [Float64](/sql-reference/data-types/float)。

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

```text title="応答"
┌───────────estimate─┐
│ 1.9988506608699999 │
└────────────────────┘
```

:::note
上記の結果は、サーバーのデフォルト圧縮コーデックによって異なります。[カラム圧縮コーデック](/sql-reference/statements/create/table#column_compression_codec)を参照してください。
:::

```sql title="クエリ"
SELECT estimateCompressionRatio('T64')(number) AS estimate FROM compression_estimate_example;
```

```text title="応答"
┌──────────estimate─┐
│ 3.762758101688538 │
└───────────────────┘
```

この関数は複数のコーデックを指定することもできます:

```sql title="クエリ"
SELECT estimateCompressionRatio('T64, ZSTD')(number) AS estimate FROM compression_estimate_example;
```

```response title="応答"
┌───────────estimate─┐
│ 143.60078980434392 │
└────────────────────┘
```
