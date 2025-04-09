---
slug: /partitions
title: テーブルパーティション
description: ClickHouseのテーブルパーティションとは
keywords: [partitions, partition by]
---

import partitions from '@site/static/images/managing-data/core-concepts/partitions.png';
import merges_with_partitions from '@site/static/images/managing-data/core-concepts/merges_with_partitions.png';
import partition_pruning from '@site/static/images/managing-data/core-concepts/partition-pruning.png';

## ClickHouseのテーブルパーティションとは？ {#what-are-table-partitions-in-clickhouse}

<br/>

パーティションは、[MergeTreeエンジンファミリー](/engines/table-engines/mergetree-family)のテーブルの[データパーツ](/parts)を組織的かつ論理的な単位にグループ化します。これは、時間範囲、カテゴリー、または他のキー属性など、特定の基準に沿った概念的に意味のあるデータの整理方法です。これらの論理的な単位は、データの管理、クエリ、最適化を容易にします。

### パーティションの定義 {#partition-by}

テーブルを最初に定義する際に、[PARTITION BY句](/engines/table-engines/mergetree-family/custom-partitioning-key)を使用してパーティションを有効にできます。この句には、任意のカラムに対するSQL式を含めることができ、結果として行がどのパーティションに属するかを定義します。

これを示すために、`PARTITION BY toStartOfMonth(date)`句を追加し、テーブルのデータパーツをプロパティの販売に基づいて月ごとに整理する[What are table parts](/parts)の例テーブルを[強化](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQ&run_query=true&tab=results)します：

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

このテーブルを[クエリ](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZV9wYXJ0aXRpb25lZA&run_query=true&tab=results)することができます。

### ディスク上の構造 {#structure-on-disk}

