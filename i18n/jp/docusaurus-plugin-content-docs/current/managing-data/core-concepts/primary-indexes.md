---
slug: '/primary-indexes'
title: '主キーインデックス'
description: 'ClickHouseにおけるスパース主キーインデックスの動作'
keywords:
- 'sparse primary index'
- 'primary index'
- 'index'
---

import visual01 from '@site/static/images/managing-data/core-concepts/primary-index-light_01.gif';
import visual02 from '@site/static/images/managing-data/core-concepts/primary-index-light_02.gif';
import visual03 from '@site/static/images/managing-data/core-concepts/primary-index-light_03.gif';
import Image from '@theme/IdealImage';

:::tip 高度なインデックス詳細をお探しですか？
このページでは、ClickHouseのスパース主インデックス、その構築方法、動作方法、およびクエリの高速化にどのように役立つかを紹介します。

高度なインデックス戦略やより深い技術詳細については、[主インデックスの深堀り](/guides/best-practices/sparse-primary-indexes)を参照してください。
:::


## ClickHouseにおけるスパース主インデックスの動作方法 {#how-does-the-sparse-primary-index-work-in-clickHouse}

<br/>

ClickHouseのスパース主インデックスは、[グラニュール](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)—行のブロック—を効率的に特定し、テーブルの主キー列に対するクエリの条件に一致するデータを含む可能性のあるグラニュールを特定するのに役立ちます。次のセクションでは、これらの列の値からこのインデックスがどのように構築されるかを説明します。

### スパース主インデックスの作成 {#sparse-primary-index-creation}

スパース主インデックスがどのように構築されるかを示すために、[uk_price_paid_simple](https://clickhouse.com/docs/parts) テーブルを使用し、いくつかのアニメーションを加えます。

[リマインダー](https://clickhouse.com/docs/parts)として、私たちの①のサンプルテーブルでは、主キー(town, street)を持ち、②挿入データは③ディスクに保存され、主キー列の値でソートされ、圧縮されて各カラムごとに別々のファイルに格納されています：

<Image img={visual01} size="lg"/>

<br/><br/>

処理のために、各カラムのデータは④論理的にグラニュールに分割されます—各グラニュールは8,192行をカバーします—これはClickHouseのデータ処理メカニズムが扱う最小単位です。

このグラニュール構造こそが、主インデックスを**スパース**にする理由です：すべての行をインデックスするのではなく、ClickHouseは⑤各グラニュールから1行の主キー値—具体的には最初の行—のみを保存します。これにより、各グラニュールにつき1つのインデックスエントリが生成されます：

<Image img={visual02} size="lg"/>

<br/><br/>

そのスパース性のおかげで、主インデックスはメモリに完全に収まるほど小さく、主キー列のプレディケートに基づくクエリの高速フィルタリングを可能にします。次のセクションでは、どのようにこのインデックスがクエリを加速させるかを示します。

### 主インデックスの使用 {#primary-index-usage}

スパース主インデックスがクエリの加速にどのように使用されるかを、別のアニメーションで概説します：

<Image img={visual03} size="lg"/>

<br/><br/>

① サンプルクエリには、両方の主キー列に対するプレディケートが含まれています： `town = 'LONDON' AND street = 'OXFORD STREET'` 。

② クエリを加速させるために、ClickHouseはテーブルの主インデックスをメモリにロードします。

③ 次に、インデックスエントリをスキャンして、どのグラニュールがプレディケートに一致する行を含む可能性があるかを特定します—言い換えれば、どのグラニュールをスキップできないかを特定します。

④ これらの潜在的に関連するグラニュールは、クエリに必要な他のカラムからの対応するグラニュールと共にメモリにロードされ、[処理](/optimize/query-parallelism)されます。

## 主インデックスの監視 {#monitoring-primary-indexes}

テーブル内の各[data part](/parts)には独自の主インデックスがあります。これらのインデックスの内容は、[mergeTreeIndex](/sql-reference/table-functions/mergeTreeIndex)テーブル関数を使用して検査できます。

次のクエリは、サンプルテーブルの各データパートの主インデックスのエントリ数をリストします：

```sql
SELECT
    part_name,
    max(mark_number) as entries
FROM mergeTreeIndex('uk', 'uk_price_paid_simple')
GROUP BY part_name;

```txt
   ┌─part_name─┬─entries─┐
1. │ all_2_2_0 │     914 │
2. │ all_1_1_0 │    1343 │
3. │ all_0_0_0 │    1349 │
   └───────────┴─────────┘

このクエリは、現在のデータパートのいずれかの主インデックスからの最初の10エントリを示しています。これらのパーツはバックグラウンドで継続的に[マージ](/merges)され、より大きなパーツに統合されます：

```sql 
SELECT 
    mark_number + 1 as entry,
    town,
    street
FROM mergeTreeIndex('uk', 'uk_price_paid_simple')
WHERE part_name = (SELECT any(part_name) FROM mergeTreeIndex('uk', 'uk_price_paid_simple')) 
ORDER BY mark_number ASC
LIMIT 10;

```txt
    ┌─entry─┬─town───────────┬─street───────────┐
 1. │     1 │ ABBOTS LANGLEY │ ABBEY DRIVE      │
 2. │     2 │ ABERDARE       │ RICHARDS TERRACE │
 3. │     3 │ ABERGELE       │ PEN Y CAE        │
 4. │     4 │ ABINGDON       │ CHAMBRAI CLOSE   │
 5. │     5 │ ABINGDON       │ THORNLEY CLOSE   │
 6. │     6 │ ACCRINGTON     │ MAY HILL CLOSE   │
 7. │     7 │ ADDLESTONE     │ HARE HILL        │
 8. │     8 │ ALDEBURGH      │ LINDEN ROAD      │
 9. │     9 │ ALDERSHOT      │ HIGH STREET      │
10. │    10 │ ALFRETON       │ ALMA STREET      │
    └───────┴────────────────┴──────────────────┘

最後に、[EXPLAIN](/sql-reference/statements/explain)句を使用して、すべてのデータパートの主インデックスが、サンプルクエリのプレディケートに一致する行を含む可能性がないグラニュールをスキップするためにどのように使用されるかを確認します。これらのグラニュールは、ロードおよび処理から除外されます：
```sql
EXPLAIN indexes = 1
SELECT
    max(price)
FROM
    uk.uk_price_paid_simple
WHERE
    town = 'LONDON' AND street = 'OXFORD STREET';

```txt
    ┌─explain────────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))                                                                  │
 2. │   Aggregating                                                                                              │
 3. │     Expression (Before GROUP BY)                                                                           │
 4. │       Expression                                                                                           │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple)                                                        │
 6. │         Indexes:                                                                                           │
 7. │           PrimaryKey                                                                                       │
 8. │             Keys:                                                                                          │
 9. │               town                                                                                         │
