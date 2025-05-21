---
slug: /optimize/prewhere
sidebar_label: 'PREWHERE 最適化'
sidebar_position: 21
description: 'PREWHERE は、不要なカラムデータの読み取りを回避することで I/O を削減します。'
title: 'PREWHERE 最適化はどのように機能しますか？'
---

import visual01 from '@site/static/images/guides/best-practices/prewhere_01.gif';
import visual02 from '@site/static/images/guides/best-practices/prewhere_02.gif';
import visual03 from '@site/static/images/guides/best-practices/prewhere_03.gif';
import visual04 from '@site/static/images/guides/best-practices/prewhere_04.gif';
import visual05 from '@site/static/images/guides/best-practices/prewhere_05.gif';

import Image from '@theme/IdealImage';


# PREWHERE 最適化はどのように機能しますか？

[PREWHERE 句](/sql-reference/statements/select/prewhere)は、ClickHouse におけるクエリ実行の最適化です。これは不要なデータの読み取りを回避することで I/O を削減し、クエリ速度を向上させ、ディスクから非フィルタカラムを読み込む前に関連のないデータをフィルタリングします。

このガイドでは、PREWHERE の働き、影響を測定する方法、さらには最適なパフォーマンスを引き出すための調整方法を説明します。


## PREWHERE 最適化なしのクエリ処理 {#query-processing-without-prewhere-optimization}

まず、[uk_price_paid_simple](/parts) テーブルのクエリが PREWHERE を使用せずに処理される様子を示します：

<Image img={visual01} size="md" alt="PREWHERE 最適化なしのクエリ処理"/>

<br/><br/>
① クエリには `town` カラムに対するフィルタが含まれており、これはテーブルの主キーの一部であり、したがって主インデックスの一部でもあります。

② クエリを加速するために、ClickHouse はテーブルの主インデックスをメモリに読み込みます。

③ インデックスエントリをスキャンして、`town` カラムからどのグラニュールが述語に一致する行を含む可能性があるかを特定します。

④ これらの潜在的に関連のあるグラニュールが、クエリに必要な他のカラムに対応する位置に整列させてメモリに読み込まれます。

⑤ 残りのフィルタはクエリ実行中に適用されます。

ご覧の通り、PREWHERE がない場合、すべての関連するカラムがフィルタリングされる前に読み込まれます。たとえ実際に一致する行がわずかしかなくてもです。


## PREWHERE がクエリ効率を改善する方法 {#how-prewhere-improves-query-efficiency}

以下のアニメーションは、PREWHERE 句がすべてのクエリ述語に適用された場合の上記のクエリがどのように処理されるかを示しています。

最初の三つの処理ステップは以前と同じです：

<Image img={visual02} size="md" alt="PREWHERE 最適化ありのクエリ処理"/>

<br/><br/>
① クエリには `town` カラムに対するフィルタが含まれており、これはテーブルの主キーの一部であり、したがって主インデックスの一部でもあります。

② PREWHERE 句なしの実行と同様に、クエリを加速するために ClickHouse は主インデックスをメモリに読み込みます。

③ 次に、インデックスエントリをスキャンして、`town` カラムからどのグラニュールが述語に一致する行を含む可能性があるかを特定します。

PREWHERE 句のおかげで、次のステップが異なります。すべての関連カラムを前もって読み込む代わりに、ClickHouse はカラムごとにデータをフィルタリングし、本当に必要なものだけを読み込みます。これは、特に広いテーブルにおいて I/O を大幅に削減します。

各ステップにおいて、前のフィルタを生き残った（つまり、一致した）少なくとも1つの行を含むグラニュールのみを読み込みます。結果として、各フィルタのために読み込むべきグラニュールの数は一様に減少します：

**ステップ 1: 都市によるフィルタリング**<br/>
ClickHouse は、PREWHERE 処理を開始する際に ① `town` カラムから選択されたグラニュールを読み込み、どれが実際に `London` に一致する行を含むかを確認します。

