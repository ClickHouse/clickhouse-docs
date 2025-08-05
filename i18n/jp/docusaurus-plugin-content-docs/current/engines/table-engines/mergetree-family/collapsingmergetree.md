---
description: 'MergeTree から継承され、マージプロセス中に行を折り畳むロジックが追加されています。'
keywords:
- 'updates'
- 'collapsing'
sidebar_label: 'CollapsingMergeTree'
sidebar_position: 70
slug: '/engines/table-engines/mergetree-family/collapsingmergetree'
title: 'CollapsingMergeTree'
---




# CollapsingMergeTree

## Description {#description}

`CollapsingMergeTree` エンジンは [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) から継承され、マージプロセス中に行を統合するためのロジックを追加します。 `CollapsingMergeTree` テーブルエンジンは、すべてのフィールドがソートキー (`ORDER BY`) で等価で、特別なフィールド `Sign` の値が `1` または `-1` の場合に、対になる行を非同期的に削除 (統合) します。 対になる値の `Sign` を持たない行は保持されます。

詳細については、ドキュメントの [Collapsing](#table_engine-collapsingmergetree-collapsing) セクションを参照してください。

:::note
このエンジンはストレージのボリュームを大幅に削減し、その結果、`SELECT` クエリの効率を高める可能性があります。
:::

## Parameters {#parameters}

`Sign` パラメータを除く、このテーブルエンジンのすべてのパラメータは、[`MergeTree`](/engines/table-engines/mergetree-family/mergetree) と同じ意味を持ちます。

- `Sign` — `1` が「状態」行、`-1` が「キャンセル」行を持つ行のタイプのカラムに与えられた名前。タイプ: [Int8](/sql-reference/data-types/int-uint)。

## Creating a Table {#creating-a-table}

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

<summary>Deprecated Method for Creating a Table</summary>

:::note
以下の手法は新しいプロジェクトでの使用が推奨されません。 可能であれば、古いプロジェクトを新しい手法に更新することをお勧めします。
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

`Sign` — `1` が「状態」行、`-1` が「キャンセル」行を持つ行のタイプのカラムに与えられた名前。 [Int8](/sql-reference/data-types/int-uint)。

</details>

- クエリパラメータの説明については [query description](../../../sql-reference/statements/create/table.md) を参照してください。
- `CollapsingMergeTree` テーブルを作成する際には、`MergeTree` テーブルを作成する際と同様の [クエリ句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) が必要です。

## Collapsing {#table_engine-collapsingmergetree-collapsing}

### Data {#data}

ある特定のオブジェクトのために継続的に変化するデータを保存する必要があるとしましょう。 1つの行をオブジェクトごとに持ち、何かが変わるたびに更新するのが論理的に思えるかもしれませんが、更新操作はコストが高く、遅いため、ストレージ上のデータを再書き込みする必要があります。 データを書き込むために迅速な処理が必要な場合、大量の更新を行うことは受け入れられませんが、常にオブジェクトの変更を順次記録することができます。 これを行うために、特別なカラム `Sign` を利用します。

- `Sign` = `1` の場合、それは行が「状態」行であることを意味します: _現在の有効な状態を表すフィールドを含む行_。
- `Sign` = `-1` の場合、それは行が「キャンセル」行であることを意味します: _同じ属性を持つオブジェクトの状態をキャンセルするために使用される行_。

例えば、私たちはユーザーがあるウェブサイトでチェックしたページ数とその訪問期間を計算したいとします。 ある時点で、ユーザー活動の状態を持つ次の行を書き込みます：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

後のタイミングで、ユーザー活動の変化を記録し、次の2行で書き込みます：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

最初の行はオブジェクトの以前の状態をキャンセルします (この場合、ユーザーを表現)。 それは「キャンセル」された行のすべてのソートキーのフィールドを `Sign` を除いてコピーする必要があります。 上の2行目は現在の状態を含みます。

我々はユーザー活動の最後の状態のみを必要とするため、元の「状態」行と挿入した「キャンセル」行は以下のように削除される可能性があります。無効（古い）状態のオブジェクトを統合します：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │ -- 古い "状態" 行は削除可能
│ 4324182021466249494 │         5 │      146 │   -1 │ -- "キャンセル" 行は削除可能
│ 4324182021466249494 │         6 │      185 │    1 │ -- 新しい "状態" 行は残る
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree` はデータパーツのマージ時にこの_統合_の動作を正確に実行します。

:::note
各変更に2行が必要な理由は、[Algorithm](#table_engine-collapsingmergetree-collapsing-algorithm) の段落でさらに説明されています。
:::

**そのようなアプローチの特異性**

1. データを書き込むプログラムは、キャンセルできるようにオブジェクトの状態を記憶しておく必要があります。「キャンセル」行には「状態」行のソートキーのフィールドのコピーと反対の `Sign` を含む必要があります。これにより、初期のストレージサイズは増加しますが、迅速にデータを書き込むことが可能になります。
2. カラム内の長い成長配列は、書き込みの負荷が増加するため、エンジンの効率を低下させます。データがシンプルであればあるほど、効率は高くなります。
3. `SELECT` 結果はオブジェクト変更履歴の整合性に大きく依存します。挿入用にデータを準備する際は正確であることが大切です。整合性のないデータでは予測不可能な結果を得ることがあります。例えば、セッション深度などの非負メトリクスに対する負の値です。

### Algorithm {#table_engine-collapsingmergetree-collapsing-algorithm}

ClickHouseがデータ [parts](/concepts/glossary#parts) をマージする際、同じソートキー (`ORDER BY`) を持つ連続した行の各グループは、最大で2行（`Sign` = `1` の「状態」行と `Sign` = `-1` の「キャンセル」行）に削減されます。 言い換えれば、ClickHouseエントリは統合されます。

各結果データパートについて ClickHouse は次を保存します：

|  |                                                                                                                                     |
|--|-------------------------------------------------------------------------------------------------------------------------------------|
|1.| 「状態」行と「キャンセル」行の数が一致し、最後の行が「状態」行である場合に、最初の「キャンセル」行と最後の「状態」行。 |
|2.| 「キャンセル」行の数が「状態」行の数より少ない場合、最後の「状態」行。                                                            |
|3.| 「状態」行の数が「キャンセル」行の数より少ない場合、最初の「キャンセル」行。                                                          |
|4.| その他のすべてのケースでは、行は何も保存されません。                                                                                               |

さらに、「状態」行が「キャンセル」行よりも少なくとも2本多い場合や、「キャンセル」行が「状態」行よりも少なくとも2本多い場合は、マージが続行されます。ただし、ClickHouseはこの状況を論理エラーと見なし、サーバーログに記録します。このエラーは、同じデータを複数回挿入した場合に発生する可能性があります。したがって、統合は統計計算の結果を変更してはなりません。変更は徐々に統合され、最終的にはほぼすべてのオブジェクトの最新の状態のみが残ります。

`Sign` カラムが必要なのは、マージアルゴリズムが同じソートキーを持つすべての行が同じ結果データパートにあり、同じ物理サーバーにもいると保証しないからです。 ClickHouseは複数のスレッドで `SELECT` クエリを処理し、結果の行の順序を予測することができません。

完全に「統合」されたデータを `CollapsingMergeTree` テーブルから取得する必要がある場合は、集約が必要です。 統合を最終化するために、`GROUP BY` 句と `Sign` を考慮した集約関数を持つクエリを書きます。 例えば、数量を計算するには `count()` の代わりに `sum(Sign)` を使用します。 何かの合計を計算するには `sum(Sign * x)` を使用し、 `HAVING sum(Sign) > 0` と組み合わせて `sum(x)` の代わりに使用します。以下の [example](#example-of-use) 参照。

集計 `count`, `sum` および `avg` はこのように計算できます。オブジェクトに少なくとも1つの非統合状態がある場合、集約 `uniq` を計算できます。集計 `min` および `max` は計算できません、なぜなら `CollapsingMergeTree` は統合されている状態の履歴を保存しないからです。

:::note
集約なしでデータを抽出する必要がある場合（例えば、最新の値が特定の条件に一致する行が存在するかどうかを確認するため）、`FROM` 句の [`FINAL`](../../../sql-reference/statements/select/from.md#final-modifier) 修飾子を使用できます。これにより、結果を返す前にデータがマージされます。
CollapsingMergeTree では、各キーの最新の状態行のみが返されます。
:::

## Examples {#examples}

### Example of Use {#example-of-use}

次の例データを考えてみましょう：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree` を使用してテーブル `UAct` を作成しましょう：

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

次に、データを挿入します：

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
```

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1),(4324182021466249494, 6, 185, 1)
```

2つの `INSERT` クエリを使用して、2つの異なるデータパーツを作成します。

:::note
単一のクエリでデータを挿入した場合、ClickHouseは1つのデータパートのみを作成し、マージは行われません。
:::

データを選択するには：

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

返されたデータを見て、統合が行われたかどうか確認しましょう... 2つの `INSERT` クエリで、2つのデータパーツを作成しました。 `SELECT` クエリは2つのスレッドで実行され、行の順序はランダムになりました。 しかし、統合は **行われませんでした** なぜなら、データパーツのマージはまだ行われておらず、ClickHouseは未知の瞬間にバックグラウンドでデータパーツをマージするからです。

したがって、集約が必要です。 これは、[`sum`](/sql-reference/aggregate-functions/reference/sum) 集約関数と [`HAVING`](/sql-reference/statements/select/having) 句を使用して実行します：

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

集約が不要で統合を強制したい場合は、`FROM` 句に対して `FINAL` 修飾子も使用できます。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

:::note
この方法でデータを選択することは非効率的であり、大量のスキャンデータ（数百万行）には使用をお勧めしません。
:::

### Example of Another Approach {#example-of-another-approach}

このアプローチの考えは、マージがキーのフィールドのみを考慮するということです。「キャンセル」行では、したがって、`Sign` カラムを使用せずに合計する際、行の前のバージョンを等しくするマイナス値を指定できます。

この例では、以下のサンプルデータを使用します：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │        -5 │     -146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

このアプローチでは、負の値を保存するために `PageViews` および `Duration` のデータ型を変更する必要があります。したがって、`collapsingMergeTree` を使用してテーブル `UAct`を作成する際にこれらの列の値を `UInt8` から `Int16` に変更します：

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

テーブルにデータを挿入してアプローチをテストします。 

例や小規模なテーブルでは、これは受け入れられます：

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
