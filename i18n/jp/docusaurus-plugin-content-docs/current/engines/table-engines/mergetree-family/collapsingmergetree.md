---
slug: /engines/table-engines/mergetree-family/collapsingmergetree
sidebar_position: 70
sidebar_label: CollapsingMergeTree
keywords: ['updates', 'collapsing']
title: "CollapsingMergeTree"
description: "MergeTreeから継承され、マージプロセス中に行を圧縮するロジックを追加します。"
---


# CollapsingMergeTree

## 説明 {#description}

`CollapsingMergeTree` エンジンは [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) から継承され、マージプロセス中に行を圧縮するロジックを追加します。
`CollapsingMergeTree` テーブルエンジンは、すべてのソートキー（`ORDER BY`）のフィールドが同等で、特別なフィールド `Sign` のみが `1` または `-1` のいずれかの値を持つ場合に、行のペアを非同期に削除（圧縮）します。
逆の値を持つ `Sign` のペアがない行は保持されます。

詳細については、ドキュメントの [Collapsing](#table_engine-collapsingmergetree-collapsing) セクションを参照してください。

:::note
このエンジンはストレージのボリュームを大幅に削減し、それによって `SELECT` クエリの効率を向上させる可能性があります。
:::

## パラメータ {#parameters}

このテーブルエンジンのすべてのパラメータは、`Sign` パラメータを除き、[`MergeTree`](/engines/table-engines/mergetree-family/mergetree) と同じ意味を持ちます。

- `Sign` — `1` が「状態」行、`-1` が「キャンセル」行のタイプの行を持つカラムに付けられる名前。タイプ: [Int8](/sql-reference/data-types/int-uint)。

## テーブルの作成 {#creating-a-table}

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

<summary>テーブルを作成するための非推奨方法</summary>

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

`Sign` — `1` が「状態」行、`-1` が「キャンセル」行のタイプの行を持つカラムに付けられる名前。 [Int8](/sql-reference/data-types/int-uint)。

</details>

- クエリパラメータの説明については、[クエリの説明](../../../sql-reference/statements/create/table.md) を参照してください。
- `CollapsingMergeTree` テーブルを作成する場合、`MergeTree` テーブルを作成する際と同じ [クエリ句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) が必要です。

## 圧縮 {#table_engine-collapsingmergetree-collapsing}

### データ {#data}

特定のオブジェクトに対して常に変化するデータを保存する必要がある状況を考えてみましょう。
オブジェクトごとに1行を持ち、何かが変わるたびにそれを更新するのは論理的なように思えるかもしれませんが、更新操作は硬直性が高くDBMSには高価で遅く、ストレージのデータを書き換える必要が生じます。
データを迅速に書き込む必要がある場合、大量の更新を行うことは許容されるアプローチではありませんが、オブジェクトの変更を逐次書き込むことは常に可能です。
そのために、特別なカラム `Sign` を使用します。

- `Sign` = `1` の場合、それは行が「状態」行であることを意味します: _現在の有効な状態を表すフィールドを含む行_。
- `Sign` = `-1` の場合、それは行が「キャンセル」行であることを意味します: _同じ属性を持つオブジェクトの状態をキャンセルするために使用される行_。

例えば、ユーザーがあるウェブサイトでチェックしたページ数とそのページにどれだけ訪れたかを計算したいとします。
ある特定の瞬間に、ユーザーアクティビティの状態を持つ次の行を書き込みます：

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

後の瞬間に、ユーザーアクティビティの変化を登録し、次の2つの行に書き込みます：

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

最初の行は、オブジェクトの前の状態（この場合、ユーザーを表す）をキャンセルします。
「キャンセル」行のすべてのソートキーのフィールドを `Sign` を除いてコピーする必要があります。
上記の2行目には、現在の状態が含まれています。

ユーザーアクティビティの最新の状態のみが必要なため、挿入した元の「状態」行と「キャンセル」行は、以下のように削除できます。

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │ -- 古い "状態" 行は削除できます
│ 4324182021466249494 │         5 │      146 │   -1 │ -- "キャンセル" 行は削除できます
│ 4324182021466249494 │         6 │      185 │    1 │ -- 新しい "状態" 行は残ります
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree` は、データパーツのマージの際にこの_圧縮_動作を正確に実行します。

:::note
各変更に2行が必要な理由については、[アルゴリズム](#table_engine-collapsingmergetree-collapsing-algorithm)の段落でさらに議論しています。
:::

**このアプローチの特異性**

1. データを書き込むプログラムはオブジェクトの状態を記憶しておく必要があり、それをキャンセルできるようにします。「キャンセル」行は「状態」行のソートキーのフィールドのコピーと反対の `Sign` を含む必要があります。これは、初期のストレージサイズを増加させますが、データを書き込むのを迅速にします。
2. カラム内の長い増加配列は、書き込みの負荷が増加するため、エンジンの効率を低下させます。データがシンプルであるほど、効率は高くなります。
3. `SELECT` 結果は、オブジェクトの変更履歴の一貫性に強く依存します。挿入のためのデータを準備する際は正確である必要があります。不整合なデータでは予測不可能な結果を得る可能性があります。例えば、セッションの深さなどの非負のメトリックに対して負の値が生じる可能性があります。

### アルゴリズム {#table_engine-collapsingmergetree-collapsing-algorithm}

ClickHouse がデータ [パーツ](/concepts/glossary#parts) をマージするとき、同じソートキー（`ORDER BY`）を持つ連続する行の各グループは、1つまたは2つの行に削減されます。「状態」行は `Sign` = `1` であり、「キャンセル」行は `Sign` = `-1` です。
言い換えれば、ClickHouse ではエントリが圧縮されます。

ClickHouse は各結果データパートに対して次の内容を保存します：

|  |                                                                                                                                     |
|--|-------------------------------------------------------------------------------------------------------------------------------------|
|1.| 「状態」行と「キャンセル」行の数が一致し、最後の行が「状態」行である場合、最初の「キャンセル」行と最後の「状態」行。 |
|2.| 「キャンセル」行よりも「状態」行が多い場合の最後の「状態」行。                                                            |
|3.| 「状態」行よりも「キャンセル」行が多い場合の最初の「キャンセル」行。                                                          |
|4.| その他すべての場合、行は保存しません。                                                                                               |

さらに「キャンセル」行よりも「状態」行が2行以上あるか、「状態」行よりも「キャンセル」行が2行以上ある場合、マージは続行されます。 
ただし、ClickHouse はこの状況を論理エラーとして扱い、サーバーログに記録します。 
このエラーは、同じデータが複数回挿入された場合に発生する可能性があります。 
したがって、圧縮は統計の計算結果を変更してはなりません。
変更は徐々に圧縮され、最終的にはほぼすべてのオブジェクトの最新の状態のみが残ります。

`Sign` 列は必要です。なぜなら、マージアルゴリズムは、同じソートキーを持つすべての行が同じ結果データパートにあり、同じ物理サーバーに存在することを保証しないからです。 
ClickHouse は `SELECT` クエリを複数のスレッドで処理し、結果の行の順序を予測することはできません。

完全に「圧縮」されたデータを `CollapsingMergeTree` テーブルから取得する必要がある場合は、集約が必要です。 
圧縮を完了するには、`GROUP BY` 句と `Sign` を考慮した集約関数を持つクエリを書きます。 
たとえば、数量を計算するには `count()` ではなく `sum(Sign)` を使用します。 
何かの合計を計算するには、`sum(Sign * x)` と `HAVING sum(Sign) > 0` を一緒に使用します。 
以下の [使用例](#example-of-use) を参照してください。

集約関数 `count`、`sum` および `avg` は、この方法で計算できます。 
オブジェクトに少なくとも1つの未圧縮の状態がある場合、集約関数 `uniq` を計算できます。 
ただし、集約関数 `min` と `max` は計算できません。 
なぜなら、`CollapsingMergeTree` は圧縮された状態の履歴を保存しないからです。

:::note
集約なしでデータを抽出する必要がある場合（例えば、最新の値が特定の条件に一致する行が存在するか確認するため）、`FROM` 句の [`FINAL`](../../../sql-reference/statements/select/from.md#final-modifier) 修飾子を使用できます。結果を返す前にデータをマージします。 `CollapsingMergeTree` では、各キーの最新の状態行のみが返されます。
:::

## 例 {#examples}

### 使用例 {#example-of-use}

次の例データを考えてみましょう：

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree` を使用してテーブル `UAct` を作成しましょう：

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

次に、いくつかのデータを挿入します：

``` sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
```

``` sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1),(4324182021466249494, 6, 185, 1)
```

2つの `INSERT` クエリを使用して、2つの異なるデータパーツを作成します。

:::note
データを単一のクエリで挿入すると、ClickHouse はデータパーツを1つしか作成せず、結局マージを行いません。
:::

データを次のように選択できます：

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

戻されたデータを見て圧縮が行われたかどうかを確認しましょう...
2つの `INSERT` クエリで、2つのデータパーツを作成しました。 
`SELECT` クエリは2つのスレッドで実行され、行のランダムな順序が得られました。
ただし、圧縮は **行われませんでした**。なぜなら、データパーツはまだマージされておらず、ClickHouse はデータパーツを未知のタイミングでバックグラウンドでマージするためです。

したがって、集約が必要です。 
これは [`sum`](/sql-reference/aggregate-functions/reference/sum) 集約関数と [`HAVING`](/sql-reference/statements/select/having) 句を使用して実行します：

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

集約が必要ない場合に圧縮を強制したい場合、`FROM` 句に対して `FINAL` 修飾子を使用することもできます。

``` sql
SELECT * FROM UAct FINAL
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```
:::note
このデータを選択する方法は効率が悪く、大量のスキャンデータ（数百万行）に使用することは推奨されません。
:::

### 別のアプローチの例 {#example-of-another-approach}

このアプローチのアイデアは、マージがキーのフィールドのみを考慮することです。
「キャンセル」行では、`Sign` 列を使用することなく、行の前のバージョンを合計するために等価な負の値を指定できます。

この例のために、次のサンプルデータを使用します：

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │        -5 │     -146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

このアプローチのためには、`PageViews` と `Duration` のデータタイプを変更して負の値を保存できるようにする必要があります。 
したがって、テーブル `UAct` を作成するときに、これらのカラムの値を `UInt8` から `Int16` に変更します：

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

テーブルにデータを挿入して、このアプローチをテストしましょう。

小規模のテーブルや例では、以下のようにすることが許容されます：

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
