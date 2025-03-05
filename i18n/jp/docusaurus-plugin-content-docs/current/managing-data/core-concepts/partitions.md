---
slug: /partitions
title: テーブルのパーティション
description: ClickHouseにおけるテーブルのパーティションとは何か
keywords: [partitions, partition by]
---

import partitions from '@site/static/images/managing-data/core-concepts/partitions.png';
import merges_with_partitions from '@site/static/images/managing-data/core-concepts/merges_with_partitions.png';
import partition_pruning from '@site/static/images/managing-data/core-concepts/partition-pruning.png';


## ClickHouseにおけるテーブルのパーティションとは何か？ {#what-are-table-partitions-in-clickhouse}

<br/>

パーティションは、[MergeTreeエンジンファミリー](/engines/table-engines/mergetree-family)のテーブルの[data parts](/parts)を、時間範囲、カテゴリ、その他のキーレベルといった特定の基準に沿った、組織的で論理的なユニットにグループ化します。これらの論理的なユニットは、データの管理、クエリ、最適化を容易にします。

### パーティションの設定 {#partition-by}

テーブルを最初に定義するとき、[PARTITION BY句](/engines/table-engines/mergetree-family/custom-partitioning-key)を介してパーティショニングを有効にできます。この句は、任意のカラムに関するSQL式を含むことができ、その結果が行がどのパーティションに属するかを定義します。

これを示すために、以下の例テーブル[What are table parts](/parts)に、プロパティ販売の月に基づいてデータ部分を整理する`PARTITION BY toStartOfMonth(date)`句を追加します：

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

このテーブルを[クエリできます](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZV9wYXJ0aXRpb25lZA&run_query=true&tab=results)。

### ディスク上の構造 {#structure-on-disk}

