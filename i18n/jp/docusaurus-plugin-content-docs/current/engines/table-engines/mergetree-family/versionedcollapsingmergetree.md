---
description: 'オブジェクトの状態が継続的に変化し、古いオブジェクトの状態をバックグラウンドで削除することを迅速に可能にします。'
sidebar_label: 'VersionedCollapsingMergeTree'
sidebar_position: 80
slug: /engines/table-engines/mergetree-family/versionedcollapsingmergetree
title: 'VersionedCollapsingMergeTree'
---


# VersionedCollapsingMergeTree

このエンジンは:

- オブジェクトの状態が継続的に変化する場合に迅速な書き込みを可能にします。
- 古いオブジェクトの状態をバックグラウンドで削除します。これにより、ストレージのボリュームが大幅に削減されます。

詳細については、[Collapsing](#table_engines_versionedcollapsingmergetree) セクションを参照してください。

このエンジンは [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) から継承され、データパーツのマージアルゴリズムに行を統合するロジックを追加します。`VersionedCollapsingMergeTree` は [CollapsingMergeTree](../../../engines/table-engines/mergetree-family/collapsingmergetree.md) と同じ目的を果たしますが、異なる統合アルゴリズムを使用し、複数のスレッドで任意の順序でデータを挿入できるようにします。特に、`Version` カラムは、行が誤った順序で挿入された場合でも正しく行を統合するのに役立ちます。それに対して、`CollapsingMergeTree` は連続した挿入のみを許可します。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = VersionedCollapsingMergeTree(sign, version)
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

クエリパラメータの説明については、[クエリの説明](../../../sql-reference/statements/create/table.md) を参照してください。

### エンジンパラメータ {#engine-parameters}

```sql
VersionedCollapsingMergeTree(sign, version)
```

| パラメータ  | 説明                                                                 | タイプ                                                                                                                                                                                                                                                                                   |
|-----------|----------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sign`    | 行のタイプを持つカラムの名前: `1` は「状態」行、`-1` は「キャンセル」行です。  | [`Int8`](/sql-reference/data-types/int-uint)                                                                                                                                                                                                                                         |
| `version` | オブジェクト状態のバージョンを持つカラムの名前。                                  | [`Int*`](/sql-reference/data-types/int-uint)、[`UInt*`](/sql-reference/data-types/int-uint)、[`Date`](/sql-reference/data-types/date)、[`Date32`](/sql-reference/data-types/date32)、[`DateTime`](/sql-reference/data-types/datetime)  または [`DateTime64`](/sql-reference/data-types/datetime64) |

### クエリ句 {#query-clauses}

`VersionedCollapsingMergeTree` テーブルを作成する際には、`MergeTree` テーブルを作成する際と同様の [句](../../../engines/table-engines/mergetree-family/mergetree.md) が必要です。

<details markdown="1">

<summary>テーブル作成のための非推奨メソッド</summary>

:::note
新しいプロジェクトではこの方法を使用しないでください。可能であれば、古いプロジェクトを上記で説明した方法に切り替えてください。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] VersionedCollapsingMergeTree(date-column [, samp#table_engines_versionedcollapsingmergetreeling_expression], (primary, key), index_granularity, sign, version)
```

`sign` と `version` を除くすべてのパラメータは、`MergeTree` での意味と同じです。

- `sign` — 行のタイプを持つカラムの名前: `1` は「状態」行、`-1` は「キャンセル」行です。

    カラムデータタイプ — `Int8`。

- `version` — オブジェクト状態のバージョンを持つカラムの名前。

    カラムデータタイプは `UInt*` である必要があります。

</details>

## 統合 {#table_engines_versionedcollapsingmergetree}

### データ {#data}

あるオブジェクトの状態が継続的に変化するデータを保存する必要がある状況を考えてみましょう。オブジェクトごとに1行を持ち、変更があるたびにその行を更新するのが理にかなっています。しかし、更新操作は高価で遅く、DBMSにとってはストレージ内のデータを書き換える必要があるためです。データを迅速に書き込む必要がある場合、更新は受け入れられませんが、オブジェクトの変更を順次書き込むことができます。

行を書く時には `Sign` カラムを使用します。`Sign = 1` であれば、その行はオブジェクトの状態であることを意味します（これを「状態」行と呼びます）。`Sign = -1` は、同じ属性を持つオブジェクトの状態のキャンセルを示します（これを「キャンセル」行と呼びます）。また、各オブジェクトの状態を個別の番号で識別すべき `Version` カラムも使用します。

例えば、ユーザーがあるサイトで訪れたページ数とその時間を計算したいとします。ある時点で、以下のユーザー活動の状態を持つ行を書き込みます：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

後のある時点で、ユーザー活動の変化を登録し、次の2行で書き込みます。

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

最初の行はオブジェクト（ユーザー）の前の状態をキャンセルします。キャンセルされた状態のすべてのフィールドを、`Sign` を除いてコピーする必要があります。

2番目の行は現在の状態を含みます。

ユーザーの活動の最後の状態だけが必要なので、

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

は削除でき、無効（古い）状態のオブジェクトが統合されます。`VersionedCollapsingMergeTree` はデータパーツをマージする際にこれを行います。

なぜ各変更に対して2行が必要なのかは、[アルゴリズム](#table_engines-versionedcollapsingmergetree-algorithm) を参照してください。

**使用に関する注意**

1. データを書き込むプログラムは、オブジェクトの状態をキャンセルできるようにその状態を記憶しておく必要があります。「キャンセル」行は、プライマリーキーのフィールドと「状態」行のバージョンのコピー、反対の `Sign` を含む必要があります。これにより初期のストレージサイズが増加しますが、データを迅速に書き込むことができます。
2. カラム内の長い成長する配列は、書き込みの負荷のためにエンジンの効率を低下させます。データがシンプルであるほど、効率が向上します。
3. `SELECT` 結果はオブジェクトの変更履歴の整合性に強く依存します。データを挿入するために準備する際は正確に行ってください。不整合なデータに対しては予測できない結果を得ることがあり、セッションの深さのような非負のメトリクスに対して負の値が含まれることがあります。

### アルゴリズム {#table_engines-versionedcollapsingmergetree-algorithm}

ClickHouseがデータパーツをマージする際、同じ主キーとバージョンを持ち、異なる `Sign` を持つ行のペアを削除します。行の順序は重要ではありません。

ClickHouseがデータを挿入するとき、行は主キーによって整列されます。`Version` カラムが主キーに含まれていなければ、ClickHouseはそれを主キーに暗黙的に追加し、最後のフィールドとして整列に使用します。

## データの選択 {#selecting-data}

ClickHouseは、同じ主キーを持つすべての行が同じ結果のデータパーツにあることや、同じ物理サーバー上にあることを保証しません。これは、データの書き込みとその後のデータパーツのマージの両方に当てはまります。さらに、ClickHouseは複数のスレッドで `SELECT` クエリを処理し、結果における行の順序を予測できません。つまり、`VersionedCollapsingMergeTree` テーブルから完全に「統合された」データを取得する必要がある場合は、集約が必要です。

統合を完了するためのクエリは、`GROUP BY` 句と `Sign` を考慮した集約関数を使用して書きます。例えば、量を計算するには `count()` の代わりに `sum(Sign)` を使用します。何かの合計を計算するには、`sum(Sign * x)` を使用し、`HAVING sum(Sign) > 0` を追加します。

この方法で `count`、`sum`、および `avg` を計算できます。集約 `uniq` は、オブジェクトに少なくとも1つの未統合の状態がある場合に計算できます。集約 `min` および `max` は計算できません。なぜなら、`VersionedCollapsingMergeTree` は統合された状態の値の履歴を保存しないからです。

集約なしで「統合」されたデータを抽出する必要がある場合（例えば、最新の値が特定の条件と一致する行が存在するかどうかを確認するため）、`FROM` 句に対して `FINAL` 修飾子を使用できます。このアプローチは非効率的であり、大きなテーブルでは使用すべきではありません。

## 使用例 {#example-of-use}

例データ：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

テーブルの作成：

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews UInt8,
    Duration UInt8,
    Sign Int8,
    Version UInt8
)
ENGINE = VersionedCollapsingMergeTree(Sign, Version)
ORDER BY UserID
```

データの挿入：

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1, 1)
```

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1, 1),(4324182021466249494, 6, 185, 1, 2)
```

2つの異なるデータパーツを作成するために2つの `INSERT` クエリを使用します。データを1つのクエリで挿入すると、ClickHouseは1つのデータパートを作成し、マージを行うことはありません。

データの取得：

```sql
SELECT * FROM UAct
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 │
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

ここで何が見え、どこに統合された部分があるのでしょうか？
2つの `INSERT` クエリを使用して2つのデータパーツを作成しました。`SELECT` クエリは2つのスレッドで処理され、その結果は行のランダムな順序です。
データパーツがまだマージされていないため、統合は行われません。ClickHouseは、予測できないタイミングでデータパーツをマージします。

これが集約が必要な理由です：

```sql
SELECT
    UserID,
    sum(PageViews * Sign) AS PageViews,
    sum(Duration * Sign) AS Duration,
    Version
FROM UAct
GROUP BY UserID, Version
HAVING sum(Sign) > 0
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │       2 │
└─────────────────────┴───────────┴──────────┴─────────┘
```

集約が不要で、統合を強制したい場合は、`FROM` 句に対して `FINAL` 修飾子を使用できます。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

これはデータを選択する非常に非効率的な方法です。大規模なテーブルには使用しないでください。
