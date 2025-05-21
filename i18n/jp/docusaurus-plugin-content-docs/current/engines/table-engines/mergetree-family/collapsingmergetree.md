description: 'MergeTreeから継承され、マージプロセス中に行を圧縮するためのロジックを追加します。'
keywords: ['updates', 'collapsing']
sidebar_label: 'CollapsingMergeTree'
sidebar_position: 70
slug: /engines/table-engines/mergetree-family/collapsingmergetree
title: 'CollapsingMergeTree'
```


# CollapsingMergeTree

## Description {#description}

`CollapsingMergeTree`エンジンは、[MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)から継承され、マージプロセス中に行を圧縮するためのロジックを追加します。`CollapsingMergeTree`テーブルエンジンは、ソートキー（`ORDER BY`）のすべてのフィールドが特殊なフィールド `Sign` を除いて同じである場合に、行のペアを非同期で削除（圧縮）します。`Sign`には `1` または `-1` の値を持つことができます。対になっていない `Sign` の値を持つ行は保持されます。

詳細については、ドキュメントの[Collapsing](#table_engine-collapsingmergetree-collapsing)セクションを参照してください。

:::note
このエンジンはストレージのボリュームを大幅に削減し、結果として`SELECT`クエリの効率を向上させることができます。
:::

## Parameters {#parameters}

このテーブルエンジンのすべてのパラメータは、`Sign`パラメータを除いて、[`MergeTree`](/engines/table-engines/mergetree-family/mergetree)と同じ意味を持ちます。

- `Sign` — `1` が「状態」行、`-1` が「キャンセル」行のタイプのカラムに付けられる名前。タイプ: [Int8](/sql-reference/data-types/int-uint)。

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
以下の方法は新しいプロジェクトでの使用は推奨されません。 
古いプロジェクトがある場合、新しい方法に更新することをお勧めします。
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

`Sign` — `1` が「状態」行、`-1` が「キャンセル」行のタイプのカラムに付けられる名前。 [Int8](/sql-reference/data-types/int-uint)。

</details>

- クエリパラメータの説明については、[クエリ説明](../../../sql-reference/statements/create/table.md)を参照してください。
- `CollapsingMergeTree`テーブルを作成する際には、`MergeTree`テーブルを作成する場合と同様に、同じ[クエリ句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)が必要です。

## Collapsing {#table_engine-collapsingmergetree-collapsing}

### Data {#data}

特定のオブジェクトのために継続的に変化するデータを保存する必要がある状況を考えてみましょう。 オブジェクトごとに1行を持ち、何かが変更されるたびにその行を更新するのが理にかなっているように思えますが、更新操作はコストがかかり、DBMSにとっては遅くなります。 ストレージ内のデータを書き換える必要があるため、迅速にデータを書き込む必要がある場合、アップデートを大量に行うのは受け入れられませんが、オブジェクトの変更を逐次的に書き込むことはできます。 これを行うために、特別なカラム`Sign`を利用します。

- `Sign` = `1` の場合、その行は「状態行」であり、_現在の有効な状態を表すフィールドを含む行_ を示します。
- `Sign` = `-1` の場合、その行は「キャンセル行」であり、_同じ属性を持つオブジェクトの状態をキャンセルするために使用される行_ を示します。

例えば、ユーザーがあるウェブサイトで確認したページ数と、訪問した時間を計算したいとします。 特定の時点で、ユーザーの活動状態を次の行として書き込みます。

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

後の時点で、ユーザーの活動の変化を記録し、次の2行を書き込みます。

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

最初の行はオブジェクトの以前の状態をキャンセルしています（この場合はユーザーを表しています）。 「キャンセル」行のすべてのソートキーのフィールドを除いてコピーする必要があります。 上記の2行目は現在の状態を含んでいます。

ユーザー活動の最新の状態だけが必要なため、元の「状態」行と挿入した「キャンセル」行は、次のように削除できます。 無効（古い）なオブジェクトの状態を圧縮します。

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │ -- 古い「状態」行は削除できます
│ 4324182021466249494 │         5 │      146 │   -1 │ -- 「キャンセル」行は削除できます
│ 4324182021466249494 │         6 │      185 │    1 │ -- 新しい「状態」行は残ります
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree`は、データパーツのマージ中に正確にこの_圧縮_動作を実行します。