例では、全ての選択されたグラニュールが一致しているため、② 次のフィルタカラム—`date`—に対する対応する位置に整列したグラニュールが選択されます：

<Image img={visual03} size="md" alt="ステップ 1: 都市によるフィルタリング"/>

<br/><br/>
**ステップ 2: 日付によるフィルタリング**<br/>
次に、ClickHouse は ① 選択された `date` カラムのグラニュールを読み込み、フィルタ `date > '2024-12-31'` を評価します。

この場合、3 つのグラニュールのうち 2 つに一致する行が含まれているため、② 次のフィルタカラム—`price`—からはその位置に整列したグラニュールのみがさらなる処理のために選択されます：

<Image img={visual04} size="md" alt="ステップ 2: 日付によるフィルタリング"/>

<br/><br/>
**ステップ 3: 価格によるフィルタリング**<br/>
最後に、ClickHouse は ① `price` カラムから選ばれた 2 つのグラニュールを読み込み、最後のフィルタ `price > 10_000` を評価します。

2 つのグラニュールのうち、1 つだけが一致する行を含むため、② さらなる処理のために対応する位置に整列したグラニュール—`street`—のみが読み込まれる必要があります：

<Image img={visual05} size="md" alt="ステップ 3: 価格によるフィルタリング"/>

<br/><br/>
最終ステップでは、一致する行を含むカラムのグラニュールの最小セットのみが読み込まれます。これによりメモリ使用量が少なくなり、ディスク I/O が削減され、クエリの実行が速くなります。

:::note PREWHERE はデータの読み取りを減らすが、処理する行は減らさない
ClickHouse は、PREWHERE と非 PREWHERE バージョンの両方で同じ数の行を処理します。ただし、PREWHERE 最適化を適用することによって、すべての処理された行に対してすべてのカラム値を読み込む必要がないのです。
:::

## PREWHERE 最適化は自動的に適用される {#prewhere-optimization-is-automatically-applied}