行のセットがテーブルに挿入されるたびに、挿入されたすべての行を含む（[少なくとも](/operations/settings/settings#max_insert_block_size)）1つのデータ部分を作成するのではなく、ClickHouseは挿入された行の中で、各ユニークなパーティションキー値ごとに新しいデータ部分を作成します：

<img src={partitions} alt='INSERT PROCESSING' class='image' />
<br/>

ClickHouseサーバーは、上記の図に描かれた例の挿入から4行をそのパーティションキー値`toStartOfMonth(date)`によってまず分割します。次に、識別されたパーティションごとに、行は[通常通り](/parts)に処理されます（① ソート、② カラムへの分割、③ 圧縮、④ ディスクへの書き込み）。

パーティショニングが有効な場合、ClickHouseは自動的に各データ部分のために[MinMaxインデックス](https://github.com/ClickHouse/ClickHouse/blob/dacc8ebb0dac5bbfce5a7541e7fc70f26f7d5065/src/Storages/MergeTree/IMergeTreeDataPart.h#L341)を作成します。これは、パーティションキー式で使用される各テーブルカラムの最小値と最大値を含むファイルです。

### パーティション内のマージ {#per-partition-merges}

パーティショニングが有効な場合、ClickHouseはパーティション内のデータ部分のみを[マージ](/merges)し、パーティション間ではマージしません。上記の例テーブルについてこれを示します：

<img src={merges_with_partitions} alt='PART MERGES' class='image' />
<br/>

上記の図に描かれているように、異なるパーティションに属するパーツがマージされることはありません。高いカーディナリティのパーティションキーが選択された場合、数千のパーティションに広がるパーツは、事前に設定された制限を超え、悪名高い`Too many parts`エラーを引き起こすため、マージ候補にはなりません。この問題に対処するには、[1000〜10000未満のカーディナリティを持つ](https://github.com/ClickHouse/ClickHouse/blob/ffc5b2c56160b53cf9e5b16cfb73ba1d956f7ce4/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L121)合理的なパーティションキーを選択してください。

## パーティションの監視 {#monitoring-partitions}

次のクエリを使用して、例テーブルのすべての既存のユニークなパーティションのリストを[クエリできます](https://sql.clickhouse.com/?query=U0VMRUNUIERJU1RJTkNUIF9wYXJ0aXRpb25fdmFsdWUgQVMgcGFydGl0aW9uCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKT1JERVIgQlkgcGFydGl0aW9uIEFTQw&run_query=true&tab=results)。この場合、[仮想カラム](/engines/table-engines#table_engines-virtual_columns)`_partition_value`を利用します：

```sql
SELECT DISTINCT _partition_value AS partition
FROM uk.uk_price_paid_simple_partitioned
ORDER BY partition ASC;

     ┌─partition──────┐
  1. │ ('1995-01-01') │
  2. │ ('1995-02-01') │
  3. │ ('1995-03-01') │
 ...
304. │ ('2021-04-01') │
305. │ ('2021-05-01') │
306. │ ('2021-06-01') │
     └────────────────┘
```

また、ClickHouseはすべてのテーブルのすべての部分とパーティションを[system.parts](/operations/system-tables/parts)システムテーブルで追跡し、以下のクエリが例テーブルに対して、各パーティションごとの現在のアクティブな部分の数と合計行数を返します：[returns](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBwYXJ0aXRpb24sCiAgICBjb3VudCgpIEFTIHBhcnRzLAogICAgc3VtKHJvd3MpIEFTIHJvd3MKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgID0gJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJykgQU5EIGFjdGl2ZQpHUk9VUCBCWSBwYXJ0aXRpb24KT1JERVIgQlkgcGFydGl0aW9uIEFTQzs&run_query=true&tab=results)：

```sql
SELECT
    partition,
    count() AS parts,
    sum(rows) AS rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple_partitioned') AND active
GROUP BY partition
ORDER BY partition ASC;

     ┌─partition──┬─parts─┬───rows─┐
  1. │ 1995-01-01 │     1 │  50473 │
  2. │ 1995-02-01 │     1 │  50840 │
  3. │ 1995-03-01 │     1 │  71276 │
 ...
304. │ 2021-04-01 │     3 │  23160 │
305. │ 2021-05-01 │     3 │  17607 │
306. │ 2021-06-01 │     3 │   5652 │
     └─partition──┴─parts─┴───rows─┘
```

## テーブルのパーティションは何に使われるか？ {#what-are-table-partitions-used-for}

### データ管理 {#data-management}

ClickHouseにおいて、パーティショニングは主にデータ管理機能です。パーティション式に基づいて論理的にデータを整理することにより、それぞれのパーティションは独立して管理できます。たとえば、上記の例テーブルのパーティショニングスキームでは、[TTLルール](/guides/developer/ttl)を使用して、古いデータを自動的に削除することにより、主テーブルに過去12ヶ月のデータのみが保持されるシナリオを可能にします（DDL文の追加された最後の行を参照）：

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

テーブルが`toStartOfMonth(date)`でパーティション化されているため、TTL条件を満たすパーティション全体（[table parts](/parts)の集合）が削除され、クリーンアップ操作がより効率的になります。[パーツを再書き込みする必要がなく]( /sql-reference/statements/alter#mutations)。

同様に、古いデータを削除するのではなく、よりコスト効率の良い[ストレージ層](/integrations/s3#storage-tiers)に自動的かつ効率的に移動できます：

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

### クエリ最適化 {#query-optimization}

パーティションはクエリパフォーマンスを助けることができますが、これはアクセスパターンに大きく依存します。もしクエリが少数のパーティション（理想的には1つ）をターゲットにする場合、パフォーマンスが改善される可能性があります。これは、パーティショニングキーが主キーの一部でない場合、かつそれでフィルタリングを行うときにのみ典型的に有用です。以下の例のクエリで示します。

```sql
SELECT MAX(price) AS highest_price
FROM uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01'
  AND date <= '2020-12-31'
  AND town = 'LONDON';

   ┌─highest_price─┐
1. │     296280000 │ -- 296.28百万
   └───────────────┘

1行のセット。経過時間: 0.006秒。8.19千行処理、57.34 KB（1.36百万行/s., 9.49 MB/s.)
ピークメモリ使用量: 2.73 MiB。
```

クエリは、上記の例テーブルに対して実行され、[計算を行います](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIGRhdGUgPj0gJzIwMjAtMTItMDEnCiAgQU5EIGRhdGUgPD0gJzIwMjAtMTItMzEnCiAgQU5EIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results)2020年12月にロンドンで売れたすべての物件の最高価格を、テーブルのパーティションキーで使用されているカラム（`date`）と、テーブルのプライマリキーで使用されているカラム（`town`）の両方でフィルタリングしながら計算しています（`date`はプライマリキーの一部ではありません）。

ClickHouseは、不必要なデータを評価しないために一連のプルーニング技術を適用することによって、クエリを処理します：

<img src={partition_pruning} alt='PART MERGES' class='image' />
<br/>

① **パーティションプルーニング**: [MinMaxインデックス](/partitions#what-are-table-partitions-in-clickhouse)を使用して、クエリのフィルタに論理的に一致しない全体のパーティション（部分のセット）を無視します。

② **グラニュールプルーニング**: ステップ①の後の残りのデータ部分では、テーブルの主キーで使用されるカラムに対して適用される[プライマリインデックス](/guides/best-practices/sparse-primary-indexes)を使用して、論理的にクエリのフィルタに一致しないすべての[グラニュール](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行のブロック）を無視します。

これらのデータプルーニングステップは、上記の例クエリの物理クエリ実行プランを[検査することにより](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgZGF0ZSA-PSAnMjAyMC0xMi0wMScKICBBTkQgZGF0ZSA8PSAnMjAyMC0xMi0zMScKICBBTkQgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results)見ることができます：

```sql
EXPLAIN indexes = 1
SELECT MAX(price) AS highest_price
FROM uk_price_paid_simple_partitioned
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

上記の出力は次のことを示しています：

① パーティションプルーニング: EXPLAIN出力の7〜18行は、ClickHouseが最初に`date`フィールドの[MinMaxインデックス](/partitions#what-are-table-partitions-in-clickhouse)を使用して、クエリの`date`フィルタに一致する行を含む1つのアクティブデータ部分に存在する3257の既存の[グラニュール](/optimize/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)のうち、11を特定したことを示しています。

② グラニュールプルーニング: EXPLAIN出力の19〜24行は、ClickHouseがその後、ステップ①で特定されたデータ部分の[プライマリインデックス](/guides/best-practices/sparse-primary-indexes)（`town`フィールドに対して作成された）を使用して、クエリの`town`フィルタに一致する行を持つグラニュールの数を11から1にさらに減少させたことを示しています。これは、上記で印刷したクエリ実行結果にも反映されています：

```response
... 経過時間: 0.006秒。8.19千行処理、57.34 KB（1.36百万行/s., 9.49 MB/s.)
ピークメモリ使用量: 2.73 MiB。
```

つまり、ClickHouseは、クエリ結果を計算するために、6ミリ秒で1つのグラニュール（[8192](/operations/settings/merge-tree-settings#index_granularity)行のブロック）をスキャンして処理したことになります。

### パーティショニングは主にデータ管理機能である {#partitioning-is-primarily-a-data-management-feature}

すべてのパーティションを跨ぐクエリは、通常、非パーティションテーブルで同じクエリを実行するよりも遅いことに注意してください。

パーティショニングにより、データは通常、より多くのデータ部分に分散されるため、ClickHouseがスキャンおよび処理するデータのボリュームが大きくなることがよくあります。

上記の例テーブルと現在の例テーブルの両方を用いて、どちらのテーブルも[含み](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIHN1bShyb3dzKSBBUyByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCBJTiBbJ3VrX3ByaWNlX3BhaWRfc2ltcGxlJywgJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJ10pIEFORCBhY3RpdmUKR1JPVVAgQlkgdGFibGU7&run_query=true&tab=results)同じデータと行数を持つことが示されています：

```sql
SELECT
    table,
    sum(rows) AS rows
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;

   ┌─table────────────────────────────┬─────rows─┐
1. │ uk_price_paid_simple             │ 25248433 │
2. │ uk_price_paid_simple_partitioned │ 25248433 │
   └──────────────────────────────────┴──────────┘
```

ただし、パーティションが有効なテーブルは、[アクティブなデータ部分](/parts)がより多くなります。これは、前述のように、ClickHouseはデータ部分をパーティション間ではマージせずに[マージ](/parts)するためです：

```sql
SELECT
    table,
    count() AS parts
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;


   ┌─table────────────────────────────┬─parts─┐
1. │ uk_price_paid_simple             │     1 │
2. │ uk_price_paid_simple_partitioned │   436 │
   └──────────────────────────────────┴───────┘
```
前述のように、パーティションテーブル`uk_price_paid_simple_partitioned`には306のパーティションがあり、したがって、少なくとも306のアクティブなデータ部分があります。一方、非パーティションテーブル`uk_price_paid_simple`では、すべての[初期データ部分](/parts)がバックグラウンドマージによって1つのアクティブ部分にマージされることができます。

[確認すると](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results)、パーティションフィルタを含まない例クエリに対する物理的なクエリ実行プランを、パーティション化されたテーブルで実行すると、出力の19行目と20行目で、ClickHouseが3257の既存の[グラニュール](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行のブロック）をスキャンすることを示しています。これは、431のアクティブデータ部分の中に存在し、クエリのフィルタに一致する可能性がある行を持つため、スキャンと処理が必要になります：

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

非パーティションテーブルに対して実行されるクエリの物理的クエリ実行プランは、[実行すると](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results)、出力の11行目と12行目で、ClickHouseがテーブルの単一のアクティブデータ部分内で、 queryのフィルタに一致する可能性のある241の行のブロックを特定したことを示しています：

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

パーティション化されたテーブル上でクエリを実行すると、ClickHouseは671のグラニュール（約550万行）を90ミリ秒でスキャンして処理します：

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE town = 'LONDON';

   ┌─highest_price─┐
1. │     594300000 │ -- 594.30百万
   └───────────────┘

1行のセット。経過時間: 0.090秒。5.48百万行処理、27.95 MB（60.66百万行/s., 309.51 MB/s.)
ピークメモリ使用量: 163.44 MiB。
```

非パーティションテーブルでクエリを実行すると、ClickHouseは241のブロック（約200万行）を12ミリ秒でスキャンして処理します：

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple
WHERE town = 'LONDON';

   ┌─highest_price─┐
1. │     594300000 │ -- 594.30百万
   └───────────────┘

1行のセット。経過時間: 0.012秒。1.97百万行処理、9.87 MB（162.23百万行/s., 811.17 MB/s.)
ピークメモリ使用量: 62.02 MiB。
```
