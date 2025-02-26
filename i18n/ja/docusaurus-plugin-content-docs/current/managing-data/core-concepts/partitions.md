---
slug: /partitions
title: テーブルのパーティション
description: ClickHouseにおけるテーブルのパーティションとは何か
keywords: [partitions, partition by]
---

## ClickHouseにおけるテーブルのパーティションとは何か？ {#what-are-table-partitions-in-clickhouse}

<br/>

パーティションは、[MergeTreeエンジンファミリー](/engines/table-engines/mergetree-family)におけるテーブルの[data parts](/parts)を組織化された論理単位にグループ化します。これは、時間範囲、カテゴリ、または他の重要な属性など、特定の基準に沿ったデータの整理方法を提供します。これらの論理単位により、データの管理、クエリ、および最適化が容易になります。

### パーティションの指定 {#partition-by}

テーブルを最初に定義する際に、[PARTITION BY句](/engines/table-engines/mergetree-family/custom-partitioning-key)を使用することでパーティショニングを有効にできます。この句には、どの行がどのパーティションに属するかを定義するSQL式を含めることができます。

これを示すために、`PARTITION BY toStartOfMonth(date)`句を追加して、プロパティ販売の月に基づいてテーブルのデータ部分を整理する[What are table parts](/parts)の例のテーブルを[強化](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQ&run_query=true&tab=results)します：

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

このテーブルを[クエリ](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZV9wYXJ0aXRpb25lZA&run_query=true&tab=results)できます。

### ディスク上の構造 {#structure-on-disk}

行のセットがテーブルに挿入されるたびに、挿入された行のすべてを含む単一のデータ部分を作成する代わりに、ClickHouseは挿入された行の中でユニークなパーティションキー値ごとに新しいデータ部分を作成します（[ここで説明しているように](/parts)）：

<img src={require('./images/partitions.png').default} alt='INSERT PROCESSING' class='image' />
<br/>

ClickHouseサーバーは、上記の図に示された4行の挿入例の行を、パーティションキー値`toStartOfMonth(date)`で最初に分割します。次に、識別された各パーティションについて、行が[通常通り](/parts)に処理され、いくつかの連続した手順（①ソート、②カラムへの分割、③圧縮、④ディスクへの書き込み）が実行されます。

