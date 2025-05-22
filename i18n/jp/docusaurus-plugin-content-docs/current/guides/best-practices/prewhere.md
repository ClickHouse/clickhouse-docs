---
'slug': '/optimize/prewhere'
'sidebar_label': 'PREWHERE 最適化'
'sidebar_position': 21
'description': 'PREWHERE は、不要なカラムデータの読み取りを回避することにより、I/O を削減します。'
'title': 'PREWHERE 最適化はどのように機能しますか？'
---

import visual01 from '@site/static/images/guides/best-practices/prewhere_01.gif';
import visual02 from '@site/static/images/guides/best-practices/prewhere_02.gif';
import visual03 from '@site/static/images/guides/best-practices/prewhere_03.gif';
import visual04 from '@site/static/images/guides/best-practices/prewhere_04.gif';
import visual05 from '@site/static/images/guides/best-practices/prewhere_05.gif';
import Image from '@theme/IdealImage';


# PREWHERE最適化はどのように機能しますか？

[PREWHERE句](/sql-reference/statements/select/prewhere)は、ClickHouseにおけるクエリ実行の最適化手法です。これによりI/Oが削減され、不要なデータの読み取りを避け、非フィルタカラムをディスクから読み込む前に無関係なデータがフィルタリングされることで、クエリ速度が向上します。

このガイドでは、PREWHEREがどのように機能するのか、その影響を測定する方法、そして最適なパフォーマンスを得るための調整方法について説明します。


## PREWHERE最適化なしのクエリ処理 {#query-processing-without-prewhere-optimization}

まず、[uk_price_paid_simple](/parts)テーブルに対するクエリがPREWHEREを使用せずに処理される方法を示します：

<Image img={visual01} size="md" alt="PREWHERE最適化なしのクエリ処理"/>

<br/><br/>
① クエリには、テーブルの主キーの一部である`town`カラムに対するフィルタが含まれており、したがって主インデックスの一部でもあります。

② クエリを加速するために、ClickHouseはテーブルの主インデックスをメモリに読み込みます。

③ インデックスエントリをスキャンし、`town`カラムからどのグラニュールが述語に一致する行を含む可能性があるかを特定します。

④ これらの潜在的に関連するグラニュールは、クエリに必要な他のカラムからの位置が揃ったグラニュールと共にメモリに読み込まれます。 

⑤ 残りのフィルタは、クエリ実行中に適用されます。

ご覧の通り、PREWHEREがない場合、実際に一致する行が少ない場合でも、すべての潜在的に関連するカラムがフィルタリングされる前に読み込まれます。


## PREWHEREがクエリの効率を向上させる方法 {#how-prewhere-improves-query-efficiency}

以下のアニメーションは、上記のクエリにPREWHERE句がすべてのクエリ述語に適用された場合の処理方法を示しています。

最初の三つの処理ステップは以前と同じです：

<Image img={visual02} size="md" alt="PREWHERE最適化ありのクエリ処理"/>

<br/><br/>
① クエリには、テーブルの主キーの一部である`town`カラムに対するフィルタが含まれています。

② PREWHERE句がない場合と同様に、クエリを加速するために、ClickHouseは主インデックスをメモリに読み込みます、

③ その後、インデックスエントリをスキャンして、`town`カラムからどのグラニュールが述語に一致する行を含む可能性があるかを特定します。

ここで、PREWHERE句のおかげで次のステップが異なります：すべての関連カラムを事前に読み込むのではなく、ClickHouseはカラムごとにデータをフィルタリングし、本当に必要なデータのみを読み込みます。これにより、特に幅広いテーブルの場合にI/Oが大幅に削減されます。

各ステップでは、前のフィルタを生き残った（つまり、一致した）少なくとも1行が含まれているグラニュールのみが読み込まれます。その結果、各フィルタに対して読み込む必要があるグラニュールの数は一貫して減少します。

**ステップ 1: townによるフィルタリング**<br/>
ClickHouseはPREWHERE処理を開始し、① `town`カラムから選択されたグラニュールを読み取り、どれが実際に`London`に一致する行を含むかを確認します。

この例では、すべての選択されたグラニュールが一致するため、② 次のフィルタカラムである`date`のために、対応する位置が揃ったグラニュールが選択されます：

<Image img={visual03} size="md" alt="ステップ 1: townによるフィルタリング"/>

<br/><br/>
**ステップ 2: dateによるフィルタリング**<br/>
次に、ClickHouseは① 選択された`date`カラムのグラニュールを読み取り、フィルタ`date > '2024-12-31'`を評価します。

この場合、3つのグラニュールのうち2つに一致する行が含まれているため、② 次のフィルタカラムである`price`のために、それらの位置が揃ったグラニュールのみが選択され、さらに処理が行われます：

<Image img={visual04} size="md" alt="ステップ 2: dateによるフィルタリング"/>

<br/><br/>
**ステップ 3: priceによるフィルタリング**<br/>
最後に、ClickHouseは① 選択された2つのグラニュールを`price`カラムから読み取り、最後のフィルタ`price > 10_000`を評価します。