10. │               street                                                                                       │
11. │             Condition: and((street in ['OXFORD STREET', 'OXFORD STREET']), (town in ['LONDON', 'LONDON'])) │
12. │             Parts: 3/3                                                                                     │
13. │             Granules: 3/3609                                                                               │
    └────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

EXPLAINの出力の13行目は、全データパートにわたって3,609のグラニュールのうち3つだけが主インデックス解析によって処理されるために選択されたことを示しています。残りのグラニュールは完全にスキップされました。

また、クエリを実行することでほとんどのデータがスキップされたことも確認できます：
```sql 
SELECT max(price)
FROM uk.uk_price_paid_simple
WHERE (town = 'LONDON') AND (street = 'OXFORD STREET');

```txt
   ┌─max(price)─┐
1. │  263100000 │ -- 263.10百万
   └────────────┘

1行の結果がセットされました。経過時間: 0.010 秒。処理された行数: 24.58 千行、サイズ: 159.04 KB (2.53百万行/s., 16.35 MB/s.)
ピークメモリ使用量: 13.00 MiB.

上記のように、サンプルテーブルの約3,000万行のうち、約25,000行のみが処理されました：
```sql 
SELECT count() FROM uk.uk_price_paid_simple;

```txt
   ┌──count()─┐
1. │ 29556244 │ -- 29.56百万
   └──────────┘

## 重要なポイント {#key-takeaways}

* **スパース主インデックス**は、ClickHouseが主キー列に対するクエリ条件に一致する行を含む可能性のあるグラニュールを特定することにより、不必要なデータをスキップするのに役立ちます。 

* 各インデックスは、**各グラニュールの最初の行からの主キー値のみを保存**しているため（デフォルトではグラニュールは8,192行を持つ）、メモリに収まるほどコンパクトにまとめられています。

* **各データパート**はMergeTreeテーブル内の独自の**主インデックスを持ち**、クエリ実行中に独立して使用されます。 

* クエリ実行中、インデックスによりClickHouseは**グラニュールをスキップ**し、I/Oとメモリの使用を削減しながらパフォーマンスを加速します。 

* `mergeTreeIndex`テーブル関数を使用してインデックス内容を**検査**し、`EXPLAIN`句を使用してインデックスの使用を監視できます。

## さらなる情報を探すには {#where-to-find-more-information}

ClickHouseにおけるスパース主インデックスの動作方法、従来のデータベースインデックスとの違いやそれらを使用する際のベストプラクティスについて詳しく調べるには、詳細なインデックスについての[深堀り](/guides/best-practices/sparse-primary-indexes)をチェックしてください。

ClickHouseが主インデックススキャンによって選択されたデータをどのように並行して処理するかに興味がある場合は、クエリ並行性ガイドを[こちら](/optimize/query-parallelism)で確認してください。
