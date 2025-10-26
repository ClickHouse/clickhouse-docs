---
'description': 'MergeTreeから継承しますが、マージプロセス中に行を統合するロジックを追加します。'
'keywords':
- 'updates'
- 'collapsing'
'sidebar_label': 'CollapsingMergeTree'
'sidebar_position': 70
'slug': '/engines/table-engines/mergetree-family/collapsingmergetree'
'title': 'CollapsingMergeTree'
'doc_type': 'guide'
---


# CollapsingMergeTree

## Description {#description}

`CollapsingMergeTree` エンジンは [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) から継承され、マージプロセス中に行を消去（コラプス）するロジックを追加します。 `CollapsingMergeTree` テーブルエンジンは、すべてのフィールドがソートキー（`ORDER BY`）において等しいペアの行を非同期的に削除（コラプス）します。ただし、特別なフィールド `Sign` は `1` または `-1` のいずれかの値を持つことができます。逆の値を持つ `Sign` のペアを持たない行は保持されます。

詳しくは、ドキュメントの [Collapsing](#table_engine-collapsingmergetree-collapsing) セクションを参照してください。

:::note
このエンジンは、ストレージのボリュームを大幅に削減し、結果として `SELECT` クエリの効率を向上させる可能性があります。
:::

## Parameters {#parameters}

このテーブルエンジンのすべてのパラメータは、`Sign` パラメータを除いて、[`MergeTree`](/engines/table-engines/mergetree-family/mergetree) と同じ意味を持ちます。

- `Sign` — 行タイプのカラムに付けられた名前で、`1` が「状態」行、`-1` が「キャンセル」行を表します。タイプ: [Int8](/sql-reference/data-types/int-uint)。

## Creating a table {#creating-a-table}

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

<summary>テーブルを作成するための非推奨メソッド</summary>

:::note
以下のメソッドは新しいプロジェクトでの使用は推奨しません。 
可能であれば、古いプロジェクトを新しいメソッドに更新することをお勧めします。
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

`Sign` — 行タイプのカラムに付けられた名前で、`1` が「状態」行、`-1` が「キャンセル」行を表します。 [Int8](/sql-reference/data-types/int-uint)。

</details>

- クエリパラメータの説明については、[クエリの説明](../../../sql-reference/statements/create/table.md)を参照してください。
- `CollapsingMergeTree` テーブルを作成する際には、`MergeTree` テーブルを作成する際と同様の [クエリ句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) が必要です。

## Collapsing {#table_engine-collapsingmergetree-collapsing}

### Data {#data}

ある特定のオブジェクトのために継続的に変化するデータを保存する必要がある状況を考えてみましょう。オブジェクトごとに1行を持ち、何かが変更されるたびにそれを更新することは論理的に思えるかもしれませんが、更新操作は高コストでDBMSにとっては遅く、ストレージ内のデータの書き換えを必要とします。迅速にデータを書き込む必要がある場合、大量の更新を行うことは受け入れられないアプローチですが、オブジェクトの変更を逐次的に書き込むことはできます。そのために、特別なカラム `Sign` を使用します。

- `Sign` が `1` の場合、行は「状態」行を意味します：_現在の有効な状態を表すフィールドを含む行_。
- `Sign` が `-1` の場合、行は「キャンセル」行を意味します：_同じ属性を持つオブジェクトの状態をキャンセルするために使用される行_。

例えば、ユーザーがウェブサイトでどのくらいのページをチェックしたか、およびどれくらいの時間訪問したかを計算したいとします。ある時点で、ユーザーのアクティビティの状態を持つ次の行を書き込みます：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

後でユーザーのアクティビティの変更を登録し、次の2つの行を書き込みます：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

最初の行はオブジェクトの前の状態（この場合はユーザーを表す）をキャンセルします。「キャンセル」行の場合、`Sign` を除いてすべてのソートキーのフィールドをコピーする必要があります。上の2番目の行には、現在の状態が含まれています。

ユーザーアクティビティの最後の状態のみが必要であるため、元の「状態」行と挿入した「キャンセル」行は、次のように削除され、オブジェクトの無効（古い）状態をコラプスします：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │ -- old "state" row can be deleted
│ 4324182021466249494 │         5 │      146 │   -1 │ -- "cancel" row can be deleted
│ 4324182021466249494 │         6 │      185 │    1 │ -- new "state" row remains
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree` は、データパーツのマージ時にまさにこの _コラプス_ の動作を実行します。

:::note
各変更に2行が必要な理由については、[Algorithm](#table_engine-collapsingmergetree-collapsing-algorithm) の段落でさらに詳しく説明します。
:::

**このアプローチの特異性**

1.  データを書き込むプログラムは、オブジェクトの状態を記憶してキャンセルできるようにしなければなりません。「キャンセル」行には「状態」のソートキーのフィールドのコピーが含まれ、対義の `Sign` が必要です。これはストレージの初期サイズを増加させますが、データを迅速に書き込むことを可能にします。
2.  カラム内の長い配列は、書き込みの負荷が増加するため、エンジンの効率を低下させます。データがシンプルであるほど、効率は高まります。
3.  `SELECT` 結果は、オブジェクト変更履歴の整合性に強く依存します。挿入するデータを準備する際は注意してください。不整合なデータでは予測不可能な結果を得ることがあります。例えば、セッションの深さのような非負のメトリックに対して負の値を得ることです。

### Algorithm {#table_engine-collapsingmergetree-collapsing-algorithm}

ClickHouseがデータの [parts](/concepts/glossary#parts) をマージするとき、同じソートキー（`ORDER BY`）を持つ連続した行のグループは2行以下に減少します。「状態」行は `Sign` = `1` であり、「キャンセル」行は `Sign` = `-1` です。言い換えれば、ClickHouseのエントリはコラプスします。

ClickHouseは各結果データパートのために次のものを保存します：

|  |                                                                                                                                     |
|--|-------------------------------------------------------------------------------------------------------------------------------------|
|1.| 「キャンセル」行が最初と「状態」行が最後である場合、もし「状態」行と「キャンセル」行の数が一致し、最後の行が「状態」行である時。 |
|2.| 「状態」行が「キャンセル」行より多い場合の最後の「状態」行。                                                            |
|3.| 「キャンセル」行が「状態」行より多い場合の最初の「キャンセル」行。                                                          |
|4.| 他のすべてのケースでは、行は保存されません。                                                                                               |

さらに、「状態」行が「キャンセル」行より少なくとも2行多い場合、または「キャンセル」行が「状態」行より少なくとも2行多い場合、マージは続行されます。しかし、ClickHouseはこの状況を論理エラーとして扱い、サーバーログに記録します。このエラーは、同じデータが複数回挿入された場合に発生する可能性があります。そのため、コラプスは統計の計算結果を変更してはなりません。変更は徐々にコラプスされ、最終的にはほぼすべてのオブジェクトの最後の状態だけが残ります。

`Sign` カラムは、マージアルゴリズムが同じソートキーを持つすべての行が同じ結果データパートにあり、さらには同じ物理サーバーにも存在することを保証しないため、必要です。ClickHouseは複数スレッドで `SELECT` クエリを処理し、結果の行の順序を予測できません。

`CollapsingMergeTree` テーブルから完全に「コラプス」したデータを取得する必要がある場合は、集約が必要です。コラプスを最終化するために、集約関数を考慮し `GROUP BY` 句を含むクエリを書きます。例えば、数量を計算するために `count()` の代わりに `sum(Sign)` を使用します。何かの合計を計算する場合、`sum(Sign * x)` を使用し `HAVING sum(Sign) > 0` と組み合わせる代わりに `sum(x)` を使用します。次の [例](#example-of-use) も参照してください。

集約 `count`, `sum`, `avg` はこのように計算できます。オブジェクトに少なくとも1つの未コラプスの状態がある場合、集約 `uniq` は計算可能です。集約 `min` および `max` は計算できません。なぜなら、`CollapsingMergeTree` はコラプスされた状態の履歴を保存しないからです。

:::note
集約なしでデータを抽出する必要がある場合（例えば、最新の値が特定の条件に一致する行が存在するかを確認するため）、`FROM` 句に対して [`FINAL`](../../../sql-reference/statements/select/from.md#final-modifier) 修飾子を使用できます。これは、結果を返す前にデータをマージします。`CollapsingMergeTree` では、各キーの最新の状態行のみが返されます。
:::

## Examples {#examples}

### Example of use {#example-of-use}

以下のサンプルデータを考えます：

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

次に、いくつかのデータを挿入します：

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
```

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1),(4324182021466249494, 6, 185, 1)
```

私たちは2つの異なるデータパーツを作成するために2つの `INSERT` クエリを使用します。

:::note
データを単一のクエリで挿入すると、ClickHouseは1つのデータパートしか作成せず、マージを行いません。
:::

データを選択するには、次のようにします：

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

上記の戻されたデータを見て、コラプスが発生したかどうか確認しましょう...
2つの `INSERT` クエリで、2つのデータパーツを作成しました。 `SELECT` クエリは2スレッドで実行され、行の順序はランダムになりました。しかし、データパーツのマージはまだ行われていないため、コラプスは **発生しませんでした**。ClickHouseはデータパーツをバックグラウンドで未知の時点でマージしますが、それを予測することはできません。

したがって、集約が必要です。これを `[sum](/sql-reference/aggregate-functions/reference/sum)` 集約関数および `[HAVING](/sql-reference/statements/select/having)` 句で行います：

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

集約が必要ない場合やコラプスを強制したい場合は、`FROM` 句に対して `FINAL` 修飾子を使用することもできます。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```
:::note
この方法でデータを選択することは効率が低く、大量のスキャンデータ（百万行）の使用には推奨されません。
:::

### Example of another approach {#example-of-another-approach}

このアプローチの考え方は、マージがキーのフィールドのみを考慮することです。「キャンセル」行には、`Sign` カラムを使用せず、集計の際に前の行のバージョンを均等化する負の値を指定できます。

この例では、以下のサンプルデータを使用します：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │        -5 │     -146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

このアプローチでは、`PageViews` と `Duration` のデータ型を負の値を格納できるように変更する必要があります。そのため、テーブル `UAct` を作成する際にこれらのカラムの値を `UInt8` から `Int16` に変更します：

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

このアプローチをテストするために、テーブルにデータを挿入します。

例や小さなテーブルの場合は、これは受け入れられます：

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
