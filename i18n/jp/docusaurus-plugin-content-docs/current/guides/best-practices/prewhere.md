---
slug: /optimize/prewhere
sidebar_label: 'PREWHERE 最適化'
sidebar_position: 21
description: 'PREWHERE は不要な列データの読み取りを回避することで I/O を削減します。'
title: 'PREWHERE 最適化はどのように動作しますか？'
doc_type: 'guide'
keywords: ['prewhere', 'query optimization', 'performance', 'filtering', 'best practices']
---

import visual01 from '@site/static/images/guides/best-practices/prewhere_01.gif';
import visual02 from '@site/static/images/guides/best-practices/prewhere_02.gif';
import visual03 from '@site/static/images/guides/best-practices/prewhere_03.gif';
import visual04 from '@site/static/images/guides/best-practices/prewhere_04.gif';
import visual05 from '@site/static/images/guides/best-practices/prewhere_05.gif';

import Image from '@theme/IdealImage';


# PREWHERE 最適化はどのように動作しますか？

[PREWHERE 句](/sql-reference/statements/select/prewhere) は、ClickHouse におけるクエリ実行の最適化機能です。不要なデータの読み取りを回避し、ディスクからフィルタ条件に含まれない列を読み込む前に無関係なデータを除外することで、I/O を削減し、クエリの処理速度を向上させます。

このガイドでは、PREWHERE の動作原理、その効果の測定方法、および最大限のパフォーマンスを引き出すためのチューニング方法について説明します。



## PREWHERE最適化を使用しないクエリ処理 {#query-processing-without-prewhere-optimization}

まず、[uk_price_paid_simple](/parts)テーブルに対するクエリがPREWHEREを使用せずにどのように処理されるかを説明します:

<Image
  img={visual01}
  size='md'
  alt='PREWHERE最適化を使用しないクエリ処理'
/>

<br />
<br />① クエリには`town`カラムに対するフィルタが含まれています。このカラムはテーブルのプライマリキーの一部であり、したがってプライマリインデックスの一部でもあります。

② クエリを高速化するため、ClickHouseはテーブルのプライマリインデックスをメモリにロードします。

③ インデックスエントリをスキャンして、述語に一致する行を含む可能性のあるtownカラムのグラニュールを特定します。

④ これらの関連する可能性のあるグラニュールが、クエリに必要な他のカラムの位置的に整列されたグラニュールとともにメモリにロードされます。

⑤ 残りのフィルタはクエリ実行時に適用されます。

ご覧のとおり、PREWHEREを使用しない場合、実際に一致する行がわずかであっても、フィルタリングの前に関連する可能性のあるすべてのカラムがロードされます。


## PREWHEREがクエリ効率を向上させる仕組み {#how-prewhere-improves-query-efficiency}

以下のアニメーションは、すべてのクエリ述語にPREWHERE句を適用した場合の、上記クエリの処理方法を示しています。

最初の3つの処理ステップは以前と同じです:

<Image
  img={visual02}
  size='md'
  alt='PREWHERE最適化によるクエリ処理'
/>

<br />
<br />① クエリには`town`カラムに対するフィルタが含まれており、これはテーブルのプライマリキーの一部であり、したがってプライマリインデックスの一部でもあります。

② PREWHERE句を使用しない実行と同様に、クエリを高速化するため、ClickHouseはプライマリインデックスをメモリにロードします。

③ 次に、インデックスエントリをスキャンして、述語に一致する行を含む可能性のある`town`カラムのグラニュールを特定します。

ここで、PREWHERE句により、次のステップが異なります。すべての関連カラムを事前に読み取る代わりに、ClickHouseはカラムごとにデータをフィルタリングし、本当に必要なものだけをロードします。これにより、特に幅の広いテーブルでI/Oが大幅に削減されます。

各ステップで、前のフィルタを通過した(つまり一致した)行を少なくとも1つ含むグラニュールのみをロードします。その結果、各フィルタに対してロードおよび評価するグラニュールの数は単調に減少します:

**ステップ1: townによるフィルタリング**<br/>
ClickHouseは、① `town`カラムから選択されたグラニュールを読み取り、実際に`London`に一致する行を含むものを確認することで、PREWHERE処理を開始します。

この例では、選択されたすべてのグラニュールが一致するため、② 次のフィルタカラムである`date`に対応する位置的に整列されたグラニュールが処理対象として選択されます:

<Image img={visual03} size='md' alt='ステップ1: townによるフィルタリング' />

<br />
<br />
**ステップ2: dateによるフィルタリング**
<br />
次に、ClickHouseは① 選択された`date`カラムのグラニュールを読み取り、フィルタ`date > '2024-12-31'`を評価します。

この場合、3つのグラニュールのうち2つが一致する行を含むため、② 次のフィルタカラムである`price`から、それらに位置的に整列されたグラニュールのみがさらなる処理対象として選択されます:

<Image img={visual04} size='md' alt='ステップ2: dateによるフィルタリング' />

<br />
<br />
**ステップ3: priceによるフィルタリング**
<br />
最後に、ClickHouseは① `price`カラムから選択された2つのグラニュールを読み取り、最後のフィルタ`price > 10_000`を評価します。

2つのグラニュールのうち1つだけが一致する行を含むため、② `SELECT`対象カラムである`street`から、それに位置的に整列されたグラニュールのみをさらなる処理のためにロードする必要があります:

<Image img={visual05} size='md' alt='ステップ3: priceによるフィルタリング' />

<br />
<br />
最終ステップでは、一致する行を含む最小限のカラムグラニュールのセットのみがロードされます。これにより、メモリ使用量の削減、ディスクI/Oの減少、およびクエリ実行の高速化が実現されます。