パーティショニングが有効な場合、ClickHouseはデータ部分ごとに自動的に[MinMaxインデックス](https://github.com/ClickHouse/ClickHouse/blob/dacc8ebb0dac5bbfce5a7541e7fc70f26f7d5065/src/Storages/MergeTree/IMergeTreeDataPart.h#L341)を作成します。これらは、パーティションキー式で使用される各テーブルカラムのファイルであり、そのカラムのデータ部分内の最小値と最大値を含みます。

### パーティションごとのマージ {#per-partition-merges}

パーティショニングが有効である場合、ClickHouseはパーティション内のデータ部分のみを[マージ](https://clickhouse.com/docs/ja/engines/table-engines/mergetree-family)し、パーティション間ではマージしません。これを上記の例のテーブルにスケッチしました：

<img src={require('./images/merges_with_partitions.png').default} alt='PART MERGES' class='image' />
<br/>

上記の図に示されているように、異なるパーティションに属する部分は決してマージされません。高い基数のパーティションキーが選ばれると、数千のパーティションに広がった部分は決してマージ候補にならず、事前に設定された制限を超えて、厄介な`Too many parts`エラーが発生します。これに対処するのは簡単です：[基数が1000..10000未満の適切なパーティションキーを選ぶ](https://github.com/ClickHouse/ClickHouse/blob/ffc5b2c56160b53cf9e5b16cfb73ba1d956f7ce4/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L121)ことです。

## パーティションの監視 {#monitoring-partitions}

私たちは、[クエリ](https://sql.clickhouse.com/?query=U0VMRUNUIERJU1RJTkNUIF9wYXJ0aXRpb25fdmFsdWUgQVMgcGFydGl0aW9uCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKT1JERVIgQlkgcGFydGl0aW9uIEFTQw&run_query=true&tab=results)を使用して、例のテーブルのすべての既存のユニークパーティションのリストを取得できます。これは、[仮想カラム](/engines/table-engines#table_engines-virtual_columns)`_partition_value`を使用しています：

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

また、ClickHouseはすべてのテーブルのすべての部分とパーティションを[system.parts](/operations/system-tables/parts)システムテーブルで追跡しており、以下のクエリは、上記の例のテーブルのすべてのパーティションのリスト、およびこれらのパーティションごとの現在のアクティブ部分の数と行数の合計を[返します](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBwYXJ0aXRpb24sCiAgICBjb3VudCgpIEFTIHBhcnRzLAogICAgc3VtKHJvd3MpIEFTIHJvd3MKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgID0gJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJykgQU5EIGFjdGl2ZQpHUk9VUCBCWSBwYXJ0aXRpb24KT1JERVIgQlkgcGFydGl0aW9uIEFTQzs&run_query=true&tab=results)：

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

## テーブルのパーティションは何に使われるのか？ {#what-are-table-partitions-used-for}

### データ管理 {#data-management}

ClickHouseにおいて、パーティショニングは主にデータ管理機能です。パーティション式に基づいて論理的にデータを整理することで、各パーティションを独立に管理できます。たとえば、上記の例のテーブルにおけるパーティショニングスキームは、[TTLルール](/guides/developer/ttl)を使用して古いデータを自動的に削除することにより、データのメインテーブルに過去12か月のデータのみが保持されるシナリオを可能にします（DDLステートメントの最後の行を参照）：

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

テーブルが`toStartOfMonth(date)`でパーティション分割されているため、TTL条件を満たす全体のパーティション（[テーブル部分](/parts)のセット）が削除され、クリーンアップ操作が効率的になります。[パーツを書き換える必要なく](/sql-reference/statements/alter#mutations)行えます。

同様に、古いデータを削除する代わりに、それを自動的かつ効率的によりコストの低い[ストレージ階層](/integrations/s3#storage-tiers)に移動することもできます：

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

パーティションはクエリのパフォーマンスに寄与しますが、これはアクセスパターンに大きく依存します。クエリがわずか数パーティション（理想的には1つ）を対象とする場合、パフォーマンスが向上する可能性があります。これは、通常、パーティションキーが主キーに含まれていない場合にのみ有用であり、以下の例のクエリに示されるようにそれによってフィルタリングを行います。

```sql
SELECT MAX(price) AS highest_price
FROM uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01' 
  AND date <= '2020-12-31'
  AND town = 'LONDON';

  
   ┌─highest_price─┐
1. │     296280000 │ -- 296.28百万
   └───────────────┘

1行がセットされました。経過時間: 0.006秒。処理された行: 8190行、57.34KB (1.36百万行/秒、9.49MB/秒)。
ピークメモリ使用量: 2.73MiB。
```

このクエリは、上記の例のテーブルに対して実行され、[計算](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIGRhdGUgPj0gJzIwMjAtMTItMDEnCiAgQU5EIGRhdGUgPD0gJzIwMjAtMTItMzEnCiAgQU5EIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results)して、2020年12月にロンドンで売却されたすべての物件の最高価格を、テーブルのパーティションキーで使用されるカラム（`date`）とテーブルの主キーで使用されるカラム（`town`）の両方でフィルタリングして取得します（`date`は主キーの一部ではありません）。

ClickHouseは、このクエリを処理する際、無関係なデータを評価しないようにプルーニング技術のシーケンスを適用します：

<img src={require('./images/partition-pruning.png').default} alt='PART MERGES' class='image' />
<br/>

① **パーティションプルーニング**: [MinMaxインデックス](/partitions#what-are-table-partitions-in-clickhouse)を使用して、テーブルのパーティションキーで使用されるカラムのクエリフィルタに論理的に一致しない全体のパーティション（パーツのセット）を無視します。

② **グラニュールプルーニング**: ステップ①の後の残りのデータ部分に対して、その[主インデックス](/optimize/sparse-primary-indexes)を使用して、テーブルの主キーで使用されるカラムのクエリフィルタに論理的に一致しないすべての[グラニュール](/optimize/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行のブロック）を無視します。

上記の例のクエリの物理的な実行計画を[調査](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgZGF0ZSA-PSAnMjAyMC0xMi0wMScKICBBTkQgZGF0ZSA8PSAnMjAyMC0xMi0zMScKICBBTkQgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results)することにより、これらのデータプルーニングステップを観察できます：

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

上記の出力は次のようになります：

① パーティションプルーニング: EXPLAIN出力の行7から18まででは、ClickHouseが最初に`date`フィールドの[MinMaxインデックス](/partitions#what-are-table-partitions-in-clickhouse)を使用して、3257の既存の[グラニュール](/optimize/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行のブロック）のうち11を特定し、それらがクエリの`date`フィルタに一致する行を含む1つの436のアクティブデータ部分から取得されていることを示しています。

② グラニュールプルーニング: EXPLAIN出力の行19から24は、ClickHouseがステップ①で特定したデータ部分の[主インデックス](/optimize/sparse-primary-indexes)（`town`フィールド上に作成された）を使用して、グラニュール（クエリの`town`フィルタに一致する行を含む可能性がある行を持つ）をさらに11から1に減少させたことを示しています。これは、上記で印刷したクエリ実行結果にも反映されています：

```response
... 経過時間: 0.006秒。処理された行: 8190行、57.34KB (1.36百万行/秒、9.49MB/秒)。
ピークメモリ使用量: 2.73MiB。
```

これは、ClickHouseが結果を計算するために6ミリ秒で1つのグラニュール（[8192](/operations/settings/merge-tree-settings#index_granularity)行のブロック）をスキャンして処理したことを意味します。

### パーティショニングは主にデータ管理機能です {#partitioning-is-primarily-a-data-management-feature}

全てのパーティションを横断するクエリは、通常、非パーティションテーブルに対して同じクエリを実行するよりも遅いことを認識してください。

パーティショニングにより、データは通常、より多くのデータ部分に分散されるため、ClickHouseがスキャンして処理するデータのボリュームが大きくなります。

これを示すために、[What are table parts](/parts)の例のテーブル（パーティショニングが有効でない）と、上記の現在の例のテーブル（パーティショニングが有効である）について同じクエリを実行します。両方のテーブルは[同じ](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIHN1bShyb3dzKSBBUyByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCBJTiBbJ3VrX3ByaWNlX3BhaWRfc2ltcGxlJywgJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJ10pIEFORCBhY3RpdmUKR1JPVVAgQlkgdGFibGU7&run_query=true&tab=results)データと行の数を含んでいます：

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

しかし、パーティションが有効なテーブルは、[アクティブなデータ部分](/parts)がより多くなります。前述のように、ClickHouseは[マージ](/parts)をパーティション間ではなく内部で行うため、次のクエリを実行すると：

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

上記で示したように、パーティションが分割されたテーブル`uk_price_paid_simple_partitioned`は306のパーティションを持ち、そのため少なくとも306のアクティブデータ部分を持っています。一方、非パーティショニングされたテーブル`uk_price_paid_simple`では、すべての[初期](/parts)データ部分が1つのアクティブ部分にマージされることができます。

[確認した](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results)とき、上記の例のクエリに対してパーティションフィルタなしでパーティションテーブル上で実行された物理的なクエリ実行計画で、出力の行19と20においてClickHouseは3257の既存の[グラニュール](/optimize/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行のブロック）のうち671を確認し、それらはパーティションテーブルの431のアクティブなデータ部分に分散されていて、行を含む可能性があることがわかります。このため、クエリエンジンはこれをスキャンして処理する必要があります：

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

同じクエリを実行する場合、非パーティショニングテーブルでの実行結果は、出力の行11と12において、ClickHouseが単一のアクティブデータ部分内に存在する241の3083のグラニュールを確認し、クエリのフィルタに一致する行を持つ可能性があることを示します：

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

[パーティションテーブルの上で](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results)クエリを実行すると、ClickHouseは671の行のブロック（約550万行）を90ミリ秒でスキャンして処理します：

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE town = 'LONDON';


   ┌─highest_price─┐
1. │     594300000 │ -- 594.30百万
   └───────────────┘

1行がセットされました。経過時間: 0.090秒。処理された行: 5485577行、27.95MB (6066.0万行/秒、309.51MB/秒)。
ピークメモリ使用量: 163.44MiB。
```

それに対して、[非パーティショニングテーブルで実行した場合](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results)、ClickHouseは241のブロック（約200万行）を12ミリ秒でスキャンして処理します：

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple
WHERE town = 'LONDON';


   ┌─highest_price─┐
1. │     594300000 │ -- 594.30百万
   └───────────────┘

1行がセットされました。経過時間: 0.012秒。処理された行: 1974664行、9.87MB (162.23百万行/秒、811.17MB/秒)。
ピークメモリ使用量: 62.02MiB。
```
