---
slug: /primary-indexes
title: '主キーインデックス'
description: 'ClickHouseのスパース主キーインデックスはどのように機能するか'
keywords: ['スパース主キーインデックス', '主キーインデックス', 'インデックス']
---


import visual01 from '@site/static/images/managing-data/core-concepts/primary-index-light_01.gif';
import visual02 from '@site/static/images/managing-data/core-concepts/primary-index-light_02.gif';
import visual03 from '@site/static/images/managing-data/core-concepts/primary-index-light_03.gif';

import Image from '@theme/IdealImage';


:::tip 高度なインデックスの詳細をお探しですか？
このページでは、ClickHouseのスパース主キーインデックス、その構築方法、動作方法、およびクエリの加速にどのように役立つかを紹介します。

高度なインデックス戦略やより深い技術的な詳細については、[主キーインデックスの詳細](/guides/best-practices/sparse-primary-indexes)をご覧ください。
:::


## ClickHouseでスパース主キーインデックスはどのように機能するか？ {#how-does-the-sparse-primary-index-work-in-clickHouse}

<br/>

ClickHouseのスパース主キーインデックスは、[グラニュール](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)—行のブロック—を効率的に特定するのに役立ちます。これらはテーブルの主キーのカラムに対するクエリの条件に一致するデータを含んでいる可能性があります。次のセクションでは、このインデックスがどのようにこれらのカラムの値から構築されるかを説明します。

### スパース主キーインデックスの作成 {#sparse-primary-index-creation}

