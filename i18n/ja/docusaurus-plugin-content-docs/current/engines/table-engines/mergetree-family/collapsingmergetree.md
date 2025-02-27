---
slug: /engines/table-engines/mergetree-family/collapsingmergetree
sidebar_position: 70
sidebar_label: CollapsingMergeTree
keywords: ['updates', 'collapsing']
title: "CollapsingMergeTree"
description: "Inherits from MergeTree but adds logic for collapsing rows during the merge process."
---

# CollapsingMergeTree

## 説明 {#description}

`CollapsingMergeTree` エンジンは [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) から継承され、
マージプロセス中に行を崩すためのロジックを追加します。
`CollapsingMergeTree` テーブルエンジンは非同期で行のペアを削除（崩す）します。
その際、すべてのフィールドが同じソートキー（`ORDER BY`）の値を持ち、
特別なフィールドである `Sign` の値が `1` または `-1` である必要があります。
対になる値を持たない `Sign` の行は保持されます。

詳細については、ドキュメントの [Collapsing](#table_engine-collapsingmergetree-collapsing) セクションを参照してください。

:::note
このエンジンはストレージのボリュームを大幅に削減し、
結果として `SELECT` クエリの効率を向上させることができます。
:::

## パラメータ {#parameters}

このテーブルエンジンのすべてのパラメータは、`Sign` パラメータを除き、[`MergeTree`](/engines/table-engines/mergetree-family/mergetree) と同じ意味を持ちます。

- `Sign` — `1` が「状態」行で、`-1` が「キャンセル」行のタイプの行を示すカラムの名前。タイプ: [Int8](/sql-reference/data-types/int-uint)。

## テーブル作成 {#creating-a-table}

``` sql
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

<summary>テーブル作成のための非推奨の方法</summary>

:::note
以下の方法は新しいプロジェクトでの使用は推奨されません。
可能であれば、古いプロジェクトを新しい方法に更新することをお勧めします。
:::

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) 
ENGINE [=] CollapsingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, Sign)
```

`Sign` — `1` が「状態」行で、`-1` が「キャンセル」行のタイプの行を示すカラムの名前。 [Int8](/sql-reference/data-types/int-uint)。

</details>

- クエリパラメータの説明については、[クエリの説明](../../../sql-reference/statements/create/table.md)を参照してください。
- `CollapsingMergeTree` テーブルを作成する際には、`MergeTree` テーブルを作成する際と同じ [クエリ句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) が必要です。

## 崩し {#table_engine-collapsingmergetree-collapsing}

### データ {#data}

特定のオブジェクトの継続的に変化するデータを保存する必要がある状況を考えます。
オブジェクトごとに1行を持ち、何かが変わるたびにそれを更新するのが論理的に思えるかもしれませんが、
更新操作は高価で、DBMSにとっては遅く、ストレージ内のデータを書き直す必要があります。
迅速にデータを書き込む必要がある場合、大量の更新を行うのは受け入れられませんが、
オブジェクトの変更を逐次的に書き込むことはできます。
そのために、特別なカラム `Sign` を利用します。

- `Sign` = `1` は「状態」行を意味します: _現在の有効な状態を示すフィールドを含む行。
- `Sign` = `-1` は「キャンセル」行を意味します: _同じ属性を持つオブジェクトの状態をキャンセルするために使用される行。_

例えば、ユーザーがあるウェブサイトでチェックしたページ数と、それに費やした時間を計算したいとします。
ある時点で、ユーザーがアクティブだった状態を次の行で記録します:

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

その後、ユーザーアクティビティの変更を記録し、次の2行で書き込みます:

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

最初の行はオブジェクトの以前の状態をキャンセルします（この場合はユーザーを表しています）。
「キャンセル」行のすべてのソートキーのフィールドは `Sign` 以外をコピーする必要があります。
上の2行目には現在の状態が示されています。

ユーザーアクティビティの最終状態のみが必要なため、元の「状態」行と挿入した「キャンセル」行は次のように削除できます。無効（古い）状態のオブジェクトを崩して:

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │ -- 古い「状態」行は削除できる
│ 4324182021466249494 │         5 │      146 │   -1 │ -- 「キャンセル」行は削除できる
│ 4324182021466249494 │         6 │      185 │    1 │ -- 新しい「状態」行は残る
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree` はデータパーツがマージされる際にまさにこの崩しの動作を実行します。

:::note
各変更に2行が必要な理由は、[アルゴリズム](#table_engine-collapsingmergetree-collapsing-algorithm)の段落でさらに議論されています。
:::

**このアプローチの特異性**

1. データを書き込むプログラムは、オブジェクトの状態を保持してキャンセルできる必要があります。「キャンセル」行には、「状態」のソートキーのフィールドのコピーと逆の `Sign` が含まれるべきです。これにより最初のストレージサイズは増加しますが、データの迅速な書き込みが可能になります。
2. カラム内の長い増加する配列は、書き込みによる負荷が増加するためエンジンの効率を低下させます。データが単純であるほど効率が高まります。
3. `SELECT` 結果は、オブジェクトの変更履歴の一貫性に強く依存します。挿入のためのデータ準備には注意を払ってください。矛盾するデータに対しては予測不可能な結果が得られる可能性があります。例えば、セッションの深さのような非負のメトリクスに対して負の値。

### アルゴリズム {#table_engine-collapsingmergetree-collapsing-algorithm}

ClickHouseがデータ [パーツ](/concepts/glossary#parts) をマージするとき、   
同じソートキー（`ORDER BY`）を持つ連続した行の各グループは、最大で2行に減少します。  
「状態」行は `Sign` = `1` で、  
「キャンセル」行は `Sign` = `-1` です。  
言い換えれば、ClickHouseのエントリーは崩れます。

ClickHouseは各結果のデータパーツに対して次を保存します。

|  |                                                                                                                                     |
|--|-------------------------------------------------------------------------------------------------------------------------------------|
|1.| 「キャンセル」行が最初で、「状態」行が最後の行は、「状態」行と「キャンセル」行の数が一致する場合、且つ最後の行が「状態」行であるとき。 |
|2.| 「状態」行が「キャンセル」行よりも多い場合は、最後の「状態」行。                                                            |
|3.| 「キャンセル」行が「状態」行よりも多い場合は、最初の「キャンセル」行。                                                          |
|4.| その他の場合には行は保存されません。                                                                                               |

さらに、「状態」行が「キャンセル」行よりも少なくとも2行多い場合、または「キャンセル」行が「状態」行よりも少なくとも2行多い場合、マージが続行されます。  
ただし、ClickHouseはこの状況を論理エラーと見なし、サーバーログに記録します。  
このエラーは、同じデータが複数回挿入された場合に発生する可能性があります。  
したがって、崩しは統計の計算結果を変更するべきではありません。  
変更は徐々に崩され、最終的にはほぼすべてのオブジェクトの最終状態のみが残ります。

`Sign` カラムは必要です。マージアルゴリズムは、同じソートキーを持つすべての行が同じ結果のデータパーツ内、さらには同じ物理サーバーに存在することを保証しません。  
ClickHouseは `SELECT` クエリを複数のスレッドで処理し、結果の行の順序を予測できません。

集約は、`CollapsingMergeTree` テーブルから完全に「崩される」データを取得する必要がある場合に必要です。  
崩しを最終化するには、`GROUP BY` 句とサインを考慮した集約関数を使用したクエリを記述します。  
たとえば、数量を計算するには `count()` の代わりに `sum(Sign)` を使用します。  
何かの合計を計算するには、`sum(Sign * x)` と共に `HAVING sum(Sign) > 0` を使用し、  
[例](#example-of-use)に示すように `sum(x)` の代わりに使用します。

集約 `count`、`sum`、`avg` はこの方法で計算できます。  
集約 `uniq` は、オブジェクトが少なくとも1つの非崩れ状態を持つ場合に計算できます。  
集約 `min` と `max` は、  
`CollapsingMergeTree` が崩された状態の履歴を保存しないため、計算できません。

:::note
集約なしでデータを抽出する必要がある場合  
（たとえば、最新の値が特定の条件に一致する行が存在するかを確認するため）、  
`FROM` 句のための [`FINAL`](../../../sql-reference/statements/select/from.md#final-modifier) 修飾子を使用できます。これは、結果を返す前にデータをマージします。  
CollapsingMergeTree では、各キーの最新の状態行のみが返されます。
:::

## 例 {#examples}

### 使用例 {#example-of-use}

次の例のデータを考えます。

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

次に、`CollapsingMergeTree` を使用してテーブル `UAct` を作成します。

``` sql
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

次に、いくつかのデータを挿入します。

``` sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
```

``` sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1),(4324182021466249494, 6, 185, 1)
```

2つの異なるデータパーツを作成するために2つの `INSERT` クエリを使用します。

:::note
データを単一のクエリで挿入すると、ClickHouseは1つのデータパーツのみを作成し、決してマージを行いません。
:::

データを次のように選択できます。

``` sql
SELECT * FROM UAct
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

上記の戻りデータを見て、崩しが発生したかどうかを確認しましょう...  
2つの `INSERT` クエリで2つのデータパーツを作成しました。  
`SELECT` クエリは2スレッドで実行され、ランダムな行の順序を得ました。  
しかし、崩しは **発生しませんでした** なぜならデータパーツがまだマージされておらず、  
ClickHouseは予測できないタイミングでバックグラウンドでデータパーツをマージするからです。

したがって、集約が必要です。  
集約関数 [`sum`](/sql-reference/aggregate-functions/reference/sum) と 
`HAVING` (/docs/sql-reference/statements/select/having) 句を使って集約を行います。

``` sql
SELECT
    UserID,
    sum(PageViews * Sign) AS PageViews,
    sum(Duration * Sign) AS Duration
FROM UAct
GROUP BY UserID
HAVING sum(Sign) > 0
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┐
│ 4324182021466249494 │         6 │      185 │
└─────────────────────┴───────────┴──────────┘
```

集約が不要で、崩しを強制したい場合、`FROM` 句に対して `FINAL` 修飾子を使用することもできます。

``` sql
SELECT * FROM UAct FINAL
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```
:::note
この方法でデータを選択するのは非効率的であり、大量のスキャンデータ（数百万行）に使用することは推奨されません。
:::

### 別のアプローチの例 {#example-of-another-approach}

このアプローチのアイデアは、マージではキーのフィールドのみを考慮することです。  
したがって、「キャンセル」行には負の値を指定することができ、  
`Sign` カラムを使用せずに行の前のバージョンを合計で等しくします。

この例では、以下のサンプルデータを使用します。

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │        -5 │     -146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

このアプローチでは、`PageViews` と `Duration` のデータタイプを負の値を格納できるように変更する必要があります。  
したがって、テーブル `UAct` を作成する際にこれらのカラムの値を `UInt8` から `Int16` に変更します。

``` sql
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

データをテーブルに挿入してこのアプローチを試してみましょう。

例や小さなテーブルの場合、これは受け入れ可能です。

``` sql
INSERT INTO UAct VALUES(4324182021466249494,  5,  146,  1);
INSERT INTO UAct VALUES(4324182021466249494, -5, -146, -1);
INSERT INTO UAct VALUES(4324182021466249494,  6,  185,  1);

SELECT * FROM UAct FINAL;
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

``` sql
SELECT
    UserID,
    sum(PageViews) AS PageViews,
    sum(Duration) AS Duration
FROM UAct
GROUP BY UserID
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┐
│ 4324182021466249494 │         6 │      185 │
└─────────────────────┴───────────┴──────────┘
```

``` sql
SELECT COUNT() FROM UAct
```

``` text
┌─count()─┐
│       3 │
└─────────┘
```

``` sql
OPTIMIZE TABLE UAct FINAL;

SELECT * FROM UAct
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```