行のセットがテーブルに挿入されるたびに、挿入されたすべての行を含む（[最低限](/operations/settings/settings#max_insert_block_size)）1つのデータパートを作成するのではなく、ClickHouseは挿入された行の中で各ユニークパーティションキー値ごとに1つの新しいデータパートを作成します：

<img src={partitions} alt='INSERT PROCESSING' class='image' />
<br/>

ClickHouseサーバーは、上記の図でスケッチされた4行の例挿入から行をそのパーティションキー値`toStartOfMonth(date)`に従って最初に分割します。
その後、特定された各パーティションの行は、[通常通り](/parts)に処理されます（① ソート、② カラムへの分割、③ 圧縮、④ ディスクへの書き込み）。

パーティションが有効になっている場合、ClickHouseは自動的に各データパートに対して[MinMaxインデックス](https://github.com/ClickHouse/ClickHouse/blob/dacc8ebb0dac5bbfce5a7541e7fc70f26f7d5065/src/Storages/MergeTree/IMergeTreeDataPart.h#L341)を作成することに注意してください。これらは、パーティションキー式に使用される各テーブルカラムの最小値と最大値を含むファイルです。

### パーティション内のマージ {#per-partition-merges}

パーティションが有効になっている場合、ClickHouseはパーティション内でのみデータパーツを[マージ](/merges)し、パーティション間ではマージしません。上記の例テーブルについてこれをスケッチします：

<img src={merges_with_partitions} alt='PART MERGES' class='image' />
<br/>

上記の図でスケッチされているように、異なるパーティションに属するパーツは決してマージされません。高いカーディナリティのパーティションキーが選択された場合、何千ものパーティションに分散されたパーツは、事前に構成された制限を超えてマージ候補にはなりません。この問題に対処するのは簡単です：カーディナリティが1000から10000未満の合理的なパーティションキーを選択してください。[こちら](https://github.com/ClickHouse/ClickHouse/blob/ffc5b2c56160b53cf9e5b16cfb73ba1d956f7ce4/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L121)をご覧ください。

## パーティションの監視 {#monitoring-partitions}

例テーブルのすべての既存ユニークパーティションのリストを[クエリ](https://sql.clickhouse.com/?query=U0VMRUNUIERJU1RJTkNUIF9wYXJ0aXRpb25fdmFsdWUgQVMgcGFydGl0aW9uCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKT1JERVIgQlkgcGFydGl0aW9uIEFTQw&run_query=true&tab=results)することができます。その際、[仮想カラム](/engines/table-engines#table_engines-virtual_columns)`_partition_value`を使用します：

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

あるいは、ClickHouseは[system.parts](/operations/system-tables/parts)システムテーブルのすべてのテーブルのすべてのパーツとパーティションを追跡しており、以下のクエリは[こちら](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBwYXJ0aXRpb24sCiAgICBjb3VudCgpIEFTIHBhcnRzLAogICAgc3VtKHJvd3MpIEFTIHJvd3MKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgID0gJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJykgQU5EIGFjdGl2ZQpHUk9VUCBCWSBwYXJ0aXRpb24KT1JERVIgQlkgcGFydGl0aW9uIEFTQzs&run_query=true&tab=results)の例テーブルに対してすべてのパーティションのリスト、アクティブなパーツの現在の数、およびこれらのパーツごとの行の合計を返します：

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

## テーブルパーティションの使用用途 {#what-are-table-partitions-used-for}

### データ管理 {#data-management}

ClickHouseでは、パーティショニングは主にデータ管理機能です。パーティション式に基づいて論理的にデータを整理することで、各パーティションを独立して管理できます。たとえば、上記の例テーブルのパーティショニングスキームを使用すると、[TTLルール](/guides/developer/ttl)を使用して自動的に古いデータを削除することにより、過去12か月のデータのみがメインテーブルに保持されるシナリオを可能にします（DDL文の最後の行を参照）。

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
テーブルは`toStartOfMonth(date)`でパーティション分けされているため、TTL条件を満たす全体のパーティション（[テーブルパーツ](/parts)のセット）が削除され、クリーンアップ操作がより効率的になり、[パーツを再作成する必要がなくなります](/sql-reference/statements/alter#mutations)。

同様に、古いデータを削除する代わりに、よりコスト効率の高い[ストレージティア](/integrations/s3#storage-tiers)に自動的かつ効率的に移動することができます：

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

パーティションはクエリのパフォーマンスを助けることがありますが、これはアクセスパターンに大きく依存します。クエリがわずか数個のパーティション（理想的には1つ）のみにターゲットを絞示す場合、パフォーマンスは向上する可能性があります。これは、パーティショニングキーが主キーには含まれておらず、その条件でフィルタリングを行っている場合に通常役立ちます。以下のクエリ例のように。

```sql
SELECT MAX(price) AS highest_price
FROM uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01'
  AND date <= '2020-12-31'
  AND town = 'LONDON';


   ┌─highest_price─┐
1. │     296280000 │ -- 296.28百万
   └───────────────┘

1行がセットされました。経過時間: 0.006秒。処理された行数: 8190、サイズ: 57.34 KB (1.36百万行/秒、9.49 MB/秒)。
ピークメモリ使用量: 2.73 MiB。
```

このクエリは上記の例テーブル上で実行され、2020年12月にロンドンで売却されたすべての物件の最高販売価格をフィルタリングしながら計算します（`date`カラムはテーブルのパーティションキーに使用され、`town`カラムはテーブルの主キーに使用されていますが、`date`は主キーの一部ではありません）。

ClickHouseは、このクエリを関連のないデータを評価しないようにプルーニング技術を適用して処理します：

<img src={partition_pruning} alt='PART MERGES' class='image' />
<br/>

① **パーティションプルーニング**: [MinMaxインデックス](/partitions#what-are-table-partitions-in-clickhouse)は、テーブルのパーティションキーに使用されているカラムにかかるクエリのフィルターに論理的に一致しない全体のパーティション（パーツのセット）を無視するために使用されます。

② **グラニュールプルーニング**: ステップ①の後の残りのデータパーツに対して、[主インデックス](/guides/best-practices/sparse-primary-indexes)を使用して、主キーに使用されるカラムにかかるクエリのフィルターに論理的に一致しないすべての[グラニュール](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行のブロック）を無視します。

これらのデータプルーニング手順を[確認することで、](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgZGF0ZSA-PSAnMjAyMC0xMi0wMScKICBBTkQgZGF0ZSA8PSAnMjAyMC0xMi0zMScKICBBTkQgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results)上記の例クエリの物理的な実行計画を[EXPLAIN](/sql-reference/statements/explain)句を使用して検査することができます：

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

① パーティションプルーニング: EXPLAIN出力の行7から行18は、ClickHouseが最初に`date`フィールドの[MinMaxインデックス](/partitions#what-are-table-partitions-in-clickhouse)を使用して、3257の既存[グラニュール](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)の中から11を特定し、1つのアクティブなデータパートに含まれる行のうち、クエリの`date`フィルターに一致する行を持つものを特定します。

② グラニュールプルーニング: EXPLAIN出力の行19から行24は、ClickHouseがステップ①で特定されたデータパートの[`town`フィールドを対象にした主インデックス](/guides/best-practices/sparse-primary-indexes)を使用して、クエリの`town`フィルターに一致する行も含む可能性があるグラニュールの数を11から1にさらに減らしたことを示しています。

その結果、ClickHouseは1つのグラニュール（[8192](/operations/settings/merge-tree-settings#index_granularity)行のブロック）をスキャンして6ミリ秒かけてクエリ結果を計算しました。

### パーティショニングは主にデータ管理機能です {#partitioning-is-primarily-a-data-management-feature}

すべてのパーティションを横断したクエリは、通常、非パーティションテーブルで同じクエリを実行するよりも遅いことを認識してください。

パーティショニングを使用することで、データは通常、より多くのデータパーツに分散され、これによりClickHouseがスキャンおよび処理するデータの量が大きくなることがよくあります。

これを示すために、[What are table parts](/parts)の例テーブル（パーティショニングが有効でない）と、上記の現在の例テーブル（パーティショニングが有効である）で同じクエリを実行してみます。両方のテーブルには[次のように](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIHN1bShyb3dzKSBBUyByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCBJTiBbJ3VrX3ByaWNlX3BhaWRfc2ltcGxlJywgJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJ10pIEFORCBhY3RpdmUKR1JPVVAgQlkgdGFibGU7&run_query=true&tab=results)同じデータと行数が含まれています：

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

ただし、パーティションが有効なテーブルは、[こちらを参照してください](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIGNvdW50KCkgQVMgcGFydHMKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgIElOIFsndWtfcHJpY2VfcGFpZF9zaW1wbGUnLCAndWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQnXSkgQU5EIGFjdGl2ZQpHUk9VUCBCWSB0YWJsZTs&run_query=true&tab=results)アクティブな[データパーツ](/parts)がより多くあります。前述のように、ClickHouseはデータパーツをパーティション内でのみ[マージ](/parts)するためです：

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

上記に示したように、パーティション化されたテーブル`uk_price_paid_simple_partitioned`は306のパーティションを持ち、したがって少なくとも306のアクティブなデータパーツを持っています。それに対して、非パーティションテーブル`uk_price_paid_simple`のすべての[初期](/parts)データパーツは、バックグラウンドマージによって単一のアクティブパートにマージされることができました。

私たちが[チェック](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results)する場合、物理的なクエリ実行計画を[EXPLAIN](/sql-reference/statements/explain)句を使ってパーティションフィルターなしでパーティション化されたテーブルを実行した結果、出力の行19と20において、ClickHouseは3257の既存[グラニュール](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)のうち671を特定し、436のアクティブデータパーツに分散されており、クエリのフィルターに一致する可能性のある行を含むことを示しています。したがって、これらの行はクエリエンジンによってスキャンおよび処理されます：

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

非パーティションテーブルの同じ例クエリの物理的なクエリ実行計画は[こちら](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results)で示されており、出力の行11と12でClickHouseがクエリのフィルターに一致する行を含む可能性があるテーブルの単一のアクティブデータパート内の3083の既存の行のブロックの中から241を特定したことを示しています：

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

パーティション化されたテーブルのクエリを実行する際に、ClickHouseは671の行のブロックをスキャンおよび処理し（約550万行）90ミリ秒かかります：

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE town = 'LONDON';


   ┌─highest_price─┐
1. │     594300000 │ -- 594.30百万
   └───────────────┘

1行がセットされました。経過時間: 0.090秒。処理された行数: 5484917、サイズ: 27.95 MB (60.66百万行/秒、309.51 MB/秒)。
ピークメモリ使用量: 163.44 MiB。
```

一方、非パーティションテーブルでクエリを実行した場合、ClickHouseは241のブロック（約200万行）をスキャンおよび処理し、12ミリ秒かかります：

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple
WHERE town = 'LONDON';


   ┌─highest_price─┐
1. │     594300000 │ -- 594.30百万
   └───────────────┘

1行がセットされました。経過時間: 0.012秒。処理された行数: 1973644、サイズ: 9.87 MB (162.23百万行/秒、811.17 MB/秒)。
ピークメモリ使用量: 62.02 MiB。
```
