---
slug: /partitions
title: 'テーブルのパーティション'
description: 'ClickHouseにおけるテーブルのパーティションとは'
keywords: ['partitions', 'partition by']
---

import partitions from '@site/static/images/managing-data/core-concepts/partitions.png';
import merges_with_partitions from '@site/static/images/managing-data/core-concepts/merges_with_partitions.png';
import partition_pruning from '@site/static/images/managing-data/core-concepts/partition-pruning.png';
import Image from '@theme/IdealImage';

## ClickHouseにおけるテーブルのパーティションとは？ {#what-are-table-partitions-in-clickhouse}

<br/>

パーティションは、テーブルの[データパーツ](/parts)を[MergeTreeエンジンファミリー](/engines/table-engines/mergetree-family)内で、時間範囲、カテゴリ、その他の重要な属性など、特定の基準に沿った論理的に整理された単位にグループ化します。これにより、データがより管理しやすく、クエリしやすく、最適化が行いやすくなります。

### パーティションによる分割 {#partition-by}

テーブルを初めて定義する際に、[PARTITION BY句](/engines/table-engines/mergetree-family/custom-partitioning-key)を使用してパーティショニングを有効にできます。この句には、行がどのパーティションに属するかを定義する任意のカラムのSQL式を含めることができます。

これを示すために、以下のように例示的なテーブルに`PARTITION BY toStartOfMonth(date)`句を追加し、テーブルのデータパーツを物件の販売の月に基づいて整理します：

```sql
CREATE TABLE uk.uk_price_paid_simple_partitioned
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = MergeTree
ORDER BY (town, street)
PARTITION BY toStartOfMonth(date);
```

このテーブルを[クエリする]（https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZV9wYXJ0aXRpb25lZA&run_query=true&tab=results）ことができます。

### ディスク上の構造 {#structure-on-disk}

