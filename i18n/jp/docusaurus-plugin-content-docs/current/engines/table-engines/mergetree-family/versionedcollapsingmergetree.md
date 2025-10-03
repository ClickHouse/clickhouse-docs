---
description: 'Allows for quick writing of object states that are continually changing,
  and deleting old object states in the background.'
sidebar_label: 'VersionedCollapsingMergeTree'
sidebar_position: 80
slug: '/engines/table-engines/mergetree-family/versionedcollapsingmergetree'
title: 'VersionedCollapsingMergeTree'
---




# VersionedCollapsingMergeTree

このエンジンは:

- 継続的に変化するオブジェクトの状態を迅速に記録できるようにします。
- 古いオブジェクトの状態をバックグラウンドで削除します。これにより、ストレージの使用量が大幅に削減されます。

詳細はセクション [Collapsing](#table_engines_versionedcollapsingmergetree) を参照してください。

このエンジンは [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) を継承し、データパーツのマージアルゴリズムに行を崩すためのロジックを追加します。`VersionedCollapsingMergeTree` は [CollapsingMergeTree](../../../engines/table-engines/mergetree-family/collapsingmergetree.md) と同じ目的を果たしますが、データを複数スレッドで任意の順序で挿入することを可能にする異なる崩壊アルゴリズムを使用します。特に、`Version` カラムは、行が間違った順序で挿入されても適切に行を崩すのに役立ちます。それに対して、`CollapsingMergeTree` は厳密に連続した挿入しか許可しません。

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

| パラメータ  | 説明                                                                                  | 型                                                                                                                                                                                                                                                                                   |
|-------------|---------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sign`      | 行のタイプを持つカラムの名前: `1` は「状態」行、 `-1` は「キャンセル」行です。           | [`Int8`](/sql-reference/data-types/int-uint)                                                                                                                                                                                                                                   |
| `version`   | オブジェクト状態のバージョンを持つカラムの名前。                                       | [`Int*`](/sql-reference/data-types/int-uint), [`UInt*`](/sql-reference/data-types/int-uint), [`Date`](/sql-reference/data-types/date), [`Date32`](/sql-reference/data-types/date32), [`DateTime`](/sql-reference/data-types/datetime) または [`DateTime64`](/sql-reference/data-types/datetime64) |

### クエリ句 {#query-clauses}

`VersionedCollapsingMergeTree` テーブルを作成する際には、`MergeTree` テーブルを作成する際と同じ [句](../../../engines/table-engines/mergetree-family/mergetree.md) が必要です。

<details markdown="1">

<summary>テーブルを作成するための非推奨メソッド</summary>

:::note
新しいプロジェクトではこの方法を使用しないでください。可能であれば、古いプロジェクトを上記の方法に切り替えてください。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] VersionedCollapsingMergeTree(date-column [, samp#table_engines_versionedcollapsingmergetreeling_expression], (primary, key), index_granularity, sign, version)
```

`sign` と `version` 以外のすべてのパラメータは、`MergeTree` と同じ意味を持ちます。

- `sign` — 行のタイプを持つカラムの名前: `1` は「状態」行、 `-1` は「キャンセル」行です。

    カラムデータ型 - `Int8`。

- `version` — オブジェクト状態のバージョンを持つカラムの名前。

    カラムデータ型は `UInt*` である必要があります。

</details>

## 崩壊 {#table_engines_versionedcollapsingmergetree}

### データ {#data}

あるオブジェクトの継続的に変化するデータを保存する必要がある状況を考えてみましょう。オブジェクトに対して一行を持ち、変更があるたびにその行を更新するのは合理的です。ただし、更新操作はデータストレージの書き換えが必要なため、DBMS には高コストで遅いです。データを迅速に書き込む必要がある場合、更新は受け入れられませんが、変更を次のようにオブジェクトに順次書き込むことができます。

行を書き込むときに `Sign` カラムを使用します。`Sign = 1` は行がオブジェクトの状態を表すことを意味します（これを「状態」行と呼びます）。`Sign = -1` は同じ属性を持つオブジェクトの状態のキャンセルを示します（これを「キャンセル」行と呼びます）。また、`Version` カラムを使用します。これはオブジェクトの各状態を別の番号で識別する必要があります。

例えば、我々はユーザーがあるサイトで訪れたページ数とその滞在時間を計算したいと思っています。ある時点で、ユーザーアクティビティの状態を示す次の行を書くことができます。

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

その後、ユーザーアクティビティの変更を登録し、次の2行で書き込みます。

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

最初の行はオブジェクト（ユーザー）の前の状態をキャンセルします。これはキャンセルされた状態のすべてのフィールドを `Sign` を除きコピーする必要があります。

2行目は現在の状態を含みます。

ユーザーアクティビティの最後の状態だけが必要なため、以下の行は

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

削除でき、オブジェクトの無効（古い）状態が崩壊します。`VersionedCollapsingMergeTree` は、データパーツをマージする際にこれを行います。

なぜ変更ごとに2行が必要なのかを理解するには、[アルゴリズム](#table_engines-versionedcollapsingmergetree-algorithm) を見てください。

**使用に関する注意事項**

1. データを記録するプログラムは、オブジェクトの状態をキャンセルできるように、その状態を記憶している必要があります。「キャンセル」文字列は、プライマリキーのフィールドと「状態」文字列のバージョンおよび逆の `Sign` を含むコピーを持つ必要があります。これにより初期ストレージサイズが増加しますが、データを書き込むのが迅速になります。
2. カラムに長大な配列が存在すると書き込み負荷によってエンジンの効率が低下します。データが単純であればあるほど、効率が向上します。
3. `SELECT` 結果はオブジェクトの変更履歴の一貫性に大きく依存します。挿入するデータを準備する際は正確に行ってください。不整合なデータによって得られる結果は予測不能であり、セッション深度などの非負メトリクスに対して負の値を得ることがあります。

### アルゴリズム {#table_engines-versionedcollapsingmergetree-algorithm}

ClickHouse がデータパーツをマージする場合、同じプライマリキーとバージョンを持ち、異なる `Sign` を持つ各ペアの行を削除します。行の順序は重要ではありません。

ClickHouse がデータを挿入する際、行はプライマリキーで並べ替えられます。`Version` カラムがプライマリキーに含まれていない場合、ClickHouse はそれを暗黙的に最後のフィールドとしてプライマリキーに追加し、それを使用して並べ替えます。

## データの選択 {#selecting-data}

ClickHouse は、同じプライマリキーを持つすべての行が同じ結果データパーツまたは同じ物理サーバーに存在することを保証しません。これはデータの書き込みおよびその後のデータパーツのマージの双方に当てはまります。さらに、ClickHouse は複数のスレッドで `SELECT` クエリを処理し、結果の行の順序を予測することはできません。したがって、`VersionedCollapsingMergeTree` テーブルから完全に「崩壊」したデータを得る必要がある場合には集計が必要です。

崩壊を最終化するには、`GROUP BY` 句と Sign を考慮する集計関数を持つクエリを書きます。例えば、数量を計算するには `count()` の代わりに `sum(Sign)` を使用します。何かの合計を計算するには、`sum(Sign * x)` を使用し、`HAVING sum(Sign) > 0` を追加します。

これにより、集計 `count`、`sum`、および `avg` をこの方法で計算できます。オブジェクトに少なくとも一つの未崩壊の状態がある場合、集計 `uniq` を計算できます。集計 `min` および `max` は計算できません。なぜなら、`VersionedCollapsingMergeTree` は崩壊した状態の値の履歴を保存しないからです。

集計なしで「崩壊」したデータを抽出したい場合（例えば、最新の値が特定の条件に一致する行が存在するかを確認するため）、`FROM` 句に `FINAL` 修飾子を使用できます。このアプローチは効率が悪く、大規模なテーブルでは使用すべきではありません。

## 使用例 {#example-of-use}

例のデータ:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

テーブルの作成:

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

データを挿入する:

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1, 1)
```

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1, 1),(4324182021466249494, 6, 185, 1, 2)
```

二つの異なるデータパーツを作成するために二つの `INSERT` クエリを使用します。データを単一のクエリで挿入すると、ClickHouse は一つのデータパーツを作成し、決してマージを実行しません。

データを取得する:

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

ここで何が見え、崩壊された部分はどこですか？
我々は二つの `INSERT` クエリを使用して二つのデータパーツを作成しました。`SELECT` クエリは二つのスレッドで実行され、結果は行のランダムな順序です。
崩壊はまだ行われていないため、データパーツはまだマージされていません。ClickHouse はデータパーツを未知のタイミングでマージしますが、それを予測することはできません。

これが集計が必要な理由です:

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

集計が不要で崩壊を強制したい場合、`FROM` 句に `FINAL` 修飾子を使用できます。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

これは非常に非効率的なデータ選択方法です。大きなテーブルに対しては使用しないでください。
