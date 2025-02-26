---
slug: /engines/table-engines/mergetree-family/versionedcollapsingmergetree
sidebar_position: 80
sidebar_label:  VersionedCollapsingMergeTree
title: "VersionedCollapsingMergeTree"
description: "継続的に変化するオブジェクトの状態を迅速に書き込み、古いオブジェクトの状態をバックグラウンドで削除することを可能にします。"
---

# VersionedCollapsingMergeTree

このエンジンは：

- 継続的に変化するオブジェクトの状態を迅速に書き込むことを可能にします。
- 古いオブジェクトの状態をバックグラウンドで削除します。これにより、ストレージのサイズが大幅に減少します。

詳細については、セクション[Collapsing](#table_engines_versionedcollapsingmergetree)を参照してください。

このエンジンは[MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engines-mergetree)を継承し、データパーツをマージするアルゴリズムに行を折りたたむロジックを追加します。`VersionedCollapsingMergeTree`は[CollapsingMergeTree](../../../engines/table-engines/mergetree-family/collapsingmergetree.md)と同様の目的を持っていますが、異なる折りたたみアルゴリズムを使用しており、データを複数のスレッドで任意の順序で挿入することを可能にしています。特に、`Version`カラムは、行が間違った順序で挿入されても正しく折りたたむのに役立ちます。一方、`CollapsingMergeTree`は厳密に連続した挿入しか許可していません。

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

| パラメータ  | 説明                                                                 | 型                                                                                                                                                                                                                       |
|-------------|----------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sign`      | 行のタイプを示すカラムの名前：`1`は「状態」行、`-1`は「キャンセル」行です。 | [`Int8`](/sql-reference/data-types/int-uint)                                                                                                                                                                     |
| `version`   | オブジェクト状態のバージョンを示すカラムの名前。                                 | [`Int*`](/sql-reference/data-types/int-uint)、[`UInt*`](/sql-reference/data-types/int-uint)、[`Date`](/sql-reference/data-types/date)、[`Date32`](/sql-reference/data-types/date32)、[`DateTime`](/sql-reference/data-types/datetime) もしくは[`DateTime64`](/sql-reference/data-types/datetime64)  |

### クエリ句 {#query-clauses}

`VersionedCollapsingMergeTree`テーブルを作成する際には、`MergeTree`テーブルを作成する際に必要な同じ[句](../../../engines/table-engines/mergetree-family/mergetree.md)が必要です。

<details markdown="1">

<summary>非推奨のテーブル作成方法</summary>

:::note
この方法は新しいプロジェクトで使用しないでください。可能であれば、古いプロジェクトを上記の方法に切り替えてください。
:::

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] VersionedCollapsingMergeTree(date-column [, samp#table_engines_versionedcollapsingmergetreeling_expression], (primary, key), index_granularity, sign, version)
```

`sign`と`version`を除く全てのパラメータは`MergeTree`と同じ意味があります。

- `sign` — 行のタイプを示すカラムの名前：`1`は「状態」行、`-1`は「キャンセル」行です。

    カラムデータ型 — `Int8`。

- `version` — オブジェクト状態のバージョンを示すカラムの名前。

    カラムデータ型は`UInt*`である必要があります。

</details>

## Collapsing {#table_engines_versionedcollapsingmergetree}

### データ {#data}

あるオブジェクトの継続的に変化するデータを保存する必要がある状況を考えてみましょう。オブジェクトごとに1行を持ち、変化があるたびにその行を更新するのが理にかなっています。しかし、更新操作はDBMSにとって高コストで遅く、データをストレージに再書き込みする必要があるため、迅速にデータを書き込む必要がある場合は更新は受け入れられません。しかし、次のようにオブジェクトへの変更を順次書き込むことはできます。

行を書き込む際には`Sign`カラムを使用します。`Sign = 1`は行がオブジェクトの状態であることを意味します（これを「状態」行と呼びましょう）。`Sign = -1`は同じ属性を持つオブジェクトの状態のキャンセルを示します（これを「キャンセル」行と呼びましょう）。また、各オブジェクトの状態を個別の番号で識別する`Version`カラムも使用します。

例えば、私たちはユーザーがあるサイトで訪れたページ数と滞在時間を計算したいと考えています。ある時点で、ユーザーのアクティビティの状態を以下の行で書き込みます。

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

その後、ユーザーアクティビティの変化を記録し、以下の二つの行で書き込みます。

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

最初の行はオブジェクト（ユーザー）の前の状態をキャンセルします。それはキャンセルされた状態のすべてのフィールドを`Sign`を除いてコピーする必要があります。

二番目の行には現在の状態が含まれます。

ユーザーアクティビティの最後の状態のみが必要なため、次の行は

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

削除でき、オブジェクトの無効（古い）状態を折りたたむことができます。`VersionedCollapsingMergeTree`はデータパーツをマージする際にこれを行います。

なぜ各変更に対して二行が必要なのかを理解するために、[アルゴリズム](#table_engines-versionedcollapsingmergetree-algorithm)を参照してください。

**使用上の注意**

1. データを書き込むプログラムは、オブジェクトの状態を覚えておく必要があります。キャンセルするためには、「キャンセル」行は主キーのフィールドのコピーと「状態」行のバージョンと反対の`Sign`を含める必要があります。これによりストレージの初期サイズは増加しますが、データを書き込むのが速くなります。
2. カラム内の長い増加配列は、書き込み負荷のためにエンジンの効率を低下させます。データがシンプルであるほど、効率は向上します。
3. `SELECT`の結果は、オブジェクトの変更履歴の整合性に強く依存します。挿入のためのデータを準備する際は正確であることが重要です。不整合なデータでは予測不可能な結果が得られることがあり、セッションの深さのような非負の指標に対して負の値が返されることがあります。

### アルゴリズム {#table_engines-versionedcollapsingmergetree-algorithm}

ClickHouseがデータパーツをマージするとき、同じ主キーとバージョンを持ち、異なる`Sign`を持つ各ペアの行を削除します。行の順序は重要ではありません。

ClickHouseがデータを挿入するとき、行は主キーで順序付けされます。`Version`カラムが主キーに含まれていない場合、ClickHouseはそれを明示的に最後のフィールドとして主キーに追加し、順序付けに使用します。

## データの選択 {#selecting-data}

ClickHouseは、同じ主キーを持つすべての行が同じ結果データパーツに存在することや、同じ物理サーバーに存在することを保証しません。これはデータの書き込みや、後続のデータパーツのマージにも当てはまります。さらに、ClickHouseは複数のスレッドで`SELECT`クエリを処理するため、結果における行の順序を予測できません。このため、`VersionedCollapsingMergeTree`テーブルから完全に「折りたたまれた」データを得るには集約が必要です。

折りたたみを完了させるためには、`GROUP BY`句と`Sign`を考慮した集約関数を使用してクエリを書きます。例えば、数量を計算するには`count()`の代わりに`sum(Sign)`を使用します。何かの合計を計算するには`sum(Sign * x)`を使用し、`HAVING sum(Sign) > 0`を追加します。

集約関数`count`、`sum`、`avg`はこのように計算できます。集約関数`uniq`は、オブジェクトに少なくとも一つの非折りたたみ状態が存在する場合に計算できます。集約関数`min`と`max`は計算できません。なぜなら、`VersionedCollapsingMergeTree`は折りたたまれた状態の値の履歴を保存しないからです。

集約せずに「折りたたみ」データを抽出したい場合（例えば、最新の値が特定の条件に一致する行が存在するかどうかを確認する場合）、`FROM`句に`FINAL`修飾子を使用できます。このアプローチは効率的ではなく、大きなテーブルには使用すべきではありません。

## 使用例 {#example-of-use}

例データ：

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

異なるデータパーツを作成するために二つの`INSERT`クエリを使用します。データを一つのクエリで挿入すると、ClickHouseは一つのデータパーツを作成し、マージは決して行われません。

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

ここで私たちが見ているものと、どの部分が折りたたまれているのかを考えてみましょう。
私たちは二つの`INSERT`クエリを使用して二つのデータパーツを作成しました。`SELECT`クエリは二つのスレッドで行われ、その結果は行のランダムな順序です。
折りたたみはまだ行われていません。ClickHouseはデータパーツを未知のタイミングでマージしますが、それを予測することはできません。

これが集約が必要な理由です：

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

集約が不要で、折りたたみを強制したい場合は、`FROM`句に`FINAL`修飾子を使用できます。

``` sql
SELECT * FROM UAct FINAL
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

これは非常に非効率的なデータ選択方法です。大きなテーブルには使用しないでください。