行のセットがテーブルに挿入されるたびに、挿入された行すべてを含む（[少なくとも](/operations/settings/settings#max_insert_block_size)）単一のデータパーツを作成する代わりに（[ここ](/parts)で説明されています）、ClickHouseは、挿入された行の中の各ユニークなパーティションキー値に対して新しいデータパーツを作成します：

<Image img={partitions} size="lg"  alt='INSERT PROCESSING' />

<br/>

ClickHouseサーバーは、上の図に描かれた4行のサンプル挿入から、行をパーティションキー値`toStartOfMonth(date)`で分割します。その後、特定された各パーティションに対して、行は[通常](/parts)通りに処理され、いくつかの順次ステップ（① ソート、② カラムへの分割、③ 圧縮、④ ディスクへの書き込み）が実行されます。

パーティショニングが有効になっている場合、ClickHouseは自動的に各データパーツに[MinMaxインデックス](https://github.com/ClickHouse/ClickHouse/blob/dacc8ebb0dac5bbfce5a7541e7fc70f26f7d5065/src/Storages/MergeTree/IMergeTreeDataPart.h#L341)を作成することに注意してください。これらはパーティションキー式で使用されているテーブルの各カラムに対するファイルで、データパーツ内のそのカラムの最小値と最大値が含まれています。

### パーティションごとのマージ {#per-partition-merges}

パーティショニングが有効になっている場合、ClickHouseはパーティション内のデータパーツのみを[マージ](/merges)し、パーティションを跨いでのマージは行いません。これは上記の例のテーブルについて概略します：

<Image img={merges_with_partitions} size="lg"  alt='PART MERGES' />

<br/>

上の図に描かれているように、異なるパーティションに属するパーツは決してマージされません。高いカーディナリティのパーティションキーが選ばれると、数千のパーティションにまたがるパーツは決してマージ候補にならず、事前設定された制限を超えて`Too many parts`エラーが発生します。この問題の解決は簡単です：カーディナリティが1000〜10000未満の合理的なパーティションキーを選択します。

## パーティションの監視 {#monitoring-partitions}

例示的なテーブルのすべての既存のユニークなパーティションのリストを、[仮想カラム](/engines/table-engines#table_engines-virtual_columns) `_partition_value`を使用して[クエリする](https://sql.clickhouse.com/?query=U0VMRUNUIERJU1RJTkNUIF9wYXJ0aXRpb25fdmFsdWUgQVMgcGFydGl0aW9uCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKT1JERVIgQlkgcGFydGl0aW9uIEFTQw&run_query=true&tab=results)ことができます：

```sql runnable
SELECT DISTINCT _partition_value AS partition
FROM uk.uk_price_paid_simple_partitioned
ORDER BY partition ASC;
```

あるいは、ClickHouseはすべてのテーブルのすべてのパーツとパーティションを[system.parts](/operations/system-tables/parts)システムテーブルに記録し、次のクエリは、上記の例のテーブルに対して各パーティションのアクティブなパーツの現在の数とこれらのパーツの行の合計を返します：

```sql runnable
SELECT
    partition,
    count() AS parts,
    sum(rows) AS rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple_partitioned') AND active
GROUP BY partition
ORDER BY partition ASC;
```

## テーブルのパーティションは何に使われるのか？ {#what-are-table-partitions-used-for}

### データ管理 {#data-management}

ClickHouseにおいて、パーティショニングは主にデータ管理機能です。パーティション式に基づいてデータを論理的に整理することにより、各パーティションを独立して管理できます。たとえば、上記の例のテーブルのパーティショニングスキームは、[TTLルール](/guides/developer/ttl)を使用して古いデータを自動的に削除することにより、主テーブルに過去12ヶ月分のデータのみを保持するシナリオを有効にします（DDL文の追加行を参照）：

```sql
CREATE TABLE uk.uk_price_paid_simple_partitioned
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = MergeTree
PARTITION BY toStartOfMonth(date)
ORDER BY (town, street)
TTL date + INTERVAL 12 MONTH DELETE;
```

テーブルは`toStartOfMonth(date)`でパーティションされているため、TTL条件に合致するパーティション全体（[テーブルのパーツ](/parts)のセット）は削除され、クリーンアップ処理が効率的になります[パーツの再書き込みを行う必要がありません](/sql-reference/statements/alter#mutations)。

同様に、古いデータを削除する代わりに、よりコスト効率の良い[ストレージティア](/integrations/s3#storage-tiers)に自動的かつ効率的に移動することができます：

```sql
CREATE TABLE uk.uk_price_paid_simple_partitioned
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = MergeTree
PARTITION BY toStartOfMonth(date)
ORDER BY (town, street)
TTL date + INTERVAL 12 MONTH TO VOLUME 'slow_but_cheap';
```

### クエリの最適化 {#query-optimization}

パーティションはクエリ性能の向上に寄与しますが、これはアクセスパターンに大きく依存します。クエリが少数のパーティション（理想的には1つ）を対象とする場合、パフォーマンスが向上する可能性があります。これは通常、パーティションキーが主キーに含まれていない場合に限り、有益です。以下の例のクエリのように、フィルタリングして使用する場合です。

```sql runnable
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01'
  AND date <= '2020-12-31'
  AND town = 'LONDON';
```

このクエリは上記の例のテーブルを実行し、[2020年12月にロンドンで売却されたすべての不動産の最高価格を計算](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIGRhdGUgPj0gJzIwMjAtMTItMDEnCiAgQU5EIGRhdGUgPD0gJzIwMjAtMTItMzEnCiAgQU5EIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results)します。このクエリでは、テーブルのパーティションキーに使用されるカラム（`date`）のフィルタと、テーブルの主キーに使用されるカラム（`town`）のフィルタで絞り込まれます（`date`は主キーの一部ではありません）。

ClickHouseは、関連性のないデータを評価しないためにプルーニング技術のシーケンスを適用し、クエリを処理します：

<Image img={partition_pruning} size="lg"  alt='PART MERGES 2' />

<br/>

① **パーティションプルーニング**： [MinMaxインデックス](/partitions#what-are-table-partitions-in-clickhouse)を使用して、クエリのフィルタに論理的に合致しない全パーティション（パーツのセット）を無視します。

② **グラニュールプルーニング**：ステップ①の後、残ったデータパーツに対してその[主インデックス](/guides/best-practices/sparse-primary-indexes)を使用して、テーブルの主キーで使用されるカラムのクエリのフィルタに論理的に合致しない[グラニュール](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行のブロック）を無視します。

これらのデータプルーニング手順は、上記の例のクエリの物理クエリ実行計画を[検査する](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgZGF0ZSA-PSAnMjAyMC0xMi0wMScKICBBTkQgZGF0ZSA8PSAnMjAyMC0xMi0zMScKICBBTkQgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results)ことで観察できます：

```sql style="fontSize:13px"
EXPLAIN indexes = 1
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01'
  AND date <= '2020-12-31'
  AND town = 'LONDON';


    ┌─explain──────────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))                                                                    │
 2. │   Aggregating                                                                                                │
 3. │     Expression (Before GROUP BY)                                                                             │
 4. │       Expression                                                                                             │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple_partitioned)                                              │
 6. │         Indexes:                                                                                             │
 7. │           MinMax                                                                                             │
 8. │             Keys:                                                                                            │
 9. │               date                                                                                           │
10. │             Condition: and((date in (-Inf, 18627]), (date in [18597, +Inf)))                                 │
11. │             Parts: 1/436                                                                                     │
12. │             Granules: 11/3257                                                                                │
13. │           Partition                                                                                          │
14. │             Keys:                                                                                            │
15. │               toStartOfMonth(date)                                                                           │
16. │             Condition: and((toStartOfMonth(date) in (-Inf, 18597]), (toStartOfMonth(date) in [18597, +Inf))) │
17. │             Parts: 1/1                                                                                       │
18. │             Granules: 11/11                                                                                  │
19. │           PrimaryKey                                                                                         │
20. │             Keys:                                                                                            │
21. │               town                                                                                           │
22. │             Condition: (town in ['LONDON', 'LONDON'])                                                        │
23. │             Parts: 1/1                                                                                       │
24. │             Granules: 1/11                                                                                   │
    └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

上記の出力は以下のことを示しています：

① パーティションプルーニング：EXPLAIN出力の7行目から18行目で示すように、ClickHouseは最初に`date`フィールドの[MinMaxインデックス](/partitions#what-are-table-partitions-in-clickhouse)を使用して、クエリの`date`フィルタに一致する3257既存の[グラニュール](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行のブロック）を持っている1つの436の既存のアクティブデータパートから11を特定します。

② グラニュールプルーニング：EXPLAIN出力の19行目から24行目では、ClickHouseは、ステップ①で特定されたデータパーツの[主インデックス](/guides/best-practices/sparse-primary-indexes)（`town`フィールド上に作成）を使用して、クエリの`town`フィルタに合致する行を持つグラニュールの数をさらに11から1に減らします。これは、上記のクエリ実行のClickHouseクライアント出力にも反映されています：

```response
... Elapsed: 0.006 sec. Processed 8.19 thousand rows, 57.34 KB (1.36 million rows/s., 9.49 MB/s.)
Peak memory usage: 2.73 MiB.
```

つまり、ClickHouseは6ミリ秒で1つのグラニュール（[8192](/operations/settings/merge-tree-settings#index_granularity)行のブロック）をスキャンし、クエリ結果を計算しました。

### パーティショニングは主にデータ管理機能です {#partitioning-is-primarily-a-data-management-feature}

すべてのパーティションを横断してクエリすることは、通常、同じクエリを非パーティションテーブルで実行するよりも遅くなることに注意してください。

パーティショニングを使用すると、データは通常、より多くのデータパーツに分散され、ClickHouseがより大きなデータボリュームをスキャンおよび処理することに繋がります。

これを示すために、パーティションが有効な状態と無効な状態の両方で[What are table parts](/parts)の例のテーブルに対して同じクエリを実行します。両方のテーブルは[同じデータと行数を持っています](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIHN1bShyb3dzKSBBUyByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCBJTiBbJ3VrX3ByaWNlX3BhaWRfc2ltcGxlJywgJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJ10pIEFORCBhY3RpdmUKR1JPVVAgQlkgdGFibGU7&run_query=true&tab=results)：

```sql runnable
SELECT
    table,
    sum(rows) AS rows
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;
```

しかし、パーティションが有効なテーブルは、[アクティブなデータパーツ](/parts)がより多くなっており、前述したようにClickHouseはデータパーツをパーティション内でのみ[マージ](/parts)するため、次のクエリを使用して確認します：

```sql runnable
SELECT
    table,
    count() AS parts
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;
```

前述の通り、パーティション付きのテーブル`uk_price_paid_simple_partitioned`は600以上のパーティションを持ち、したがって306のアクティブデータパーツを持っています。一方で、非パーティショニングテーブル`uk_price_paid_simple`では、[初期の](/parts)データパーツがバックグラウンドマージによって単一のアクティブパートにマージされる可能性があります。

パーティションフィルタなしでのクエリの物理実行計画を[チェックする](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results)と、出力の19行目と20行目で示すように、ClickHouseは3257の既存の[グラニュール](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)の671を431の既存のアクティブデータパーツ内で特定し、クエリのフィルタに一致する行を含むかもしれないため、クエリエンジンによってスキャンされ処理されることを示しています：

```sql
EXPLAIN indexes = 1
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE town = 'LONDON';


    ┌─explain─────────────────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))                       │
 2. │   Aggregating                                                   │
 3. │     Expression (Before GROUP BY)                                │
 4. │       Expression                                                │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple_partitioned) │
 6. │         Indexes:                                                │
 7. │           MinMax                                                │
 8. │             Condition: true                                     │
 9. │             Parts: 436/436                                      │
10. │             Granules: 3257/3257                                 │
11. │           Partition                                             │
12. │             Condition: true                                     │
13. │             Parts: 436/436                                      │
14. │             Granules: 3257/3257                                 │
15. │           PrimaryKey                                            │
16. │             Keys:                                               │
17. │               town                                              │
18. │             Condition: (town in ['LONDON', 'LONDON'])           │
19. │             Parts: 431/436                                      │
20. │             Granules: 671/3257                                  │
    └─────────────────────────────────────────────────────────────────┘
```

同じ例のクエリを非パーティションテーブルで実行すると、次の出力の11行目と12行目では、ClickHouseはテーブルの単一のアクティブデータパーツ内に存在する3083のブロックのうち241を特定し、クエリのフィルタに一致する行を含むかもしれないことを示しています：

```sql
EXPLAIN indexes = 1
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple
WHERE town = 'LONDON';


    ┌─explain───────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))             │
 2. │   Aggregating                                         │
 3. │     Expression (Before GROUP BY)                      │
 4. │       Expression                                      │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple)   │
 6. │         Indexes:                                      │
 7. │           PrimaryKey                                  │
 8. │             Keys:                                     │
 9. │               town                                    │
10. │             Condition: (town in ['LONDON', 'LONDON']) │
11. │             Parts: 1/1                                │
12. │             Granules: 241/3083                        │
    └───────────────────────────────────────────────────────┘
```

パーティション付きのテーブルでクエリを実行すると、ClickHouseは671ブロック（約550万行）を90ミリ秒でスキャンして処理します：

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE town = 'LONDON';

┌─highest_price─┐
│     594300000 │ -- 594.30 million
└───────────────┘

1 row in set. Elapsed: 0.090 sec. Processed 5.48 million rows, 27.95 MB (60.66 million rows/s., 309.51 MB/s.)
Peak memory usage: 163.44 MiB.
```

一方で、非パーティションテーブルでクエリを実行した場合、ClickHouseは241ブロック（約200万行）を12ミリ秒でスキャンして処理します：

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple
WHERE town = 'LONDON';

┌─highest_price─┐
│     594300000 │ -- 594.30 million
└───────────────┘

1 row in set. Elapsed: 0.012 sec. Processed 1.97 million rows, 9.87 MB (162.23 million rows/s., 811.17 MB/s.)
Peak memory usage: 62.02 MiB.
