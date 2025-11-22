---
description: 'MergeTree を継承し、マージ処理中に行を折りたたむロジックを追加したテーブルエンジンです。'
keywords: ['更新', '折りたたみ']
sidebar_label: 'CollapsingMergeTree'
sidebar_position: 70
slug: /engines/table-engines/mergetree-family/collapsingmergetree
title: 'CollapsingMergeTree テーブルエンジン'
doc_type: 'guide'
---



# CollapsingMergeTree テーブルエンジン



## Description {#description}

`CollapsingMergeTree`エンジンは[MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)を継承し、
マージ処理中に行を折りたたむロジックを追加します。
`CollapsingMergeTree`テーブルエンジンは、ソートキー(`ORDER BY`)内のすべてのフィールドが
特殊フィールド`Sign`を除いて等しい場合、行のペアを非同期的に削除(折りたたみ)します。
`Sign`フィールドは`1`または`-1`の値を取ることができます。
反対の値を持つ`Sign`のペアがない行は保持されます。

詳細については、このドキュメントの[折りたたみ](#table_engine-collapsingmergetree-collapsing)セクションを参照してください。

:::note
このエンジンはストレージ容量を大幅に削減でき、
その結果として`SELECT`クエリの効率を向上させることができます。
:::


## パラメータ {#parameters}

このテーブルエンジンのすべてのパラメータは、`Sign`パラメータを除き、[`MergeTree`](/engines/table-engines/mergetree-family/mergetree)と同じ意味を持ちます。

- `Sign` — 行のタイプを示すカラムの名前。`1`は「状態」行、`-1`は「キャンセル」行を表します。型: [Int8](/sql-reference/data-types/int-uint)。


## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
)
ENGINE = CollapsingMergeTree(Sign)
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

<details markdown="1">

<summary>非推奨のテーブル作成方法</summary>

:::note
以下の方法は新規プロジェクトでの使用を推奨しません。
可能であれば、既存プロジェクトを新しい方法に更新することをお勧めします。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
)
ENGINE [=] CollapsingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, Sign)
```

`Sign` — 行の種類を示すカラムの名前。`1`は「状態」行、`-1`は「キャンセル」行を表します。データ型は[Int8](/sql-reference/data-types/int-uint)です。

</details>

- クエリパラメータの詳細については、[クエリの説明](../../../sql-reference/statements/create/table.md)を参照してください。
- `CollapsingMergeTree`テーブルを作成する際は、`MergeTree`テーブルを作成する場合と同じ[クエリ句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)が必要です。


## Collapsing {#table_engine-collapsingmergetree-collapsing}

### データ {#data}

あるオブジェクトに対して継続的に変化するデータを保存する必要がある状況を考えてみましょう。
オブジェクトごとに1行を持ち、何か変更があるたびに更新するのが論理的に思えるかもしれませんが、
更新操作はストレージ内のデータの書き換えを必要とするため、DBMSにとってコストが高く低速です。
データを高速に書き込む必要がある場合、大量の更新を実行することは適切なアプローチではありませんが、
オブジェクトの変更を常に順次書き込むことは可能です。
そのために、特別なカラム`Sign`を使用します。

- `Sign` = `1`の場合、その行は「状態」行を意味します：_現在の有効な状態を表すフィールドを含む行_。
- `Sign` = `-1`の場合、その行は「キャンセル」行を意味します：_同じ属性を持つオブジェクトの状態をキャンセルするために使用される行_。

例えば、あるウェブサイトでユーザーが何ページ閲覧し、どのくらいの時間滞在したかを計算したいとします。
ある時点で、ユーザーアクティビティの状態を次の行として書き込みます:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

その後の時点で、ユーザーアクティビティの変更を記録し、次の2行として書き込みます:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

最初の行はオブジェクト(この場合はユーザー)の以前の状態をキャンセルします。
「キャンセルされた」行のすべてのソートキーフィールドを`Sign`を除いてコピーする必要があります。
上記の2行目には現在の状態が含まれています。

ユーザーアクティビティの最後の状態のみが必要なため、元の「状態」行と挿入した「キャンセル」
行は以下のように削除でき、オブジェクトの無効な(古い)状態を折りたたむことができます:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │ -- 古い「状態」行は削除可能
│ 4324182021466249494 │         5 │      146 │   -1 │ -- 「キャンセル」行は削除可能
│ 4324182021466249494 │         6 │      185 │    1 │ -- 新しい「状態」行は残る
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree`は、データパーツのマージが行われる際に、まさにこの_折りたたみ_動作を実行します。