2つのグラニュールのうち1つのみが一致する行を含んでいるため、② その位置が揃ったグラニュールのみが`SELECT`カラムである`street`のために読み込まれます：

<Image img={visual05} size="md" alt="ステップ 3: priceによるフィルタリング"/>

<br/><br/>
最終ステップでは、一致する行を含む最小限のカラムグラニュールのセットのみが読み込まれます。これにより、メモリ使用量が低下し、ディスクI/Oが削減され、クエリ実行が速くなります。

:::note PREWHEREは読み取るデータを削減し、処理する行は削減しない
ClickHouseはPREWHEREバージョンでも非PREWHEREバージョンでも、同じ数の行を処理します。ただし、PREWHERE最適化が適用されている場合、処理された各行のすべてのカラム値を読み込む必要はありません。
:::

## PREWHERE最適化は自動的に適用される {#prewhere-optimization-is-automatically-applied}

PREWHERE句は手動で追加することができますが、上記の例のようにPREWHEREを手動で書く必要はありません。[`optimize_move_to_prewhere`](/operations/settings/settings#optimize_move_to_prewhere)設定が有効になっている場合（デフォルトでtrue）、ClickHouseは自動的にWHEREからPREWHEREにフィルタ条件を移動し、読み取りボリュームを最も削減できる条件を優先します。

小さいカラムはスキャンが速いため、より大きなカラムが処理されるまでに、ほとんどのグラニュールがすでにフィルタリングされているという考え方です。すべてのカラムに同じ数の行があるため、カラムのサイズは主にそのデータ型によって決まります。たとえば、`UInt8`カラムは通常`String`カラムよりもはるかに小さくなります。

ClickHouseはバージョン[23.2](https://clickhouse.com/blog/clickhouse-release-23-02#multi-stage-prewhere--alexander-gololobov)からこの戦略をデフォルトで採用しており、PREWHEREフィルタカラムを未圧縮サイズの昇順でマルチステップ処理のためにソートします。

バージョン[23.11](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere)以降、オプションのカラム統計を使用することで、カラムサイズだけでなく、実際のデータの選択性に基づいてフィルタ処理の順序を選択することができ、さらに改善されます。


## PREWHEREの影響を測定する方法 {#how-to-measure-prewhere-impact}

PREWHEREがクエリに役立っていることを確認するために、`optimize_move_to_prewhere`設定が有効な場合と無効な場合のクエリ性能を比較することができます。

まず、`optimize_move_to_prewhere`設定が無効の状態でクエリを実行します：

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

3 行がセットにあります。経過時間: 0.056秒。処理された行数: 2.31百万行、23.36 MB (41.09百万行/秒、415.43 MB/秒。)
ピークメモリ使用量: 132.10 MiB.
```

ClickHouseはクエリの処理中に**23.36 MB**のカラムデータを読み込みました。

次に、`optimize_move_to_prewhere`設定が有効な状態でクエリを実行します。（この設定はオプションですが、デフォルトでは有効です）：
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

3 行がセットにあります。経過時間: 0.017秒。処理された行数: 2.31百万行、6.74 MB (135.29百万行/秒、394.44 MB/秒。)
ピークメモリ使用量: 132.11 MiB.
```

処理された行数は同じ (2.31百万) ですが、PREWHEREのおかげでClickHouseはカラムデータを3倍以上少なく読み込みました—23.36 MBの代わりにわずか6.74 MBであり、全体の実行時間を3分の1に短縮しました。

ClickHouseがPREWHEREをどのように適用しているかをより深く理解するために、EXPLAINとトレースログを使用します。

[EXPLAIN](/sql-reference/statements/explain#explain-plan)句を使用してクエリの論理プランを調べます：
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

ここではプランの出力の大部分を省略していますが、それはかなり冗長です。要するに、すべての3つのカラム述語が自動的にPREWHEREに移動されたことを示しています。

これを自分で再現すると、クエリプランの中でこれらの述語の順序がカラムのデータ型サイズに基づいていることもわかります。カラム統計が有効になっていないため、ClickHouseはサイズをPREWHERE処理の順序を決定するためのフォールバックとして使用しています。

さらに深く掘り下げたい場合は、クエリ実行中にすべてのテストレベルのログエントリを返すようにClickHouseに指示することで、各PREWHERE処理ステップを観察できます：
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

## 重要なポイント {#key-takeaways}

* PREWHEREは後でフィルタリングされるカラムデータの読み取りを回避し、I/Oとメモリを節約します。
* `optimize_move_to_prewhere`が有効な場合（デフォルト）には自動的に機能します。
* フィルタリングの順序は重要です：小さく選択的なカラムを最初に配置すべきです。
* `EXPLAIN`やログを使用してPREWHEREが適用されていることを確認し、その効果を理解することができます。
* PREWHEREは、幅広いテーブルや選択的フィルタによる大規模なスキャンに最も影響を与えます。
