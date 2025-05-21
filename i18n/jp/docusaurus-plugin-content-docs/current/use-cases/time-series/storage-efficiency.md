---
title: 'ストレージ効率 - 時系列'
sidebar_label: 'ストレージ効率'
description: '時系列のストレージ効率を向上させる'
slug: /use-cases/time-series/storage-efficiency
keywords: ['time-series']
---


# 時系列ストレージ効率

Wikipediaの統計データセットをクエリする方法を探った後、ClickHouseでのストレージ効率を最適化することに焦点を当てます。このセクションでは、クエリパフォーマンスを維持しながらストレージ要件を削減するための実用的な技術を示します。

## タイプ最適化 {#time-series-type-optimization}

ストレージ効率を最適化する一般的なアプローチは、最適なデータタイプを使用することです。`project` および `subproject` カラムを見てみましょう。これらのカラムはString型ですが、相対的に少ないユニーク値を持っています：

```sql
SELECT
    uniq(project),
    uniq(subproject)
FROM wikistat;
```

```text
┌─uniq(project)─┬─uniq(subproject)─┐
│          1332 │              130 │
└───────────────┴──────────────────┘
```

これは、LowCardinality()データタイプを使用できることを意味します。このデータタイプは辞書ベースのエンコーディングを使用し、ClickHouseが元の文字列値の代わりに内部値のIDを保存するため、多くのスペースを節約できます：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `project` LowCardinality(String),
MODIFY COLUMN `subproject` LowCardinality(String)
```

ヒット数を示すカラムにはUInt64型を使用しており、8バイトを消費しますが、相対的に小さな最大値を持っています：

```sql
SELECT max(hits)
FROM wikistat;
```

```text
┌─max(hits)─┐
│    449017 │
└───────────┘
```

この値を考慮すると、UInt32を代わりに使用でき、4バイトのみを消費し、最大約4bを保存できます：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `hits` UInt32;
```

これにより、このカラムのメモリサイズは少なくとも2倍減少します。圧縮のため、ディスク上のサイズは変わりませんが、データ型が小さすぎないように注意してください。

## 専用コーデック {#time-series-specialized-codecs}

時系列のような連続データを扱う場合、特別なコーデックを使用することでストレージ効率をさらに改善できます。一般的なアイデアは、絶対値自体ではなく、値の変化を保存することで、ゆっくり変化するデータを扱う際に必要なスペースがかなり少なくなることです：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `time` CODEC(Delta, ZSTD);
```

時刻のカラムにはDeltaコーデックを使用しており、これは時系列データに適しています。

適切なオーダリングキーもディスクスペースを節約できる可能性があります。通常、パスでフィルタリングを行いたいため、`path`をソートキーに追加します。これにはテーブルの再作成が必要です。

以下に、初期テーブルと最適化されたテーブルの `CREATE` コマンドを示します：

```sql
CREATE TABLE wikistat
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = MergeTree
ORDER BY (time);
```

```sql
CREATE TABLE optimized_wikistat
(
    `time` DateTime CODEC(Delta(4), ZSTD(1)),
    `project` LowCardinality(String),
    `subproject` LowCardinality(String),
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY (path, time);
```

そして、各テーブルのデータが占めるスペースの量を見てみましょう：

```sql
SELECT
    table,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed,
    formatReadableSize(sum(data_compressed_bytes)) AS compressed,
    count() AS parts
FROM system.parts
WHERE table LIKE '%wikistat%'
GROUP BY ALL;
```

```text
┌─table──────────────┬─uncompressed─┬─compressed─┬─parts─┐
│ wikistat           │ 35.28 GiB    │ 12.03 GiB  │     1 │
│ optimized_wikistat │ 30.31 GiB    │ 2.84 GiB   │     1 │
└────────────────────┴──────────────┴────────────┴───────┘
```

最適化されたテーブルは、その圧縮形式で4倍以上のスペースを占めています。
