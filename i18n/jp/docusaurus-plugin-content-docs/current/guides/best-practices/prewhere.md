---
'slug': '/optimize/prewhere'
'sidebar_label': 'PREWHERE 最適化'
'sidebar_position': 21
'description': 'PREWHERE は不要なカラムデータを読み込むことを避けることで I/O を削減します。'
'title': 'PREWHERE 最適化はどのように機能しますか？'
'doc_type': 'guide'
---

import visual01 from '@site/static/images/guides/best-practices/prewhere_01.gif';
import visual02 from '@site/static/images/guides/best-practices/prewhere_02.gif';
import visual03 from '@site/static/images/guides/best-practices/prewhere_03.gif';
import visual04 from '@site/static/images/guides/best-practices/prewhere_04.gif';
import visual05 from '@site/static/images/guides/best-practices/prewhere_05.gif';
import Image from '@theme/IdealImage';



# PREWHERE最適化はどのように機能しますか？

[PREWHERE句](/sql-reference/statements/select/prewhere)は、ClickHouseにおけるクエリ実行の最適化機能です。これは、不要なデータの読み込みを避け、ディスクから非フィルタ列を読み込む前に関連性のないデータをフィルタリングすることで、I/Oを削減し、クエリ速度を向上させます。

このガイドでは、PREWHEREの機能、影響を測定する方法、および最適なパフォーマンスを引き出すための調整方法について説明します。

## PREWHERE最適化なしのクエリ処理 {#query-processing-without-prewhere-optimization}

最初に、[uk_price_paid_simple](/parts)テーブルに対してPREWHEREを使用せずにクエリがどのように処理されるかを示します：

<Image img={visual01} size="md" alt="PREWHERE最適化なしのクエリ処理"/>

<br/><br/>
① クエリには、テーブルの主キーの一部であり、したがって主インデックスの一部でもある`town`カラムに対するフィルタが含まれています。

② クエリを加速するために、ClickHouseはテーブルの主インデックスをメモリに読み込みます。

③ インデックスエントリをスキャンして、`town`カラムのどのグラニュールが述語に一致する行を含む可能性があるかを特定します。

④ これらの関連がある可能性のあるグラニュールがメモリに読み込まれ、クエリに必要な他のカラムの位置が一致したグラニュールも一緒にロードされます。

⑤ 残りのフィルタがクエリ実行中に適用されます。

ご覧の通り、PREWHEREなしでは、すべての関連性のあるカラムがフィルタリングの前に読み込まれます。実際に一致する行がわずかしかない場合でもすべてがロードされます。

## PREWHEREがクエリ効率を改善する方法 {#how-prewhere-improves-query-efficiency}

以下のアニメーションは、上記のクエリにPREWHERE句がすべてのクエリ述語に適用されている場合の処理方法を示しています。

最初の3つの処理ステップは以前と同じです：

<Image img={visual02} size="md" alt="PREWHERE最適化付きのクエリ処理"/>

<br/><br/>
① クエリには、テーブルの主キーの一部であり、したがって主インデックスの一部でもある`town`カラムに対するフィルタが含まれています。

② PREWHERE句なしの実行と同様に、クエリを加速するために、ClickHouseは主インデックスをメモリに読み込みます。

③ 次に、インデックスエントリをスキャンして、`town`カラムのどのグラニュールが述語に一致する行を含む可能性があるかを特定します。

PREWHERE句のおかげで、次のステップが異なります：関連のあるすべてのカラムを前もって読むのではなく、ClickHouseはデータをカラムごとにフィルタリングし、実際に必要なものだけを読み込みます。これにより、特に広いテーブルの場合、I/Oが劇的に削減されます。

各ステップで、前のフィルタを生き残った、つまり一致した少なくとも1行を含むグラニュールのみをロードします。これにより、各フィルタについてのロードと評価されるグラニュールの数が単調に減少します：

**ステップ1: `town`によるフィルタリング**<br/>
ClickHouseはPREWHERE処理を始め、① `town`カラムから選択されたグラニュールを読み込み、`London`に一致する行を含むものをチェックします。

例では、すべての選択されたグラニュールが一致するため、② 次のフィルタカラム`date`の対応する位置一致グラニュールが処理のために選択されます：

<Image img={visual03} size="md" alt="ステップ1: `town`によるフィルタリング"/>

<br/><br/>
**ステップ2: `date`によるフィルタリング**<br/>
次に、ClickHouseは① 選択された`date`カラムのグラニュールを読み込み、フィルタ`date > '2024-12-31'`を評価します。

この場合、3つのグラニュールのうち2つが一致する行を含むため、② 次のフィルタカラム`price`からの位置一致グラニュールのみがさらなる処理のために選択されます：

<Image img={visual04} size="md" alt="ステップ2: `date`によるフィルタリング"/>

