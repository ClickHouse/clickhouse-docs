---
title: 'ストレージ効率 - タイムシリーズ'
sidebar_label: 'ストレージ効率'
description: 'タイムシリーズデータのストレージ効率を向上させる'
slug: /use-cases/time-series/storage-efficiency
keywords: ['タイムシリーズ', 'ストレージ効率', '圧縮', 'データ保持期間', 'TTL', 'ストレージ最適化', 'ディスク使用量']
show_related_blogs: true
doc_type: 'guide'
---

# 時系列データのストレージ効率 \\{#time-series-storage-efficiency\\}

Wikipedia 統計データセットのクエリ方法を一通り見てきたところで、次は ClickHouse におけるストレージ効率の最適化に焦点を当てます。
このセクションでは、クエリ性能を維持しつつ、ストレージ要件を削減するための実践的な手法を紹介します。

## 型の最適化 \\{#time-series-type-optimization\\}

ストレージ効率を最適化する一般的な方法は、適切なデータ型を使用することです。
`project` と `subproject` 列を見てみましょう。これらの列は String 型ですが、一意な値の数は比較的少なくなっています。

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

つまり、辞書ベースのエンコーディングを使用する `LowCardinality()` データ型を利用できます。これにより、ClickHouse は元の文字列値の代わりに内部 ID を保存するようになり、その結果として大きく容量を節約できます。

```sql
ALTER TABLE wikistat
MODIFY COLUMN `project` LowCardinality(String),
MODIFY COLUMN `subproject` LowCardinality(String)
```

`hits` 列には UInt64 型も使用しています。これは 8 バイトを使用しますが、最大値はそれほど大きくありません。

```sql
SELECT max(hits)
FROM wikistat;
```

```text
┌─max(hits)─┐
│    449017 │
└───────────┘
```

この値であれば、代わりに UInt32 を使用でき、その場合は 4 バイトしか消費せず、最大値として約 40 億まで格納できます。

```sql
ALTER TABLE wikistat
MODIFY COLUMN `hits` UInt32;
```

これにより、このカラムのメモリ上のサイズは少なくとも半分になります。圧縮によりディスク上のサイズは変わらない点に注意してください。ただし、小さすぎるデータ型は選ばないよう注意してください。

## 専用コーデック \\{#time-series-specialized-codecs\\}

時系列データのような連続データを扱う場合、専用のコーデックを使用することで、ストレージ効率をさらに高めることができます。
基本的な考え方としては、絶対値そのものではなく値の差分を格納することで、ゆっくりと変化するデータを扱う際に必要となるストレージ容量を大幅に削減できるというものです。

```sql
ALTER TABLE wikistat
MODIFY COLUMN `time` CODEC(Delta, ZSTD);
```

`time` 列には Delta コーデックを使用しました。これは時系列データに適した選択です。

適切なソートキーを選ぶことでも、ディスク使用量を削減できます。
通常はパスでフィルタリングしたいので、`path` をソートキーに追加します。
これにはテーブルの再作成が必要です。

以下に、初期テーブルおよび最適化後のテーブルの `CREATE` コマンドを示します。

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

それでは、各テーブルごとのデータ使用量を確認してみましょう。

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

最適化されたテーブルは、圧縮後のサイズが元の容量の 4 分の 1 弱にまで削減されます。