:::note
各変更のために2行が必要な理由については、[Algorithm](#table_engine-collapsingmergetree-collapsing-algorithm)のセクションでさらに説明します。
:::

**このアプローチの特異性**

1. データを書き込むプログラムは、キャンセルできるようにオブジェクトの状態を記憶する必要があります。 「キャンセル」行は「状態」のソートキーのフィールドのコピーを含み、かつ逆の`Sign`を持つ必要があります。 これにより、ストレージの初期サイズは増加しますが、データを迅速に書き込むことが可能になります。
2. カラムに長い成長配列があると、書き込みの負荷が増加するためエンジンの効率が低下します。 データがシンプルであればあるほど、効率は高くなります。
3. `SELECT`の結果はオブジェクトの変更履歴の一貫性に大きく依存します。 挿入用のデータを準備する際は正確でなければなりません。 一貫性のないデータを持つと予測不可能な結果が得られる可能性があります。 例えば、セッションの深さなどの非負メトリックに対して負の値が得られます。

### Algorithm {#table_engine-collapsingmergetree-collapsing-algorithm}

ClickHouseがデータの[parts](/concepts/glossary#parts)をマージするとき、それぞれの同じソートキー（`ORDER BY`）を持つ連続した行のグループが、最大で2行までに縮小されます。つまり、「状態」行が `Sign` = `1` であり、「キャンセル」行が `Sign` = `-1` です。 言い換えれば、ClickHouseではエントリが圧縮されます。

ClickHouseは、それぞれの結果のデータパートを保存します：

|  |                                                                                                                                     |
|--|-------------------------------------------------------------------------------------------------------------------------------------|
|1.| 「キャンセル」と「状態」の行の数が一致し、最後の行が「状態」行である場合、最初の「キャンセル」行と最後の「状態」行を保存します。 |
|2.| 「状態」行が「キャンセル」行よりも多い場合は、最後の「状態」行を保存します。                                                            |
|3.| 「キャンセル」行が「状態」行よりも多い場合は、最初の「キャンセル」行を保存します。                                                          |
|4.| その他の場合は、行を保存しません。                                                                                               |

加えて、「状態」行が「キャンセル」行より少なくとも2行多い場合、または「キャンセル」行が「状態」行より少なくとも2行多い場合、マージは続きます。 ただし、ClickHouseはこの状況を論理的なエラーとして扱い、サーバーログに記録します。 このエラーは、同じデータが複数回挿入された場合に発生する可能性があります。 したがって、圧縮は統計を計算する結果を変更するべきではありません。 変更は徐々に圧縮され、最終的にほぼすべてのオブジェクトの最新の状態だけが残るようになります。

`Sign`カラムは、マージアルゴリズムが同じソートキーを持つすべての行が同じ結果のデータパートに含まれることを保証しないため、必須です。 ClickHouseは、複数のスレッドを使って`SELECT`クエリを処理し、結果の行の順序を予測することはできません。

完全に「圧縮された」データを`CollapsingMergeTree`テーブルから取得する必要がある場合は、集約が必要です。 圧縮を完了するには、`GROUP BY`句と`Sign`を考慮した集約関数を含むクエリを書く必要があります。 例えば、数量を計算する場合は、`count()`の代わりに`sum(Sign)`を使用します。 何かの合計を計算するには、`sum(Sign * x)`を使用し、加えて`HAVING sum(Sign) > 0`を使用します。以下の[例](#example-of-use)に示すように。

集約関数`count`、`sum`、`avg`はこの方法で計算できます。 オブジェクトに少なくとも1つの圧縮されていない状態がある場合、集約`uniq`は計算可能です。 集約`min`と`max`は計算できず、`CollapsingMergeTree`は圧縮された状態の履歴を保存しないためです。

:::note
集約なしでデータを抽出する必要がある場合（例えば、新しい値が特定の条件に一致する行が存在するかどうかを確認するために）、`FROM`句のために[`FINAL`](../../../sql-reference/statements/select/from.md#final-modifier)修飾子を使用できます。 これにより、結果を返す前にデータがマージされます。 `CollapsingMergeTree`の場合、各キーに対して最新の状態行のみが返されます。
:::

## Examples {#examples}

### Example of Use {#example-of-use}

以下の例データを考えます：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree`を使用してテーブル`UAct`を作成します：

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

2つの`INSERT`クエリを使用して、2つの異なるデータパーツを作成します。

:::note
データを単一のクエリで挿入すると、ClickHouseは1つのデータパートのみを作成し、決してマージは行われません。
:::

データを次のように選択できます：

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

上記の返されたデータを見て、圧縮が行われたかどうかを確認します… 2つの`INSERT`クエリで2つのデータパーツを作成しました。 `SELECT`クエリは2つのスレッドで実行され、ランダムな行の順序を得ました。 しかし、圧縮は **行われませんでした** なぜなら、まだデータパーツのマージが行われていないからです。 ClickHouseは、予測できないタイミングでバックグラウンドでデータパーツをマージします。

したがって、集約が必要です。これは次のように`sum`を使用して集約関数と[`HAVING`](/sql-reference/statements/select/having)句を使って行います：

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

集約が不要で、圧縮を強制したい場合は、`FINAL`修飾子を`FROM`句に使用することもできます。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```
:::note
この方法でデータを選択するのは非効率であり、大量のスキャンデータ（数百万行）にはお勧めしません。
:::

### Example of Another Approach {#example-of-another-approach}

このアプローチのアイデアは、マージがキーのフィールドのみを考慮することです。 「キャンセル」行では、`Sign`カラムを使用せずに、行を合計するときに前のバージョンと等しくなる負の値を指定できます。

この例のために、以下のサンプルデータを使用します：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │        -5 │     -146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

このアプローチでは、負の値を保存するために`PageViews`と`Duration`のデータ型を変更する必要があります。 したがって、テーブル`UAct`を作成する際にこれらのカラムの値を`UInt8`から`Int16`に変更します：

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

テーブルにデータを挿入することでアプローチをテストします。

例または小規模なテーブルの場合、これは許容されます：

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
