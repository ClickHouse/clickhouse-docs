---
description: 'SummingMergeTree は MergeTree エンジンを継承したテーブルエンジンです。その主な特徴は、パーツのマージ時に数値データを自動で合計できることです。'
sidebar_label: 'SummingMergeTree'
sidebar_position: 50
slug: /engines/table-engines/mergetree-family/summingmergetree
title: 'SummingMergeTree テーブルエンジン'
doc_type: 'reference'
---



# SummingMergeTree テーブルエンジン

このエンジンは [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) を継承しています。違いは、`SummingMergeTree` テーブルのデータパートをマージする際、ClickHouse が同じプライマリキー（より正確には、同じ [ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)）を持つすべての行を、数値型カラムの値を合計した 1 行に置き換える点です。ソートキーが 1 つのキー値に多数の行が対応するように設計されている場合、これによりストレージ容量を大幅に削減でき、データ取得を高速化できます。

このエンジンは `MergeTree` と併用することを推奨します。元データ全体は `MergeTree` テーブルに保存し、集計済みデータの保存には `SummingMergeTree` を使用します（たとえばレポートを作成する場合など）。このようなアプローチにより、不適切なプライマリキー設計が原因で貴重なデータを失うことを防ぐことができます。



## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = SummingMergeTree([columns])
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

リクエストパラメータの説明については、[リクエストの説明](../../../sql-reference/statements/create/table.md)を参照してください。

### SummingMergeTreeのパラメータ {#parameters-of-summingmergetree}

#### カラム {#columns}

`columns` - 値を合計するカラム名のタプル。オプションパラメータ。
カラムは数値型である必要があり、パーティションキーまたはソートキーに含まれていてはなりません。

`columns`が指定されていない場合、ClickHouseはソートキーに含まれていないすべての数値データ型のカラムの値を合計します。

### クエリ句 {#query-clauses}

`SummingMergeTree`テーブルを作成する際には、`MergeTree`テーブルを作成する場合と同じ[句](../../../engines/table-engines/mergetree-family/mergetree.md)が必要です。

<details markdown="1">

<summary>非推奨のテーブル作成方法</summary>

:::note
新しいプロジェクトではこの方法を使用せず、可能であれば既存のプロジェクトを上記の方法に切り替えてください。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] SummingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

`columns`を除くすべてのパラメータは、`MergeTree`と同じ意味を持ちます。

- `columns` — 値を合計するカラム名のタプル。オプションパラメータ。説明については、上記のテキストを参照してください。

</details>


## 使用例 {#usage-example}

次のテーブルを考えます:

```sql
CREATE TABLE summtt
(
    key UInt32,
    value UInt32
)
ENGINE = SummingMergeTree()
ORDER BY key
```

データを挿入します:

```sql
INSERT INTO summtt VALUES(1,1),(1,2),(2,1)
```

