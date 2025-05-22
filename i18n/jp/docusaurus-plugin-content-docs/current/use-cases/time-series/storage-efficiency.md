---
'title': 'ストレージ効率 - 時系列'
'sidebar_label': 'ストレージ効率'
'description': '時系列ストレージ効率の向上'
'slug': '/use-cases/time-series/storage-efficiency'
'keywords':
- 'time-series'
---




# 時系列ストレージ効率

Wikipediaの統計データセットをクエリする方法を探った後は、ClickHouseでのストレージ効率の最適化に集中しましょう。このセクションでは、クエリパフォーマンスを維持しながらストレージ要件を削減するための実用的なテクニックを示します。

## 型の最適化 {#time-series-type-optimization}

ストレージ効率を最適化する一般的なアプローチは、最適なデータ型を使用することです。`project`および`subproject`カラムを見てみましょう。これらのカラムはString型ですが、ユニークな値は比較的少ないです：

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

これは、辞書ベースのエンコーディングを使用するLowCardinality()データ型を使用できることを意味します。これにより、ClickHouseは元の文字列値の代わりに内部値IDを保存し、結果として多くのスペースを節約します：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `project` LowCardinality(String),
MODIFY COLUMN `subproject` LowCardinality(String)
```

また、hitsカラムにはUInt64型を使用しましたが、これは8バイトを取りますが、最大値は比較的小さいです：

```sql
SELECT max(hits)
FROM wikistat;
```

```text
┌─max(hits)─┐
│    449017 │
└───────────┘
```

この値を考慮すると、代わりにUInt32を使用でき、これにより最大値を約~4bまで保存できます：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `hits` UInt32;
```

これにより、このカラムのメモリにおけるサイズが少なくとも2倍に削減されます。圧縮のため、ディスク上のサイズは変更されないことに注意してください。しかし、小さすぎるデータ型を選ばないように注意してください！

## 専用コーデック {#time-series-specialized-codecs}

時系列のような連続データを扱うとき、特別なコーデックを使用することでストレージ効率をさらに改善できます。一般的なアイデアは、絶対値そのものではなく、値の変化を保存することです。これにより、ゆっくりと変化するデータを扱う際に必要なスペースが大幅に削減されます：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `time` CODEC(Delta, ZSTD);
```

時刻カラムにはDeltaコーデックを使用しました。これは時系列データに適した選択です。

適切なソートキーを使用することもディスクスペースを節約できます。通常はパスでフィルタリングしたいので、ソートキーに`path`を追加します。これにはテーブルの再作成が必要です。

以下に、初期テーブルと最適化されたテーブルの`CREATE`コマンドを示します：

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

それでは、各テーブルのデータが占めるスペースの量を見てみましょう：

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

最適化されたテーブルは、圧縮された形式でちょうど4倍以上のスペースを占めています。
