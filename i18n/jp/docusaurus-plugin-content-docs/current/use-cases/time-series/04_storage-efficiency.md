---
'title': 'ストレージ効率 - 時系列'
'sidebar_label': 'ストレージ効率'
'description': '時系列ストレージ効率の改善'
'slug': '/use-cases/time-series/storage-efficiency'
'keywords':
- 'time-series'
'show_related_blogs': true
'doc_type': 'guide'
---


# 時系列ストレージ効率

私たちの Wikipedia 統計データセットをクエリする方法を探った後、ClickHouse におけるストレージ効率の最適化に焦点を当てましょう。 
このセクションでは、クエリパフォーマンスを維持しながらストレージ要件を削減するための実用的なテクニックを示します。

## タイプ最適化 {#time-series-type-optimization}

ストレージ効率を最適化する一般的なアプローチは、最適なデータ型を使用することです。 
`project` と `subproject` のカラムを見てみましょう。これらのカラムは String 型ですが、ユニークな値の数は比較的少ないです：

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

これは、LowCardinality() データ型を使用できることを意味します。このデータ型は辞書ベースのエンコーディングを使用します。これにより、ClickHouse は元の文字列値の代わりに内部値の ID を保存し、結果的に多くのスペースを節約します：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `project` LowCardinality(String),
MODIFY COLUMN `subproject` LowCardinality(String)
```

ヒット数のカラムには UInt64 型を使用しており、8 バイトかかりますが、比較的小さな最大値があります：

```sql
SELECT max(hits)
FROM wikistat;
```

```text
┌─max(hits)─┐
│    449017 │
└───────────┘
```

この値を考慮すると、代わりに UInt32 を使用でき、これはわずか 4 バイトを消費し、最大 ~4b の値を格納できます：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `hits` UInt32;
```

これにより、このカラムのメモリ内のサイズが少なくとも 2 倍減少します。ディスク上のサイズは圧縮により変更されないことに注意してください。ただし、あまり小さすぎないデータ型を選択するように注意してください！

## 専用コーデック {#time-series-specialized-codecs}

時系列のような連続データを処理する場合、特別なコーデックを使用することでストレージ効率をさらに改善できます。 
一般的なアイデアは、絶対値自体ではなく、値間の変化を保存することです。これにより、ゆっくり変化するデータを扱う際に必要なスペースが大幅に減少します：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `time` CODEC(Delta, ZSTD);
```

時間カラムには Delta コーデックを使用しており、これは時系列データに適した選択です。

適切なオーダリングキーもディスクスペースを節約できます。 
通常はパスでフィルタリングしたいので、`path` をソートキーに追加します。
これにはテーブルの再作成が必要です。

以下に、最初のテーブルと最適化されたテーブルのための `CREATE` コマンドを示します：

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

各テーブルのデータが占めるスペースの量を見てみましょう：

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

最適化されたテーブルは、圧縮された形で4倍以上少ないスペースを占めています。