<br/><br/>
**ステップ3: `price`によるフィルタリング**<br/>
最後に、ClickHouseは① `price`カラムから2つの選択されたグラニュールを読み込み、最後のフィルタ`price > 10_000`を評価します。

2つのグラニュールのうち1つのみが一致する行を含むため、② その位置一致グラニュールから`SELECT`カラム—`street`—をさらなる処理のためにロードする必要があります：

<Image img={visual05} size="md" alt="ステップ2: `price`によるフィルタリング"/>

<br/><br/>
最終ステップでは、一致する行を含む最小のカラムグラニュールセットのみがロードされます。これにより、メモリの使用量が低減し、ディスクI/Oが少なく、クエリ実行が高速化されます。

:::note PREWHEREは読み取るデータを削減しますが、処理される行は削減しません
PREWHEREを使用しても、ClickHouseはPREWHEREありとなしのクエリの両方で同じ数の行を処理します。ただし、PREWHERE最適化が適用されることで、すべての処理行に対してすべてのカラム値を読み込む必要がなくなります。
:::

## PREWHERE最適化は自動的に適用されます {#prewhere-optimization-is-automatically-applied}

PREWHERE句は、上記の例のように手動で追加できます。しかし、PREWHEREを手動で記述する必要はありません。設定[`optimize_move_to_prewhere`](/operations/settings/settings#optimize_move_to_prewhere)が有効になっている（デフォルトはtrue）場合、ClickHouseは自動的にWHEREからPREWHEREにフィルタ条件を移動させ、最も読み取り量を削減する条件を優先させます。

小さなカラムはスキャンが速いため、より大きなカラムを処理する時点では、ほとんどのグラニュールがすでにフィルタリングされています。すべてのカラムには同じ数の行が含まれているため、カラムのサイズは主にそのデータ型によって決まります。たとえば、`UInt8`カラムは一般的に`String`カラムよりもずっと小さいです。

ClickHouseは、バージョン[23.2](https://clickhouse.com/blog/clickhouse-release-23-02#multi-stage-prewhere--alexander-gololobov)以降、この戦略をデフォルトで採用し、PREWHEREフィルタカラムの圧縮されていないサイズの昇順でのマルチステップ処理を行います。

バージョン[23.11](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere)以降、オプションのカラム統計により、カラムサイズだけでなく実際のデータ選択性に基づいてフィルタ処理順序を選択することで、さらに改善が見込まれます。

## PREWHEREの影響を測定する方法 {#how-to-measure-prewhere-impact}

PREWHEREがクエリに役立っていることを確認するために、`optimize_move_to_prewhere`設定が有効な場合と無効な場合のクエリパフォーマンスを比較できます。

まず、`optimize_move_to_prewhere`設定が無効な状態でクエリを実行します：

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

ClickHouseは、クエリの処理中に**23.36 MB**のカラムデータを読み取り、2.31百万行を処理しました。

次に、`optimize_move_to_prewhere`設定が有効な状態でクエリを実行します。（この設定はオプションですが、デフォルトで有効になっています）：
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

処理された行数は同じ（2.31百万）ですが、PREWHEREのおかげで、ClickHouseは3倍以上少ないカラムデータ—わずか6.74 MB（23.36 MBの代わりに）を読み込み、総実行時間を3分の1に削減しました。

ClickHouseがPREWHEREを内部でどのように適用しているかをより深く理解するためには、EXPLAINとトレースログを使用します。

[EXPLAIN](/sql-reference/statements/explain#explain-plan)句を用いて、クエリの論理プランを調べます：
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

プラン出力の大部分は非常に冗長であるため、ここでは省略します。基本的には、3つのカラム述語がすべて自動的にPREWHEREに移動されたことを示しています。

これを自身で再現すると、クエリプランでも、これらの述語の順序がカラムのデータ型サイズに基づいていることがわかります。カラム統計を有効にしていないため、ClickHouseはサイズをPREWHEREの処理順序を決定するためのフォールバックとして利用します。

さらに詳しい内部の動作を観察したい場合は、クエリ実行中にClickHouseにテストレベルのログエントリをすべて返すよう指示することができます：
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

## 主なポイント {#key-takeaways}

* PREWHEREは、後でフィルタリングされるカラムデータの読み込みを回避し、I/Oとメモリを節約します。
* `optimize_move_to_prewhere`が有効な場合、新たに手動でPREWHEREを記述することなく自動で機能します（デフォルト）。
* フィルタリングの順序は重要です：小さく選択性の高いカラムを最初に配置するべきです。
* `EXPLAIN`とログを使用して、PREWHEREが適用されているかを確認し、その効果を理解します。
* PREWHEREは、広いテーブルや選択的フィルタを伴う大規模なスキャンにおいて特に影響を持ちます。
