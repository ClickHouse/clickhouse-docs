---
'slug': '/partitions'
'title': 'テーブルパーティション'
'description': 'ClickHouseのテーブルパーティションとは何ですか'
'keywords':
- 'partitions'
- 'partition by'
---

import partitions from '@site/static/images/managing-data/core-concepts/partitions.png';
import merges_with_partitions from '@site/static/images/managing-data/core-concepts/merges_with_partitions.png';
import partition_pruning from '@site/static/images/managing-data/core-concepts/partition-pruning.png';
import Image from '@theme/IdealImage';


## ClickHouseのテーブルパーティションとは何ですか？ {#what-are-table-partitions-in-clickhouse}

<br/>

パーティションは、[MergeTreeエンジンファミリー](/engines/table-engines/mergetree-family)のテーブルの[data parts](/parts)を、時間範囲、カテゴリ、またはその他の主要な属性などの特定の基準に沿った概念的に意味のある方法でデータを整理する論理単位にグループ化します。これらの論理単位により、データの管理、クエリ、および最適化が容易になります。

### パーティションの方法 {#partition-by}

パーティションは、[PARTITION BY句](/engines/table-engines/mergetree-family/custom-partitioning-key)を介してテーブルが最初に定義される際に有効にできます。この句には、SQL式を含むことができ、その結果が行が属するパーティションを定義します。

これを示すために、私たちは[What are table parts](/parts)の例のテーブルに `PARTITION BY toStartOfMonth(date)` 句を追加して、テーブルのデータパーツを物件販売の月に基づいて整理します:

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

このテーブルを[クエリ](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZV9wYXJ0aXRpb25lZA&run_query=true&tab=results)することができます。

### ディスク上の構造 {#structure-on-disk}