ClickHouseは全ての行を完全に合計しない場合があります([以下を参照](#data-processing))ので、クエリでは集約関数`sum`と`GROUP BY`句を使用します。

```sql
SELECT key, sum(value) FROM summtt GROUP BY key
```

```text
┌─key─┬─sum(value)─┐
│   2 │          1 │
│   1 │          3 │
└─────┴────────────┘
```


## データ処理 {#data-processing}

データがテーブルに挿入されると、そのまま保存されます。ClickHouseは挿入されたデータパーツを定期的にマージし、その際に同じプライマリキーを持つ行が合計され、結果として得られる各データパーツごとに1つの行に置き換えられます。

ClickHouseはデータパーツをマージする際、異なる結果データパーツに同じプライマリキーを持つ行が含まれる可能性があります。つまり、合計が不完全になる場合があります。したがって、上記の例で説明されているように、クエリ(`SELECT`)では集約関数[sum()](/sql-reference/aggregate-functions/reference/sum)と`GROUP BY`句を使用する必要があります。

### 合計の共通ルール {#common-rules-for-summation}

数値データ型の列の値が合計されます。列のセットは`columns`パラメータで定義されます。

合計対象のすべての列の値が0の場合、その行は削除されます。

列がプライマリキーに含まれず、合計もされない場合、既存の値から任意の値が選択されます。

プライマリキーの列の値は合計されません。

### AggregateFunction列での合計 {#the-summation-in-the-aggregatefunction-columns}

[AggregateFunction型](../../../sql-reference/data-types/aggregatefunction.md)の列に対して、ClickHouseは[AggregatingMergeTree](../../../engines/table-engines/mergetree-family/aggregatingmergetree.md)エンジンと同様に、関数に従って集約を行います。

### ネスト構造 {#nested-structures}

テーブルは特別な方法で処理されるネストされたデータ構造を持つことができます。

ネストされたテーブルの名前が`Map`で終わり、以下の基準を満たす少なくとも2つの列が含まれている場合:

- 最初の列が数値型`(*Int*, Date, DateTime)`または文字列型`(String, FixedString)`である場合、これを`key`と呼びます。
- 他の列が算術型`(*Int*, Float32/64)`である場合、これを`(values...)`と呼びます。

この場合、このネストされたテーブルは`key => (values...)`のマッピングとして解釈され、行をマージする際に、2つのデータセットの要素が`key`によってマージされ、対応する`(values...)`が合計されます。

例:

```text
DROP TABLE IF EXISTS nested_sum;
CREATE TABLE nested_sum
(
    date Date,
    site UInt32,
    hitsMap Nested(
        browser String,
        imps UInt32,
        clicks UInt32
    )
) ENGINE = SummingMergeTree
PRIMARY KEY (date, site);

INSERT INTO nested_sum VALUES ('2020-01-01', 12, ['Firefox', 'Opera'], [10, 5], [2, 1]);
INSERT INTO nested_sum VALUES ('2020-01-01', 12, ['Chrome', 'Firefox'], [20, 1], [1, 1]);
INSERT INTO nested_sum VALUES ('2020-01-01', 12, ['IE'], [22], [0]);
INSERT INTO nested_sum VALUES ('2020-01-01', 10, ['Chrome'], [4], [3]);

OPTIMIZE TABLE nested_sum FINAL; -- マージをエミュレート

SELECT * FROM nested_sum;
┌───────date─┬─site─┬─hitsMap.browser───────────────────┬─hitsMap.imps─┬─hitsMap.clicks─┐
│ 2020-01-01 │   10 │ ['Chrome']                        │ [4]          │ [3]            │
│ 2020-01-01 │   12 │ ['Chrome','Firefox','IE','Opera'] │ [20,11,22,5] │ [1,3,0,1]      │
└────────────┴──────┴───────────────────────────────────┴──────────────┴────────────────┘

SELECT
    site,
    browser,
    impressions,
    clicks
FROM
(
    SELECT
        site,
        sumMap(hitsMap.browser, hitsMap.imps, hitsMap.clicks) AS imps_map
    FROM nested_sum
    GROUP BY site
)
ARRAY JOIN
    imps_map.1 AS browser,
    imps_map.2 AS impressions,
    imps_map.3 AS clicks;

┌─site─┬─browser─┬─impressions─┬─clicks─┐
│   12 │ Chrome  │          20 │      1 │
│   12 │ Firefox │          11 │      3 │
│   12 │ IE      │          22 │      0 │
│   12 │ Opera   │           5 │      1 │
│   10 │ Chrome  │           4 │      3 │
└──────┴─────────┴─────────────┴────────┘
```


データを取得する際には、`Map` の集約には [sumMap(key, value)](../../../sql-reference/aggregate-functions/reference/summap.md) 関数を使用します。

ネストされたデータ構造については、合計を行うカラムのタプル内で、そのカラムを明示的に指定する必要はありません。



## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの集約コンビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
