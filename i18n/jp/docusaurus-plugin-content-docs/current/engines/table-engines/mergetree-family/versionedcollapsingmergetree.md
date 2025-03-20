---
slug: /engines/table-engines/mergetree-family/versionedcollapsingmergetree
sidebar_position: 80
sidebar_label:  VersionedCollapsingMergeTree
title: "VersionedCollapsingMergeTree"
description: "オブジェクトの状態が継続的に変化する場合の素早い書き込みを可能にし、古いオブジェクトの状態をバックグラウンドで削除します。"
---


# VersionedCollapsingMergeTree

このエンジンは次のことを行います：

- オブジェクトの状態が継続的に変化する場合の素早い書き込みを許可します。
- 古いオブジェクトの状態をバックグラウンドで削除します。これによりストレージのボリュームが大幅に削減されます。

詳細については、[Collapsing](#table_engines_versionedcollapsingmergetree)セクションを参照してください。

このエンジンは[MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)から継承され、データパーツをマージするアルゴリズムに行の崩壊に関するロジックを追加します。 `VersionedCollapsingMergeTree`は[CollapsingMergeTree](../../../engines/table-engines/mergetree-family/collapsingmergetree.md)と同様の目的を果たしますが、データを複数のスレッドで任意の順序で挿入できる異なる崩壊アルゴリズムを使用します。特に、`Version`カラムは、行が不適切な順序で挿入された場合でも、行を正しく崩壊させるのに役立ちます。一方、`CollapsingMergeTree`は厳密に連続した挿入のみを許可します。

## テーブルの作成 {#creating-a-table}

``` sql
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

クエリパラメータの説明については、[クエリの説明](../../../sql-reference/statements/create/table.md)を参照してください。

### エンジンパラメータ {#engine-parameters}

``` sql
VersionedCollapsingMergeTree(sign, version)
```

| パラメータ  | 説明                                                                                       | タイプ                                                                                                                                                                                                                                                                                    |
|--------------|--------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sign`    | 行のタイプを示すカラムの名前: `1` は "状態" 行、`-1` は "キャンセル" 行です。                     | [`Int8`](/sql-reference/data-types/int-uint)                                                                                                                                                                                                                                    |
| `version` | オブジェクトの状態のバージョンを示すカラムの名前。                                           | [`Int*`](/sql-reference/data-types/int-uint), [`UInt*`](/sql-reference/data-types/int-uint), [`Date`](/sql-reference/data-types/date), [`Date32`](/sql-reference/data-types/date32), [`DateTime`](/sql-reference/data-types/datetime) または [`DateTime64`](/sql-reference/data-types/datetime64) |

### クエリ句 {#query-clauses}

`VersionedCollapsingMergeTree`テーブルを作成する際には、`MergeTree`テーブルを作成する際と同じ[句](../../../engines/table-engines/mergetree-family/mergetree.md)が必要です。

<details markdown="1">

<summary>テーブルを作成するための非推奨メソッド</summary>

:::note
このメソッドは新しいプロジェクトでは使用しないでください。可能であれば、古いプロジェクトを上記で説明した方法に切り替えてください。
:::

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] VersionedCollapsingMergeTree(date-column [, samp#table_engines_versionedcollapsingmergetreeling_expression], (primary, key), index_granularity, sign, version)
```

`sign` と `version` を除くすべてのパラメータは `MergeTree` と同じ意味を持ちます。

- `sign` — 行のタイプを示すカラムの名前: `1` は "状態" 行、`-1` は "キャンセル" 行です。

    カラムデータタイプ — `Int8`。

- `version` — オブジェクトの状態のバージョンを示すカラムの名前。

    カラムデータタイプは `UInt*` でなければなりません。

</details>

## 崩壊 {#table_engines_versionedcollapsingmergetree}

### データ {#data}

オブジェクトのために継続的に変化するデータを保存する必要がある状況を考えてみてください。1つの行をオブジェクトのために持ち、変更があるたびにその行を更新するのが合理的です。しかし、更新操作はストレージ内のデータを再書き込みする必要があるため、DBMSにとっては高コストで遅いです。データをすばやく書き込む必要がある場合、更新は受け入れられませんが、以下のようにオブジェクトへの変更を順次書き込むことができます。

行を書き込む際に`Sign`カラムを使用します。`Sign = 1`の場合、その行はオブジェクトの状態を示します（これを "状態" 行と呼びます）。`Sign = -1`の場合、それは同じ属性を持つオブジェクトの状態のキャンセルを示します（これを "キャンセル" 行と呼びます）。また、オブジェクトの状態のそれぞれを別の番号で識別する必要がある`Version`カラムも使用してください。

例えば、我々はユーザーがあるサイトで訪れたページ数とその滞在時間を計算したいとします。ある時点で、ユーザーのアクティビティの状態を次の行で書き込みます。

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

少し後、ユーザーアクティビティの変更を登録し、次の2行で書き込みます。

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

最初の行はオブジェクト（ユーザー）の以前の状態をキャンセルします。キャンセルされた状態のすべてのフィールドを`Sign`以外はコピーする必要があります。

2行目は現在の状態を含みます。

ユーザーアクティビティの最終状態のみが必要なため、行

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

は削除されることができ、オブジェクトの無効（古い）状態を崩壊します。`VersionedCollapsingMergeTree`はデータパーツをマージする際にこれを行います。

なぜ各変更に2行が必要なのかを知るには、[アルゴリズム](#table_engines-versionedcollapsingmergetree-algorithm)を参照してください。

**使用上の注意**

1. データを書き込むプログラムは、キャンセルできるようにオブジェクトの状態を記憶しておく必要があります。「キャンセル」行は、プライマリーキーのフィールドと「状態」行のバージョン、そして逆の`Sign`のコピーを含む必要があります。これにより初期ストレージサイズは増えますが、データを迅速に書き込むことが可能になります。
2. カラム内の長い増加する配列は書き込みの負荷によりエンジンの効率を低下させます。データがシンプルであればあるほど効率が良くなります。
3. `SELECT`の結果はオブジェクトの変更の履歴の一貫性に強く依存します。挿入のためのデータ準備には正確である必要があります。不整合なデータでは、セッションの深さなどの非負メトリックに対して負の値など、予測不可能な結果を得ることがあります。

### アルゴリズム {#table_engines-versionedcollapsingmergetree-algorithm}

ClickHouseがデータパーツをマージするとき、同じプライマリキーとバージョンを持つ行のペアを削除し、異なる`Sign`を持つものです。行の順序は問題ではありません。

ClickHouseがデータを挿入するとき、行はプライマリキーによって順序付けられます。`Version`カラムがプライマリキーにない場合、ClickHouseは最後のフィールドとして暗黙的にそれをプライマリキーに追加し、順序付けのために使用します。

## データの選択 {#selecting-data}

ClickHouseは、同じプライマリキーを持つすべての行が同じ結果データパーツに含まれることや、同じ物理サーバー上に存在することを保証しません。これはデータの書き込みやその後のデータパーツのマージにも当てはまります。また、ClickHouseは`SELECT`クエリを複数のスレッドで処理するため、結果の行の順序を予測することはできません。これは、`VersionedCollapsingMergeTree`テーブルから完全に「崩壊」したデータを取得する必要がある場合は集約が必要であることを意味します。

崩壊を最終化するためには、`GROUP BY`句と`Sign`を考慮した集約関数を使用したクエリを書きます。例えば、数量を計算する際には`count()`の代わりに`sum(Sign)`を使用します。何かの合計を計算する際には`sum(Sign * x)`を使用し、`HAVING sum(Sign) > 0`を追加します。

集約関数`count`、`sum`、および`avg`はこの方法で計算できます。集約関数`uniq`は、オブジェクトに少なくとも1つの非崩壊状態がある場合に計算できます。集約関数`min`と`max`は、`VersionedCollapsingMergeTree`が崩壊状態の値の履歴を保存しないため、計算できません。

「崩壊」を伴わないが集約を必要としないデータを抽出する必要がある場合（例えば、最新の値が特定の条件に一致する行が存在するかどうかを確認するため）、`FROM`句のための`FINAL`修飾子を使用できます。このアプローチは非効率的で、大規模なテーブルには使用すべきではありません。

## 使用例 {#example-of-use}

サンプルデータ：

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

テーブルの作成：

``` sql
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

``` sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1, 1)
```

``` sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1, 1),(4324182021466249494, 6, 185, 1, 2)
```

異なるデータパーツを作成するために2つの`INSERT`クエリを使用します。データを単一のクエリで挿入した場合、ClickHouseは1つのデータパーツを作成し、決してマージを実行しません。

データの取得：

``` sql
SELECT * FROM UAct
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 │
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

ここで何がわかりますか、そして崩壊した部分はどこにありますか？
2つの`INSERT`クエリを使用して2つのデータパーツを作成しました。`SELECT`クエリは2つのスレッドで実行され、行はランダムな順序で結果が得られました。
データパーツがまだマージされていないため、崩壊は発生しませんでした。ClickHouseは未知のタイミングでデータパーツをマージし、その時期を予測することはできません。

これが得られる集約の必要性です：

``` sql
SELECT
    UserID,
    sum(PageViews * Sign) AS PageViews,
    sum(Duration * Sign) AS Duration,
    Version
FROM UAct
GROUP BY UserID, Version
HAVING sum(Sign) > 0
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │       2 │
└─────────────────────┴───────────┴──────────┴─────────┘
```

集約が必要ない場合に崩壊を強制したい場合は、`FROM`句のための`FINAL`修飾子を使用できます。

``` sql
SELECT * FROM UAct FINAL
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

これは非常に非効率的なデータ選択方法です。大規模なテーブルには使用しないでください。