スパース主キーインデックスがどのように構築されるかを示すために、[uk_price_paid_simple](https://clickhouse.com/docs/parts)テーブルを使用し、いくつかのアニメーションを交えます。

[リマインダー](https://clickhouse.com/docs/parts)として、私たちの①例のテーブルは主キー(town, street)を持ち、②挿入されたデータは③ディスクに主キーのカラムの値でソートされ、圧縮されて保存されます。各カラムごとに別々のファイルに。

<Image img={visual01} size="lg"/>

<br/><br/>

処理のために、各カラムのデータは④論理的にグラニュールに分割されます—それぞれが8,192行をカバーし、これがClickHouseのデータ処理メカニズムが扱う最小単位です。

このグラニュール構造が主キーインデックスを**スパース**にします：すべての行をインデックス付けするのではなく、ClickHouseは⑤各グラニュールからわずか1行の主キー値—具体的には、最初の行からのみ—を保存します。これにより、グラニュールごとに1つのインデックスエントリが生成されます：

<Image img={visual02} size="lg"/>

<br/><br/>

そのスパースさのおかげで、主キーインデックスはメモリにすっぽり収まるほど小さく、主キーのカラムに対するクエリの条件に対して迅速なフィルタリングが可能になります。次のセクションでは、このインデックスがどのようにクエリを加速するかを示します。


### 主キーインデックスの使用 {#primary-index-usage}

スパース主キーインデックスがクエリの加速にどのように使用されるかを、別のアニメーションで示します：

<Image img={visual03} size="lg"/>

<br/><br/>

① 例のクエリには、両方の主キーのカラムに対する条件が含まれています：`town = 'LONDON' AND street = 'OXFORD STREET'`。

② クエリを加速するために、ClickHouseはテーブルの主キーインデックスをメモリにロードします。

③ 次に、インデックスエントリをスキャンして、どのグラニュールが条件に一致する行を含んでいる可能性があるか—言い換えれば、スキップできないグラニュールを特定します。

④ これらの潜在的に関連するグラニュールがロードされ、クエリに必要な他のカラムのグラニュールとともに[処理](/optimize/query-parallelism)されます。


## 主キーインデックスの監視 {#monitoring-primary-indexes}

テーブルの各[データパート](/parts)には、それぞれの主キーインデックスがあります。これらのインデックスの内容は、[mergeTreeIndex](/sql-reference/table-functions/mergeTreeIndex)テーブル関数を使用して調査できます。

以下のクエリは、例のテーブルの各データパートの主キーインデックスに入っているエントリの数をリストします：

```sql
SELECT
    part_name,
    max(mark_number) as entries
FROM mergeTreeIndex('uk', 'uk_price_paid_simple')
GROUP BY part_name;
```


```txt
   ┌─part_name─┬─entries─┐
1. │ all_2_2_0 │     914 │
2. │ all_1_1_0 │    1343 │
3. │ all_0_0_0 │    1349 │
   └───────────┴─────────┘
```

このクエリは、現在のデータパートの1つから主キーインデックスの最初の10件を示します。これらのパーツはバックグラウンドで大きなパーツに[マージ](/merges)されています：

```sql 
SELECT 
    mark_number + 1 as entry,
    town,
    street
FROM mergeTreeIndex('uk', 'uk_price_paid_simple')
WHERE part_name = (SELECT any(part_name) FROM mergeTreeIndex('uk', 'uk_price_paid_simple')) 
ORDER BY mark_number ASC
LIMIT 10;
```


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
```

最後に、[EXPLAIN](/sql-reference/statements/explain)句を使用して、すべてのデータパートの主キーインデックスが、例のクエリの条件に一致する行を含む可能性のないグラニュールをスキップする方法を確認します。これらのグラニュールはロードされず、処理されません：
```sql
EXPLAIN indexes = 1
SELECT
    max(price)
FROM
    uk.uk_price_paid_simple
WHERE
    town = 'LONDON' AND street = 'OXFORD STREET';
```


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
```

上記のEXPLAIN出力の行13は、主キーインデックスの分析によって、すべてのデータパートにわたる3,609のグラニュールのうち、わずか3件のみが処理用に選択されたことを示しています。残りのグラニュールは完全にスキップされました。

以下のクエリを実行することで、ほとんどのデータがスキップされたことも確認できます：
```sql 
SELECT max(price)
FROM uk.uk_price_paid_simple
WHERE (town = 'LONDON') AND (street = 'OXFORD STREET');
```


```txt
   ┌─max(price)─┐
1. │  263100000 │ -- 263.10百万
   └────────────┘

1 行がセットに含まれました。経過時間: 0.010秒。処理された行数: 24.58千行、サイズ: 159.04 KB (2.53百万行/s., 16.35 MB/s.)
ピークメモリ使用量: 13.00 MiB.
```

上記のように、約3,000万行の例のテーブルから、約25,000行しか処理されなかったことが示されています：
```sql 
SELECT count() FROM uk.uk_price_paid_simple;
```

```txt
   ┌──count()─┐
1. │ 29556244 │ -- 29.56百万
   └──────────┘
```

## 主なポイント {#key-takeaways}

* **スパース主キーインデックス**は、ClickHouseがクエリの条件に一致する行を含む可能性のあるグラニュールを識別することで不要なデータをスキップするのに役立ちます。 

* 各インデックスは、**各グラニュールの最初の行からの主キー値のみ**を保存しており（グラニュールはデフォルトで8,192行）、メモリに収まるほどコンパクトです。 

* **MergeTreeテーブル内の各データパート**は、それぞれ**独立した主キーインデックス**を持ち、クエリ実行中に独立して使用されます。 

* クエリ中、インデックスはClickHouseに**グラニュールをスキップ**させ、I/Oおよびメモリ使用量を削減し、パフォーマンスを向上させます。 

* `mergeTreeIndex`テーブル関数を使用して**インデックスの内容を検査**し、`EXPLAIN`句でインデックスの使用状況を監視できます。


## さらなる情報を見つけるには {#where-to-find-more-information}

ClickHouseのスパース主キーインデックスがどのように機能するか、その伝統的なデータベースインデックスとの違い、およびそれらの使用に関するベストプラクティスについて詳しく知りたい方は、私たちの詳細なインデックスに関する[深堀り](/guides/best-practices/sparse-primary-indexes)をご覧ください。

ClickHouseが主キーインデックススキャンによって選択されたデータを高い並列性で処理する方法に興味がある場合は、クエリ並列処理ガイドを[こちら](/optimize/query-parallelism)でご覧ください。
