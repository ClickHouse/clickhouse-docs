---
description: '絶えず変化するオブジェクトの状態を高速に書き込み、古いオブジェクトの状態をバックグラウンドで削除できるようにします。'
sidebar_label: 'VersionedCollapsingMergeTree'
sidebar_position: 80
slug: /engines/table-engines/mergetree-family/versionedcollapsingmergetree
title: 'VersionedCollapsingMergeTree テーブルエンジン'
doc_type: 'reference'
---



# VersionedCollapsingMergeTree テーブルエンジン

このエンジンは次のことを行います。

- 継続的に変化するオブジェクトの状態を高速に書き込むことができます。
- 古いオブジェクトの状態をバックグラウンドで削除します。これによりストレージ使用量を大幅に削減できます。

詳細については [Collapsing](#table_engines_versionedcollapsingmergetree) のセクションを参照してください。

このエンジンは [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) を継承し、データパートのマージアルゴリズムに行を折りたたむためのロジックを追加します。`VersionedCollapsingMergeTree` は [CollapsingMergeTree](../../../engines/table-engines/mergetree-family/collapsingmergetree.md) と同じ目的で使用されますが、異なる折りたたみアルゴリズムを採用しており、マルチスレッドでどのような順序でもデータを挿入できます。特に、`Version` 列は、たとえ誤った順序で挿入された場合でも、行を正しく折りたたむことに役立ちます。対照的に、`CollapsingMergeTree` では、厳密に連続した順序での挿入しか許可されません。



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

クエリパラメータの説明については、[クエリの説明](../../../sql-reference/statements/create/table.md)を参照してください。

### エンジンパラメータ {#engine-parameters}

```sql
VersionedCollapsingMergeTree(sign, version)
```

| パラメータ | 説明                                                                            | 型                                                                                                                                                                                                                                                                                          |
| --------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sign`    | 行のタイプを持つカラムの名前：`1`は「状態」行、`-1`は「キャンセル」行 | [`Int8`](/sql-reference/data-types/int-uint)                                                                                                                                                                                                                                                  |
| `version` | オブジェクト状態のバージョンを持つカラムの名前                               | [`Int*`](/sql-reference/data-types/int-uint)、[`UInt*`](/sql-reference/data-types/int-uint)、[`Date`](/sql-reference/data-types/date)、[`Date32`](/sql-reference/data-types/date32)、[`DateTime`](/sql-reference/data-types/datetime)、または[`DateTime64`](/sql-reference/data-types/datetime64) |

### クエリ句 {#query-clauses}

`VersionedCollapsingMergeTree`テーブルを作成する際は、`MergeTree`テーブルを作成する場合と同じ[句](../../../engines/table-engines/mergetree-family/mergetree.md)が必要です。

<details markdown="1">

<summary>非推奨のテーブル作成方法</summary>

:::note
新しいプロジェクトではこの方法を使用しないでください。可能であれば、既存のプロジェクトを上記で説明した方法に切り替えてください。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] VersionedCollapsingMergeTree(date-column [, samp#table_engines_versionedcollapsingmergetreeling_expression], (primary, key), index_granularity, sign, version)
```

`sign`と`version`を除くすべてのパラメータは、`MergeTree`と同じ意味を持ちます。

- `sign` — 行のタイプを持つカラムの名前：`1`は「状態」行、`-1`は「キャンセル」行

  カラムのデータ型 — `Int8`

- `version` — オブジェクト状態のバージョンを持つカラムの名前

  カラムのデータ型は`UInt*`である必要があります。

</details>


## 折りたたみ {#table_engines_versionedcollapsingmergetree}

### データ {#data}

あるオブジェクトに対して継続的に変化するデータを保存する必要がある状況を考えてみましょう。オブジェクトごとに1行を持ち、変更があるたびにその行を更新することは合理的です。しかし、更新操作はストレージ内のデータの書き換えを必要とするため、DBMSにとってコストが高く低速です。データを迅速に書き込む必要がある場合、更新は適切ではありませんが、次のようにオブジェクトへの変更を順次書き込むことができます。

行を書き込む際に`Sign`カラムを使用します。`Sign = 1`の場合、その行はオブジェクトの状態を表します(これを「状態」行と呼びます)。`Sign = -1`の場合、同じ属性を持つオブジェクトの状態のキャンセルを示します(これを「キャンセル」行と呼びます)。また、`Version`カラムを使用し、オブジェクトの各状態を個別の番号で識別します。

例えば、あるサイトでユーザーが何ページ訪問し、どのくらいの時間滞在したかを計算したいとします。ある時点で、ユーザーアクティビティの状態を持つ次の行を書き込みます:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

その後のある時点で、ユーザーアクティビティの変更を登録し、次の2行で書き込みます。

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

最初の行は、オブジェクト(ユーザー)の以前の状態をキャンセルします。`Sign`を除く、キャンセルされた状態のすべてのフィールドをコピーする必要があります。

2行目には現在の状態が含まれます。

ユーザーアクティビティの最後の状態のみが必要なため、次の行は

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

削除でき、オブジェクトの無効な(古い)状態を折りたたみます。`VersionedCollapsingMergeTree`は、データパーツをマージする際にこれを実行します。

各変更に2行が必要な理由については、[アルゴリズム](#table_engines-versionedcollapsingmergetree-algorithm)を参照してください。

**使用上の注意**

1.  データを書き込むプログラムは、オブジェクトの状態をキャンセルできるように記憶しておく必要があります。「キャンセル」行には、主キーフィールドのコピーと「状態」行のバージョン、および反対の`Sign`を含める必要があります。これによりストレージの初期サイズは増加しますが、データを迅速に書き込むことができます。
2.  カラム内の長く成長する配列は、書き込みの負荷によりエンジンの効率を低下させます。データが単純であるほど、効率は向上します。
3.  `SELECT`の結果は、オブジェクト変更履歴の一貫性に大きく依存します。挿入用のデータを準備する際は正確に行ってください。セッション深度のような非負のメトリクスに対する負の値など、一貫性のないデータでは予測不可能な結果が得られる可能性があります。

### アルゴリズム {#table_engines-versionedcollapsingmergetree-algorithm}

ClickHouseがデータパーツをマージする際、同じ主キーとバージョンを持ち、異なる`Sign`を持つ各行のペアを削除します。行の順序は関係ありません。

ClickHouseがデータを挿入する際、主キーによって行を並べ替えます。`Version`カラムが主キーに含まれていない場合、ClickHouseは最後のフィールドとして暗黙的に主キーに追加し、並べ替えに使用します。


## データの選択 {#selecting-data}

ClickHouseは、同じプライマリキーを持つすべての行が同じ結果データパートに存在すること、あるいは同じ物理サーバー上に存在することを保証しません。これは、データの書き込み時とその後のデータパートのマージ時の両方に当てはまります。さらに、ClickHouseは`SELECT`クエリを複数のスレッドで処理するため、結果における行の順序を予測することはできません。これは、`VersionedCollapsingMergeTree`テーブルから完全に「折りたたまれた」データを取得する必要がある場合、集約が必要であることを意味します。

折りたたみを完了するには、`GROUP BY`句と符号を考慮した集約関数を使用してクエリを記述します。たとえば、数量を計算するには、`count()`の代わりに`sum(Sign)`を使用します。何かの合計を計算するには、`sum(x)`の代わりに`sum(Sign * x)`を使用し、`HAVING sum(Sign) > 0`を追加します。

集約関数`count`、`sum`、`avg`はこの方法で計算できます。集約関数`uniq`は、オブジェクトが少なくとも1つの折りたたまれていない状態を持つ場合に計算できます。集約関数`min`と`max`は計算できません。これは、`VersionedCollapsingMergeTree`が折りたたまれた状態の値の履歴を保存しないためです。

集約なしで「折りたたみ」を伴うデータを抽出する必要がある場合(たとえば、最新の値が特定の条件に一致する行が存在するかどうかを確認する場合)、`FROM`句に`FINAL`修飾子を使用できます。このアプローチは非効率的であり、大規模なテーブルでは使用すべきではありません。


## 使用例 {#example-of-use}

サンプルデータ:

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

データの挿入:

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1, 1)
```

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1, 1),(4324182021466249494, 6, 185, 1, 2)
```

2つの異なるデータパートを作成するために、2つの`INSERT`クエリを使用します。単一のクエリでデータを挿入した場合、ClickHouseは1つのデータパートを作成し、マージを一切実行しません。

データの取得:

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

ここで何が表示され、折りたたまれたパートはどこにあるのでしょうか?
2つの`INSERT`クエリを使用して2つのデータパートを作成しました。`SELECT`クエリは2つのスレッドで実行され、結果として行の順序はランダムになります。
データパートがまだマージされていないため、折りたたみは発生していません。ClickHouseは予測不可能な任意の時点でデータパートをマージします。

このため、集計が必要になります:

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

集計が不要で折りたたみを強制したい場合は、`FROM`句に`FINAL`修飾子を使用できます。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

これはデータを選択する非常に非効率的な方法です。大規模なテーブルには使用しないでください。