行のセットがテーブルに挿入されるとき、ClickHouseはすべての挿入された行を含む（[少なくとも](/operations/settings/settings#max_insert_block_size)）単一のデータパートを作成するのではなく、挿入された行の間の各一意のパーティションキー値ごとに新しいデータパートを作成します:

<Image img={partitions} size="lg"  alt='INSERT PROCESSING' />

<br/>

ClickHouseサーバーは、まず、上記の図にスケッチされた4行の例の挿入から、パーティションキー値 `toStartOfMonth(date)` によって行を分割します。
その後、特定された各パーティションに対して、行は[通常通り](/parts)に次のいくつかの順次ステップを実行して処理されます（①ソート、②カラムへの分割、③圧縮、④ディスクへの書き込み）。

パーティションが有効になっている場合、ClickHouseは自動的に各データパートのために[MinMaxインデックス](https://github.com/ClickHouse/ClickHouse/blob/dacc8ebb0dac5bbfce5a7541e7fc70f26f7d5065/src/Storages/MergeTree/IMergeTreeDataPart.h#L341)を作成します。これらはパーティションキー表現で使用される各テーブルカラムの最小および最大値を含むファイルです。

### パーティション毎のマージ {#per-partition-merges}

パーティションが有効になっている場合、ClickHouseはパーティションの内側でのみ[data parts](/merges)を[マージ](/merges)しますが、パーティション間ではマージしません。これは、上記の例のテーブルのためにスケッチされています:

<Image img={merges_with_partitions} size="lg"  alt='PART MERGES' />

<br/>

上記の図にスケッチされたように、異なるパーティションに属するパーツは決してマージされません。高いカーディナリティのパーティションキーが選択された場合、何千ものパーティションにまたがるパーツは、事前に設定された制限を超え、忌まわしい `Too many parts` エラーを引き起こすことになります。この問題に対処するのは簡単です: [カーディナリティが1000〜10000以下の理にかなった](https://github.com/ClickHouse/ClickHouse/blob/ffc5b2c56160b53cf9e5b16cfb73ba1d956f7ce4/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L121)パーティションキーを選択してください。

## パーティションの監視 {#monitoring-partitions}

私たちは、[仮想カラム](/engines/table-engines#table_engines-virtual_columns) `_partition_value` を使用して、例のテーブルのすべての既存のユニークパーティションのリストを[クエリ](https://sql.clickhouse.com/?query=U0VMRUNUIERJU1RJTkNUIF9wYXJ0aXRpb25fdmFsdWUgQVMgcGFydGl0aW9uCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKT1JERVIgQlkgcGFydGl0aW9uIEFTQw&run_query=true&tab=results)できます:

```sql runnable
SELECT DISTINCT _partition_value AS partition
FROM uk.uk_price_paid_simple_partitioned
ORDER BY partition ASC;

Alternatively, ClickHouseは、すべてのテーブルのすべてのパーツとパーティションを[system.parts](/operations/system-tables/parts)システムテーブルで追跡し、次のクエリは、上記の例のテーブルのすべてのパーティションのリストに加えて、各パーティション内のアクティブなパーツの現在の数とそのパーツ内の行の合計を[返します](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBwYXJ0aXRpb24sCiAgICBjb3VudCgpIEFTIHBhcnRzLAogICAgc3VtKHJvd3MpIEFTIHJvd3MKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgID0gJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJykgQU5EIGFjdGl2ZQpHUk9VUCBCWSBwYXJ0aXRpb24KT1JERVIgQlkgcGFydGl0aW9uIEFTQzs&run_query=true&tab=results):

```sql runnable
SELECT
    partition,
    count() AS parts,
    sum(rows) AS rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple_partitioned') AND active
GROUP BY partition
ORDER BY partition ASC;

## テーブルパーティションは何に使われるのですか？ {#what-are-table-partitions-used-for}

### データ管理 {#data-management}

ClickHouseにおいて、パーティショニングは主にデータ管理機能です。パーティション式に基づいて論理的にデータを整理することで、各パーティションを独立して管理できます。たとえば、上記の例のテーブルのパーティショニングスキームは、TTLルールを使用して古いデータを自動的に削除することにより、主テーブルに過去12か月のデータのみを保持するシナリオを有効にします（DDL文の最後の行を参照）:

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

テーブルは `toStartOfMonth(date)` でパーティション化されているため、TTL条件を満たす全体のパーティション（[table parts](/parts)のセット）がドロップされ、クリーンアップ操作がより効率的になります。[パーツを書き直す必要がなくなります](/sql-reference/statements/alter#mutations)。

同様に、古いデータを削除する代わりに、それをよりコスト効率の良い[ストレージ層](/integrations/s3#storage-tiers)に自動的かつ効率的に移動できます:

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

### クエリの最適化 {#query-optimization}

パーティションはクエリのパフォーマンスを助けることができますが、これは主にアクセスパターンに依存します。クエリが少数のパーティション（理想的には1つ）のみをターゲットにすると、パフォーマンスが向上する可能性があります。これは、以下の例のクエリのように、パーティショニングキーが主キーに含まれておらず、それによってフィルタリングしている場合にのみ通常は有効です。

```sql runnable
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01'
  AND date <= '2020-12-31'
  AND town = 'LONDON';

このクエリは、上記の例のテーブルで実行され、ロンドンで販売されたすべてのプロパティの2020年12月の最高価格を[計算](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIGRhdGUgPj0gJzIwMjAtMTItMDEnCiAgQU5EIGRhdGUgPD0gJzIwMjAtMTItMzEnCiAgQU5EIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results)します。フィルタリングには、テーブルのパーティションキーで使用されるカラム（`date`）とテーブルの主キーで使用されるカラム（`town`）の両方で行います（`date`は主キーの一部ではありません）。

ClickHouseは、関連のないデータを評価しないように一連のプルーニング技術を適用することで、そのクエリを処理します:

<Image img={partition_pruning} size="lg"  alt='PART MERGES 2' />

<br/>

① **パーティションプルーニング**: [MinMaxインデックス](/partitions#what-are-table-partitions-in-clickhouse)を使用して、テーブルのパーティションキーで使用されるカラムのクエリフィルタに論理的に一致しない全体のパーティション（パーツのセット）を無視します。

② **グラニュールプルーニング**: ステップ①の後の残りのデータパーツに対して、[主インデックス](/guides/best-practices/sparse-primary-indexes)を使用して、テーブルの主キーで使用されるカラムのクエリフィルタに論理的に一致しないすべての[グラニュール](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行のブロック）を無視します。

これらのデータプルーニングステップは、上記の例のクエリに対して物理的なクエリ実行計画を[検査](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgZGF0ZSA-PSAnMjAyMC0xMi0wMScKICBBTkQgZGF0ZSA8PSAnMjAyMC0xMi0zMScKICBBTkQgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results)することで観察できます:

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

上記の出力は次のことを示しています。

① パーティションプルーニング: EXPLAIN出力の行7から18は、ClickHouseが最初に `date` フィールドの[MinMaxインデックス](/partitions#what-are-table-partitions-in-clickhouse)を使用して、クエリの `date` フィルタに一致する行を含む436の既存アクティブデータパーツのうち、3257の既存[グラニュール](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行のブロック）のうち、11を特定したことを示しています。

② グラニュールプルーニング: EXPLAIN出力の19行から24は、ClickHouseがステップ①で特定されたデータパートの[主インデックス](/guides/best-practices/sparse-primary-indexes)（`town`フィールドの上に作成された）を使用して、クエリの `town` フィルタに一致する行を含む可能性のあるグラニュールの数を11から1にさらに削減したことを示しています。これは、上記のクエリを実行した際に印刷されたClickHouseクライアントの出力にも反映されています:

```response
... Elapsed: 0.006 sec. Processed 8.19 thousand rows, 57.34 KB (1.36 million rows/s., 9.49 MB/s.)
Peak memory usage: 2.73 MiB.

つまり、ClickHouseはクエリ結果を計算するために、6ミリ秒で8192行の1つのグラニュール（/operations/settings/merge-tree-settings#index_granularity）をスキャンして処理したわけです。

### パーティショニングは主にデータ管理機能です {#partitioning-is-primarily-a-data-management-feature}

すべてのパーティションを跨いでクエリを実行することは、通常、非パーティション化テーブルで同じクエリを実行するよりも遅くなることに注意してください。

パーティショニングを使用すると、データは通常、より多くのデータパーツに分散されるため、ClickHouseがスキャンして処理するデータのボリュームが大きくなることがよくあります。

これを示すために、私たちは[What are table parts](/parts)の例のテーブル（パーティショニングが無効な場合）と、上記の現在の例のテーブル（パーティショニングが有効な場合）で同じクエリを実行します。両方のテーブルは[同じデータと行数を含んでいます](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIHN1bShyb3dzKSBBUyByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCBJTiBbJ3VrX3ByaWNlX3BhaWRfc2ltcGxlJywgJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJ10pIEFORCBhY3RpdmUKR1JPVVAgQlkgdGFibGU7&run_query=true&tab=results):

```sql runnable
SELECT
    table,
    sum(rows) AS rows
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;

しかし、パーティションが有効なテーブルは、上記のように、[アクティブなデータパーツ](/parts)の数が多くなります。前述したように、ClickHouseはデータパーツを[マージ](/parts)する際、パーティション間ではなく、内部でのみマージします。

```sql runnable
SELECT
    table,
    count() AS parts
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;

上記に示したように、パーティション化されたテーブル `uk_price_paid_simple_partitioned` は600以上のパーティションを持ち、そのため606の306のアクティブデータパーツがあります。一方、非パーティション化テーブル `uk_price_paid_simple` はすべての[初期](/parts)データパーツがバックグラウンドマージによって単一のアクティブパートにマージされることができます。

私たちが[確認](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results)したとき、上記の例のクエリをパーティションテーブル上でパーティションフィルタなしで実行すると、ClickHouseは出力の行19と20で、3257の既存[グラニュール](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行のブロック）のうち671を431の436の既存アクティブデータパーツに広がって特定し、クエリのフィルタに一致する行を含む可能性のあるものをスキャンし、処理します:

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

非パーティション化テーブルに対して同じ例のクエリの物理クエリ実行計画は、出力の行11と12に示されており、ClickHouseはテーブルの単一アクティブデータパート内の3083の既存の行ブロックのうち241を特定しました。これらの行ブロックはクエリのフィルタに一致する可能性があります。

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

パーティション化されたテーブルでクエリを[実行](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results)すると、ClickHouseは671の行のブロック（約550万行）を90ミリ秒でスキャンして処理します:

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE town = 'LONDON';

┌─highest_price─┐
│     594300000 │ -- 594.30 million
└───────────────┘

1 row in set. Elapsed: 0.090 sec. Processed 5.48 million rows, 27.95 MB (60.66 million rows/s., 309.51 MB/s.)
Peak memory usage: 163.44 MiB.

一方で、非パーティション化テーブルに対して[実行](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results)すると、ClickHouseは241のブロック（約200万行）を12ミリ秒でスキャンして処理します:

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple
WHERE town = 'LONDON';

┌─highest_price─┐
│     594300000 │ -- 594.30 million
└───────────────┘

1 row in set. Elapsed: 0.012 sec. Processed 1.97 million rows, 9.87 MB (162.23 million rows/s., 811.17 MB/s.)
Peak memory usage: 62.02 MiB.

