---
slug: /engines/table-engines/mergetree-family/summingmergetree
sidebar_position: 50
sidebar_label:  SummingMergeTree
title: "SummingMergeTree"
description: "SummingMergeTreeはMergeTreeエンジンを継承しています。その主な特徴は、パーツのマージ中に数値データを自動的に合計できることです。"
---


# SummingMergeTree

このエンジンは[MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)から継承されています。違いは、`SummingMergeTree`テーブルのデータパーツをマージする際に、ClickHouseが同じ主キー（正確には同じ[ソーティングキー](../../../engines/table-engines/mergetree-family/mergetree.md)）を持つすべての行を、数値データ型のカラムの集計値を含む1行に置き換えることです。ソーティングキーが1つのキー値に対して多数の行に対応するように構成されている場合、ストレージ容量が大幅に削減され、データの選択速度が向上します。

このエンジンは`MergeTree`と組み合わせて使用することをお勧めします。完全なデータを`MergeTree`テーブルに保存し、集約データの保存に`SummingMergeTree`を使用します。例えば、レポートを準備するときなどです。このアプローチにより、誤って構成された主キーによって貴重なデータを失うことを防ぎます。

## テーブルの作成 {#creating-a-table}

``` sql
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

#### columns {#columns}

`columns` - 値を集計するカラムの名前を持つタプル。オプションのパラメータです。
カラムは数値型でなければならず、主キーには含まれてはいけません。

`columns`が指定されていない場合、ClickHouseは主キーにない数値データ型の全カラムの値を集計します。

### クエリ句 {#query-clauses}

`SummingMergeTree`テーブルを作成する際には、`MergeTree`テーブルを作成する際と同様に、同じ[句](../../../engines/table-engines/mergetree-family/mergetree.md)が必要です。

<details markdown="1">

<summary>非推奨のテーブル作成方法</summary>

:::note
新しいプロジェクトではこの方法を使用しないでください。可能な場合は、古いプロジェクトを上記の方法に切り替えてください。
:::

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] SummingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

`columns`を除くすべてのパラメータは`MergeTree`と同じ意味を持ちます。

- `columns` — 値を集計するカラムの名前を持つタプル。オプションのパラメータです。詳細については、上記のテキストを参照してください。

</details>

## 使用例 {#usage-example}

次のテーブルを考えます：

``` sql
CREATE TABLE summtt
(
    key UInt32,
    value UInt32
)
ENGINE = SummingMergeTree()
ORDER BY key
```

データを挿入します：

``` sql
INSERT INTO summtt Values(1,1),(1,2),(2,1)
```

ClickHouseはすべての行を完全に合計しない可能性があります（[下記を参照](#data-processing)）。そのため、クエリで集約関数`sum`と`GROUP BY`句を使用します。

``` sql
SELECT key, sum(value) FROM summtt GROUP BY key
```

``` text
┌─key─┬─sum(value)─┐
│   2 │          1 │
│   1 │          3 │
└─────┴────────────┘
```

## データの処理 {#data-processing}

データがテーブルに挿入されると、それらはそのまま保存されます。ClickHouseは定期的に挿入されたデータパーツをマージし、このとき同じ主キーを持つ行が合計され、データの各部分に対して1つの行に置き換えられます。

ClickHouseはデータパーツをマージすることができるため、異なるデータ部分が同じ主キーを持つ行で構成されることがあり、つまり合計が不完全になる可能性があります。したがって、クエリでは集約関数[sum()](/sql-reference/aggregate-functions/reference/sum)と`GROUP BY`句を使用する必要があります。

### 合計に関する一般的なルール {#common-rules-for-summation}

数値データ型のカラムの値が合計されます。カラムの集合はパラメータ`columns`で定義されます。

合計のための全てのカラムの値が0だった場合、その行は削除されます。

カラムが主キーに含まれておらず、また集計されていない場合は、既存の値から任意の値が選択されます。

主キーのカラムについては、値は集計されません。

### 集約関数カラムにおける合計 {#the-summation-in-the-aggregatefunction-columns}

[AggregateFunction 型](../../../sql-reference/data-types/aggregatefunction.md)のカラムについて、ClickHouseは[AggregatingMergeTree](../../../engines/table-engines/mergetree-family/aggregatingmergetree.md)エンジンのように、その関数に基づいて集約を行います。

### ネストされた構造 {#nested-structures}

テーブルは特別な方法で処理されるネストされたデータ構造を持つことができます。

ネストされたテーブルの名前が`Map`で終わり、以下の条件を満たす少なくとも2つのカラムを含む場合：

- 最初のカラムは数値（`(*Int*, Date, DateTime)`）または文字列（`(String, FixedString)`）であり、これを`key`と呼び、
- その他のカラムは算術的なものである（`(*Int*, Float32/64)`）とし、これを`(values...)`と呼ぶ場合、

このネストされたテーブルは`key => (values...)`のマッピングとして解釈され、行をマージするときに、2つのデータセットの要素が`key`によってマージされ、対応する`(values...)`が合計されます。

例：

``` text
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

OPTIMIZE TABLE nested_sum FINAL; -- マージをエミュレートする 

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

データを要求する際は、`Map`の集約には[sumMap(key, value)](../../../sql-reference/aggregate-functions/reference/summap.md)関数を使用してください。

ネストされたデータ構造の場合、集計用のカラムのタプルにそのカラムを指定する必要はありません。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける集約コンビネーターの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