PREWHERE 句は手動で追加できますが、上記の例のように手動で PREWHERE を記述する必要はありません。設定 [`optimize_move_to_prewhere`](/operations/settings/settings#optimize_move_to_prewhere) が有効（デフォルトでは true）である場合、ClickHouse は自動的に WHERE から PREWHERE へフィルタ条件を移動し、最も読み取り量を削減するものを優先します。

小さいカラムはスキャンが早く、大きなカラムが処理される際には、ほとんどのグラニュールがすでにフィルタリングされています。すべてのカラムは同じ行数を持つため、カラムのサイズは主にそのデータ型によって決定されます。たとえば、`UInt8` カラムは一般的に `String` カラムよりもはるかに小さいです。

ClickHouse は、バージョン [23.2](https://clickhouse.com/blog/clickhouse-release-23-02#multi-stage-prewhere--alexander-gololobov) から、この戦略をデフォルトで採用しており、PREWHERE フィルタカラムを圧縮サイズの昇順で並べ替えた上でマルチステップ処理を行います。

バージョン [23.11](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere) 以降、オプションのカラム統計を使うことで、単にカラムサイズに基づいたのではなく、実際のデータ選択性に基づいてフィルタ処理の順序を選択でき、さらなる改善が図られています。


## PREWHERE の影響を測定する方法 {#how-to-measure-prewhere-impact}

PREWHERE がクエリを助けているかを検証するために、`optimize_move_to_prewhere` 設定が有効か無効かでクエリのパフォーマンスを比較できます。

まず、`optimize_move_to_prewhere` 設定を無効にしてクエリを実行します：

```sql
SELECT
    street
FROM
   uk.uk_price_paid_simple
WHERE
   town = 'LONDON' and date > '2024-12-31' and price < 10_000
SETTINGS optimize_move_to_prewhere = false;
```

```txt
   ┌─street──────┐
1. │ MOYSER ROAD │
2. │ AVENUE ROAD │
3. │ AVENUE ROAD │
   └─────────────┘

3 行がセットに含まれています。経過時間: 0.056 秒。処理された行: 231 万行、サイズ: 23.36 MB（4109 万行/秒、415.43 MB/秒）。
最大メモリ使用量: 132.10 MiB。
```

ClickHouse はクエリの処理中に **23.36 MB** のカラムデータを読み込みました。

次に、`optimize_move_to_prewhere` 設定を有効にしてクエリを実行します。 （この設定はオプションであり、デフォルトで有効になっています）：
```sql
SELECT
    street
FROM
   uk.uk_price_paid_simple
WHERE
   town = 'LONDON' and date > '2024-12-31' and price < 10_000
SETTINGS optimize_move_to_prewhere = true;
```

```txt
   ┌─street──────┐
1. │ MOYSER ROAD │
2. │ AVENUE ROAD │
3. │ AVENUE ROAD │
   └─────────────┘

3 行がセットに含まれています。経過時間: 0.017 秒。処理された行: 231 万行、サイズ: 6.74 MB（135.29 万行/秒、394.44 MB/秒）。
最大メモリ使用量: 132.11 MiB。
```

同じ数の行が処理されました（231 万行）が、PREWHERE のおかげで、ClickHouse は 23.36 MB の代わりに 6.74 MB と三分の一以上少ないカラムデータを読み込み、総実行時間を 3 分の 1 に短縮しました。

ClickHouse が内部で PREWHERE をどのように適用しているかをより深く理解するには、EXPLAIN やトレースログを使って分析できます。

[EXPLAIN](/sql-reference/statements/explain#explain-plan) 句を使用して、クエリの論理プランを調べます：
```sql 
EXPLAIN PLAN actions = 1
SELECT
    street
FROM
   uk.uk_price_paid_simple
WHERE
   town = 'LONDON' and date > '2024-12-31' and price < 10_000;
```

```txt
...
Prewhere info                                                                                                                                                                                                                                          
  Prewhere filter column: 
    and(greater(__table1.date, '2024-12-31'_String), 
    less(__table1.price, 10000_UInt16), 
    equals(__table1.town, 'LONDON'_String)) 
...
```

ここではプラン出力のほとんどを省略していますが、非常に冗長です。本質的には、3 つのカラム述語がすべて自動的に PREWHERE に移動されたことを示しています。

これを再現する際、クエリプランでも述語の順序がカラムのデータ型のサイズに基づいていることがわかります。カラム統計を有効にしていない場合、ClickHouse はサイズを使用して PREWHERE 処理の順序を決定します。

さらに内部を深く観察したい場合は、クエリ実行中に ClickHouse にすべてのテストレベルのログエントリを返すように指示することができます：
```sql
SELECT
    street
FROM
   uk.uk_price_paid_simple
WHERE
   town = 'LONDON' and date > '2024-12-31' and price < 10_000
SETTINGS send_logs_level = 'test';
```

```txt
...
<Trace> ... Condition greater(date, '2024-12-31'_String) moved to PREWHERE
<Trace> ... Condition less(price, 10000_UInt16) moved to PREWHERE
<Trace> ... Condition equals(town, 'LONDON'_String) moved to PREWHERE
...
<Test> ... Executing prewhere actions on block: greater(__table1.date, '2024-12-31'_String)
<Test> ... Executing prewhere actions on block: less(__table1.price, 10000_UInt16)
...
```

## 主なポイント {#key-takeaways}

* PREWHERE は後でフィルタリングされるカラムデータの読み取りを避けて I/O とメモリを節約します。
* `optimize_move_to_prewhere` が有効である限り（デフォルト設定）、自動的に機能します。
* フィルタの順序が重要です：小さく選択的なカラムを優先すべきです。
* `EXPLAIN` とログを使用して、PREWHERE が適用されているかどうかを確認し、その効果を理解します。
* PREWHERE は、広いテーブルや選択的なフィルタを持つ大規模なスキャンに対して最も影響があります。
