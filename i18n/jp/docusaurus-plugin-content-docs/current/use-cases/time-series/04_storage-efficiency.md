---
title: 'ストレージ効率 - 時系列データ'
sidebar_label: 'ストレージ効率'
description: '時系列データのストレージ効率を向上させる'
slug: /use-cases/time-series/storage-efficiency
keywords: ['time-series', 'storage efficiency', 'compression', 'data retention', 'TTL', 'storage optimization', 'disk usage']
show_related_blogs: true
doc_type: 'guide'
---



# 時系列データのストレージ効率

Wikipediaの統計データセットに対するクエリ方法を確認した後は、ClickHouseにおけるストレージ効率の最適化に焦点を当てます。
このセクションでは、クエリパフォーマンスを維持しながらストレージ要件を削減するための実践的な手法を紹介します。



## 型の最適化 {#time-series-type-optimization}

ストレージ効率を最適化するための一般的なアプローチは、最適なデータ型を使用することです。

`project`列と`subproject`列を例に取ります。これらの列はString型ですが、ユニーク値の数は比較的少なくなっています:

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

これは、辞書ベースのエンコーディングを使用するLowCardinality()データ型を使用できることを意味します。これにより、ClickHouseは元の文字列値の代わりに内部値IDを格納するため、大幅な容量削減が可能になります:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `project` LowCardinality(String),
MODIFY COLUMN `subproject` LowCardinality(String)
```

また、`hits`列にはUInt64型を使用していますが、これは8バイトを占有する一方で、最大値は比較的小さくなっています:

```sql
SELECT max(hits)
FROM wikistat;
```

```text
┌─max(hits)─┐
│    449017 │
└───────────┘
```

この値を考慮すると、代わりにUInt32を使用できます。これは4バイトしか占有せず、最大値として約40億まで格納できます:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `hits` UInt32;
```

これにより、この列のメモリ上のサイズが少なくとも半分に削減されます。ただし、圧縮により、ディスク上のサイズは変わらないことに注意してください。ただし、小さすぎるデータ型を選択しないよう注意が必要です!


## 特殊なコーデック {#time-series-specialized-codecs}

時系列のような連続データを扱う場合、特殊なコーデックを使用することでストレージ効率をさらに向上させることができます。
基本的な考え方は、絶対値そのものではなく値間の変化を保存することで、緩やかに変化するデータを扱う際に必要な容量を大幅に削減できるというものです。

```sql
ALTER TABLE wikistat
MODIFY COLUMN `time` CODEC(Delta, ZSTD);
```

`time`カラムにDeltaコーデックを使用しました。これは時系列データに適しています。

適切なソートキーを設定することでディスク容量を節約することもできます。
通常はパスでフィルタリングしたいため、ソートキーに`path`を追加します。
これにはテーブルの再作成が必要です。

以下に、初期テーブルと最適化されたテーブルの`CREATE`コマンドを示します。

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

それでは、各テーブルのデータが占める容量を見てみましょう。

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

最適化されたテーブルは、圧縮形式で4分の1強の容量しか使用していません。