:::note
各変更に2行が必要な理由については、
[アルゴリズム](#table_engine-collapsingmergetree-collapsing-algorithm)の段落でさらに説明されています。
:::

**このアプローチの特性**

1.  データを書き込むプログラムは、オブジェクトの状態をキャンセルできるように記憶しておく必要があります。「キャンセル」行には「状態」のソートキーフィールドのコピーと反対の`Sign`を含める必要があります。これによりストレージの初期サイズは増加しますが、データを高速に書き込むことができます。
2.  カラム内の長く成長する配列は、書き込み負荷の増加によりエンジンの効率を低下させます。データが単純であるほど、効率は高くなります。
3.  `SELECT`の結果は、オブジェクト変更履歴の一貫性に強く依存します。挿入用のデータを準備する際は正確に行ってください。一貫性のないデータでは予測不可能な結果が得られる可能性があります。例えば、セッション深度のような非負のメトリクスに対する負の値などです。

### アルゴリズム {#table_engine-collapsingmergetree-collapsing-algorithm}

ClickHouseがデータ[パーツ](/concepts/glossary#parts)をマージする際、
同じソートキー(`ORDER BY`)を持つ連続した行の各グループは最大2行に削減されます。
`Sign` = `1`の「状態」行と`Sign` = `-1`の「キャンセル」行です。
言い換えれば、ClickHouseではエントリが折りたたまれます。


各マージの結果として生成される data part ごとに、ClickHouse は次の内容を保存します:

|  |                                                                                                                                     |
|--|-------------------------------------------------------------------------------------------------------------------------------------|
|1.| 「state」行と「cancel」行の数が一致しており、かつ最後の行が「state」行である場合、最初の「cancel」行と最後の「state」行。 |
|2.| 「state」行の数が「cancel」行より多い場合、最後の「state」行。                                                                    |
|3.| 「cancel」行の数が「state」行より多い場合、最初の「cancel」行。                                                                    |
|4.| 上記以外のすべての場合、どの行も保存されません。                                                                                   |

さらに、「state」行が「cancel」行より少なくとも 2 行多い場合、または「cancel」行が「state」行より少なくとも 2 行多い場合、マージは継続されます。
ただし、ClickHouse はこの状況を論理エラーと見なしてサーバーログに記録します。 
このエラーは、同じデータが複数回挿入された場合に発生する可能性があります。 
したがって、コラプス処理によって統計値の計算結果が変化することはありません。
変更は徐々にコラプスされ、最終的にはほぼすべてのオブジェクトについて最後の状態のみが残ります。

`Sign` 列が必要なのは、マージアルゴリズムが、同じソートキーを持つすべての行が同じ結果の data part、さらには同じ物理サーバー上に含まれることを保証しないためです。 
ClickHouse は複数スレッドで `SELECT` クエリを処理し、結果内の行の順序を予測できません。 

`CollapsingMergeTree` テーブルから完全にコラプスされたデータを取得する必要がある場合は、集約が必要です。
コラプス処理を最終確定するには、`GROUP BY` 句と、Sign を考慮した集約関数を用いるクエリを書きます。 
たとえば個数を計算するには、`count()` の代わりに `sum(Sign)` を使用します。 
ある値の合計を計算するには、`sum(x)` の代わりに `sum(Sign * x)` と `HAVING sum(Sign) > 0` を組み合わせて使用します。
下記の[例](#example-of-use)を参照してください。

集約関数 `count`、`sum`、`avg` はこの方法で計算できます。 
オブジェクトに少なくとも 1 つでもコラプスされていない状態がある場合、集約 `uniq` も計算可能です。 
一方で、`min` および `max` は計算できません。これは、`CollapsingMergeTree` がコラプスされた状態の履歴を保存しないためです。

:::note
集約を行わずにデータを抽出する必要がある場合
（たとえば、最新の値が特定の条件に合致する行が存在するかどうかを確認したい場合）、 
`FROM` 句に対して [`FINAL`](../../../sql-reference/statements/select/from.md#final-modifier) 修飾子を使用できます。これは、結果を返す前にデータをマージします。
`CollapsingMergeTree` では、各キーについて最新の state 行のみが返されます。
:::



## 例 {#examples}

### 使用例 {#example-of-use}

以下のサンプルデータがあるとします:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree`を使用してテーブル`UAct`を作成しましょう:

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews UInt8,
    Duration UInt8,
    Sign Int8
)
ENGINE = CollapsingMergeTree(Sign)
ORDER BY UserID
```

次にデータを挿入します:

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
```

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1),(4324182021466249494, 6, 185, 1)
```

2つの`INSERT`クエリを使用して、2つの異なるデータパートを作成します。

:::note
単一のクエリでデータを挿入した場合、ClickHouseは1つのデータパートのみを作成し、マージは一切実行されません。
:::

次のようにデータを選択できます:

```sql
SELECT * FROM UAct
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

上記の返されたデータを見て、折りたたみが発生したかどうかを確認しましょう...
2つの`INSERT`クエリで、2つのデータパートを作成しました。
`SELECT`クエリは2つのスレッドで実行され、行の順序はランダムになりました。
しかし、折りたたみは**発生していません**。これは、データパートのマージがまだ行われておらず、
ClickHouseがバックグラウンドで予測不可能なタイミングでデータパートをマージするためです。

したがって、集約が必要になります。
これは[`sum`](/sql-reference/aggregate-functions/reference/sum)集約関数と
[`HAVING`](/sql-reference/statements/select/having)句を使用して実行します:

```sql
SELECT
    UserID,
    sum(PageViews * Sign) AS PageViews,
    sum(Duration * Sign) AS Duration
FROM UAct
GROUP BY UserID
HAVING sum(Sign) > 0
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┐
│ 4324182021466249494 │         6 │      185 │
└─────────────────────┴───────────┴──────────┘
```

集約が不要で折りたたみを強制したい場合は、`FROM`句に`FINAL`修飾子を使用することもできます。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

:::note
このデータ選択方法は効率が低く、大量のスキャンデータ(数百万行)での使用は推奨されません。
:::

### 別のアプローチの例 {#example-of-another-approach}

このアプローチの考え方は、マージがキーフィールドのみを考慮するというものです。
したがって、「キャンセル」行では、`Sign`列を使用せずに合計時に
前のバージョンの行を相殺する負の値を指定できます。

この例では、以下のサンプルデータを使用します:


```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │        -5 │     -146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

この手法では、負の値も格納できるようにするために、`PageViews` および `Duration` のデータ型を変更する必要があります。
そのため、`collapsingMergeTree` を使ってテーブル `UAct` を作成するときに、これらのカラムの型を `UInt8` から `Int16` に変更します。

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews Int16,
    Duration Int16,
    Sign Int8
)
ENGINE = CollapsingMergeTree(Sign)
ORDER BY UserID
```

この手法を、テーブルにデータを挿入してテストしてみましょう。

ただし、サンプルや小規模なテーブルであれば、この方法でも問題ありません。

```sql
INSERT INTO UAct VALUES(4324182021466249494,  5,  146,  1);
INSERT INTO UAct VALUES(4324182021466249494, -5, -146, -1);
INSERT INTO UAct VALUES(4324182021466249494,  6,  185,  1);

SELECT * FROM UAct FINAL;
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

```sql
SELECT
    UserID,
    sum(PageViews) AS PageViews,
    sum(Duration) AS Duration
FROM UAct
GROUP BY UserID
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┐
│ 4324182021466249494 │         6 │      185 │
└─────────────────────┴───────────┴──────────┘
```

```sql
SELECT COUNT() FROM UAct
```

```text
┌─count()─┐
│       3 │
└─────────┘
```

```sql
OPTIMIZE TABLE UAct FINAL;

SELECT * FROM UAct
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```
