---
slug: /engines/table-engines/mergetree-family/summingmergetree
sidebar_position: 50
sidebar_label:  SummingMergeTree
title: "SummingMergeTree"
description: "SummingMergeTreeはMergeTreeエンジンを継承しています。その主な特徴は、部分マージ中に数値データを自動的に合計する能力です。"
---

# SummingMergeTree

このエンジンは[MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engines-mergetree)から継承されます。違いは、`SummingMergeTree`テーブルのデータ部分をマージする際に、ClickHouseが同じ主キー（より正確には、同じ[ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)）を持つすべての行を、数値データ型のカラムに対する要約値を持つ1行で置き換えることです。ソートキーが単一のキー値に対して多数の行に対応する形で構成されている場合、これによりストレージの量が大幅に削減され、データ選択が迅速化されます。

当エンジンは`MergeTree`と併用することを推奨します。完全なデータは`MergeTree`テーブルに保存し、集約データの保存には`SummingMergeTree`を使用します。例えば、レポートを準備する際です。このアプローチにより、誤って構成された主キーによって価値あるデータを失うことを防ぎます。

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

`columns` - 値が要約されるカラム名のタプル。オプションのパラメータです。
カラムは数値タイプであり、主キーに含まれていない必要があります。

`columns`が指定されていない場合、ClickHouseは主キーに含まれていないすべての数値データ型のカラムの値を要約します。

### クエリ句 {#query-clauses}

`SummingMergeTree`テーブルを作成する際には、`MergeTree`テーブルを作成する際と同様の[句](../../../engines/table-engines/mergetree-family/mergetree.md)が必要です。

<details markdown="1">

<summary>テーブルを作成するための非推奨の方法</summary>

:::note
新しいプロジェクトではこの方法を使用せず、可能な限り古いプロジェクトを上記の方法に切り替えてください。
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

- `columns` — 要約されるカラムの値名を持つタプル。オプションのパラメータ。説明については、上記のテキストを参照してください。

</details>

## 使用例 {#usage-example}

次のテーブルを考えます。

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

ClickHouseはすべての行を完全には合計しない場合があります（[下記を参照](#data-processing)）。したがって、クエリには集約関数`sum`と`GROUP BY`句を使用します。

``` sql
SELECT key, sum(value) FROM summtt GROUP BY key
```

``` text
┌─key─┬─sum(value)─┐
│   2 │          1 │
│   1 │          3 │
└─────┴────────────┘
```

## データ処理 {#data-processing}

データがテーブルに挿入される際、データはそのまま保存されます。ClickHouseは挿入されたデータ部分を定期的にマージし、この際に同じ主キーを持つ行が合計され、各結果のデータ部分に対して1つの行に置き換えられます。

ClickHouseは異なる結果のデータ部分をマージでき、その場合、同じ主キーを持つ行が存在する可能性があり、すなわち集計が不完全となることがあります。したがって、(`SELECT`)クエリには集約関数[sum()](../../../sql-reference/aggregate-functions/reference/sum.md#agg_function-sum)と`GROUP BY`句を使用するべきです。上記の例で説明しました。

### 一般的な合計のルール {#common-rules-for-summation}

数値データ型のカラムの値が要約されます。カラムのセットは`columns`パラメータによって定義されます。

要約されるカラムのすべての値が0の場合、その行は削除されます。

カラムが主キーに含まれておらず、要約されていない場合、既存の値の中から任意の値が選択されます。

主キーに含まれるカラムの値は要約されません。

### 集約関数カラムの合計 {#the-summation-in-the-aggregatefunction-columns}

[AggregateFunction型](../../../sql-reference/data-types/aggregatefunction.md)のカラムに対して、ClickHouseは[AggregatingMergeTree](../../../engines/table-engines/mergetree-family/aggregatingmergetree.md)エンジンと同様の動作をし、関数に従って集計を行います。

### ネスト構造 {#nested-structures}

テーブルは特別な方法で処理されるネストデータ構造を持つことができます。

ネストテーブルの名前が`Map`で終わり、次の条件を満たすカラムが少なくとも2つ含まれている場合：

- 最初のカラムは数値`(*Int*, Date, DateTime)`または文字列`(String, FixedString)`であり、これを`key`と呼びます。
- 他のカラムは算術`(*Int*, Float32/64)`であり、これを`(values...)`と呼びます。

この場合、このネストテーブルは`key => (values...)`のマッピングとして解釈され、行をマージする際には、2つのデータセットの要素が`key`でマージされ、対応する`(values...)`の合計が行われます。

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

データを要求する際は、`Map`の集約に[sumMap(key, value)](../../../sql-reference/aggregate-functions/reference/summap.md)関数を使用します。

ネストデータ構造の場合、要約のためのカラムのタプルにそのカラムを指定する必要はありません。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける集約コンビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