:::note PREWHEREは読み取るデータを削減するが、処理する行数は削減しない
ClickHouseは、クエリのPREWHEREバージョンと非PREWHEREバージョンの両方で同じ数の行を処理することに注意してください。ただし、PREWHERE最適化を適用すると、処理されるすべての行に対してすべてのカラム値をロードする必要はありません。
:::


## PREWHERE最適化は自動的に適用される {#prewhere-optimization-is-automatically-applied}

PREWHERE句は、上記の例のように手動で追加できます。ただし、PREWHEREを手動で記述する必要はありません。設定[`optimize_move_to_prewhere`](/operations/settings/settings#optimize_move_to_prewhere)が有効な場合(デフォルトでtrue)、ClickHouseは自動的にフィルタ条件をWHEREからPREWHEREに移動し、読み取り量を最も削減できるものを優先します。

この仕組みは、小さいカラムの方がスキャンが高速であり、大きいカラムが処理される時点では、ほとんどのグラニュールがすでにフィルタリングされているという考え方に基づいています。すべてのカラムは同じ行数を持つため、カラムのサイズは主にそのデータ型によって決まります。例えば、`UInt8`カラムは一般的に`String`カラムよりもはるかに小さくなります。

ClickHouseはバージョン[23.2](https://clickhouse.com/blog/clickhouse-release-23-02#multi-stage-prewhere--alexander-gololobov)以降、デフォルトでこの戦略に従い、PREWHEREフィルタカラムを非圧縮サイズの昇順でソートして多段階処理を行います。

バージョン[23.11](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere)以降、オプションのカラム統計を使用することで、カラムサイズだけでなく実際のデータ選択性に基づいてフィルタ処理順序を選択し、さらなる改善が可能になります。


## PREWHEREの効果を測定する方法 {#how-to-measure-prewhere-impact}

PREWHEREがクエリのパフォーマンス向上に寄与しているかを検証するには、`optimize_move_to_prewhere`設定を有効にした場合と無効にした場合のクエリパフォーマンスを比較します。

まず、`optimize_move_to_prewhere`設定を無効にしてクエリを実行します:

```sql
SELECT
    street
FROM
   uk.uk_price_paid_simple
WHERE
   town = 'LONDON' AND date > '2024-12-31' AND price < 10_000
SETTINGS optimize_move_to_prewhere = false;
```

```txt
   ┌─street──────┐
1. │ MOYSER ROAD │
2. │ AVENUE ROAD │
3. │ AVENUE ROAD │
   └─────────────┘

3 rows in set. Elapsed: 0.056 sec. Processed 2.31 million rows, 23.36 MB (41.09 million rows/s., 415.43 MB/s.)
Peak memory usage: 132.10 MiB.
```

ClickHouseは、このクエリで231万行を処理する際に**23.36 MB**のカラムデータを読み取りました。

次に、`optimize_move_to_prewhere`設定を有効にしてクエリを実行します(この設定はデフォルトで有効になっているため、明示的な指定は任意です):

```sql
SELECT
    street
FROM
   uk.uk_price_paid_simple
WHERE
   town = 'LONDON' AND date > '2024-12-31' AND price < 10_000
SETTINGS optimize_move_to_prewhere = true;
```

```txt
   ┌─street──────┐
1. │ MOYSER ROAD │
2. │ AVENUE ROAD │
3. │ AVENUE ROAD │
   └─────────────┘

3 rows in set. Elapsed: 0.017 sec. Processed 2.31 million rows, 6.74 MB (135.29 million rows/s., 394.44 MB/s.)
Peak memory usage: 132.11 MiB.
```

処理された行数は同じ(231万行)ですが、PREWHEREにより、ClickHouseが読み取ったカラムデータは3分の1以下となり、23.36 MBではなくわずか6.74 MBとなりました。これにより、総実行時間が3分の1に短縮されました。

ClickHouseが内部でPREWHEREをどのように適用しているかをより深く理解するには、EXPLAINとトレースログを使用します。

[EXPLAIN](/sql-reference/statements/explain#explain-plan)句を使用してクエリの論理プランを検査します:

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

プラン出力は非常に冗長なため、ここではほとんどを省略しています。要するに、3つのカラム述語すべてが自動的にPREWHEREに移動されたことが示されています。

これを自分で再現する際、クエリプランにおいて、これらの述語の順序がカラムのデータ型サイズに基づいていることがわかります。カラム統計を有効にしていないため、ClickHouseはPREWHERE処理順序を決定する際の代替手段としてサイズを使用します。

さらに内部の動作を詳しく確認したい場合は、クエリ実行中にすべてのテストレベルのログエントリを返すようClickHouseに指示することで、個々のPREWHERE処理ステップを観察できます:

```sql
SELECT
    street
FROM
   uk.uk_price_paid_simple
WHERE
   town = 'LONDON' AND date > '2024-12-31' AND price < 10_000
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


## 重要なポイント {#key-takeaways}

- PREWHEREは、後でフィルタリングされるカラムデータの読み取りを回避することで、I/Oとメモリを節約します。
- `optimize_move_to_prewhere`が有効な場合(デフォルト)、自動的に機能します。
- フィルタリングの順序は重要です。サイズが小さく選択性の高いカラムを最初に配置してください。
- `EXPLAIN`とログを使用して、PREWHEREが適用されていることを確認し、その効果を把握してください。
- PREWHEREは、カラム数の多いテーブルと選択的なフィルタを使用した大規模スキャンで最も効果的です。
