---
description: 'SummingMergeTreeはMergeTreeエンジンを継承します。その主な特徴は、パーツのマージ時に数値データを自動的に合計できることです。'
sidebar_label: 'SummingMergeTree'
sidebar_position: 50
slug: /engines/table-engines/mergetree-family/summingmergetree
title: 'SummingMergeTree'
---


# SummingMergeTree

このエンジンは [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) を継承します。違いは、`SummingMergeTree` テーブルのデータパーツをマージする際に、ClickHouseが同じ主キーである行（より正確には、同じ [ソーティングキー](../../../engines/table-engines/mergetree-family/mergetree.md)である行）を、それらのカラムの合計値を持つ1行に置き換えることです。ソーティングキーが、単一のキー値が多数の行に対応するように構成されている場合、これによりストレージ容量が大幅に削減され、データの選択が迅速になります。

このエンジンは `MergeTree` と一緒に使用することをお勧めします。完全なデータを `MergeTree` テーブルに保存し、集約データの保存には `SummingMergeTree` を使用してください。たとえば、レポートを準備する際などです。このアプローチにより、誤って構成された主キーによって貴重なデータを失うことを防ぎます。

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

リクエストパラメータの説明については [リクエストの説明](../../../sql-reference/statements/create/table.md) を参照してください。

### SummingMergeTreeのパラメータ {#parameters-of-summingmergetree}

#### columns {#columns}

`columns` - 値が合計されるカラムの名前を含むタプル。オプションのパラメータです。  
カラムは数値型でなければならず、パーティションやソーティングキーには含まれてはいけません。

`columns` が指定されていない場合、ClickHouseはソーティングキーに含まれないすべての数値型カラムの値を合計します。

### クエリ句 {#query-clauses}

`SummingMergeTree` テーブルを作成する際には、`MergeTree` テーブルを作成する場合と同じ [句](../../../engines/table-engines/mergetree-family/mergetree.md) が必要です。

<details markdown="1">

<summary>テーブルを作成するための非推奨の方法</summary>

:::note
この方法は新しいプロジェクトでは使用しないでください。可能であれば、古いプロジェクトを上記の方法に切り替えてください。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] SummingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

`columns`を除くすべてのパラメータは、`MergeTree` の場合と同じ意味を持ちます。

- `columns` — 値が合計されるカラムの名前を含むタプル。オプションのパラメータ。詳細については、上記の本文を参照してください。

</details>

## 使用例 {#usage-example}

以下のテーブルを考えてみましょう:

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
INSERT INTO summtt Values(1,1),(1,2),(2,1)
```

ClickHouseはすべての行を完全に合計することができない場合があるため（[下記を参照](#data-processing)）、クエリでは集約関数`sum`と`GROUP BY`句を使用します。

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

テーブルにデータが挿入されると、そのまま保存されます。ClickHouseは挿入されたデータパーツを定期的にマージし、このとき同じ主キーを持つ行が合計され、各結果のデータパーツについて1行に置き換えられます。

ClickHouseはデータパーツをマージすることができ、異なる結果のデータパーツが同じ主キーを持つ行から構成される場合があります。つまり、合計が不完全になる可能性があります。したがって、クエリで集約関数 [sum()](/sql-reference/aggregate-functions/reference/sum) と `GROUP BY` 句を使用する必要があります。

### 合計に関する一般的なルール {#common-rules-for-summation}

数値型カラムの値が合計されます。カラムのセットは`columns`パラメータで定義されます。

合計のためのすべてのカラムの値が0であれば、その行は削除されます。

カラムが主キーに含まれていなく、合計されない場合、既存の値から任意の値が選択されます。

主キーに含まれるカラムの値は合計されません。

### 集約関数カラムにおける合計 {#the-summation-in-the-aggregatefunction-columns}

[AggregateFunction型](../../../sql-reference/data-types/aggregatefunction.md) のカラムに対して、ClickHouseは [AggregatingMergeTree](../../../engines/table-engines/mergetree-family/aggregatingmergetree.md) エンジンのように動作し、関数に従って集約します。

### ネスト構造 {#nested-structures}

テーブルは、特別な方法で処理されるネストデータ構造を持つことができます。

ネストされたテーブルの名前が`Map`で終わり、少なくとも次の基準を満たす2つのカラムを含む場合：

- 最初のカラムは数値型 `(*Int*, Date, DateTime)` または文字列型 `(String, FixedString)` で呼ばれる、`key`、
- 他のカラムは算術型 `(*Int*, Float32/64)` である、`(values...)`、

このネストされたテーブルは、`key => (values...)` のマッピングとして解釈され、行をマージする際には、2つのデータセットの要素が `key` でマージされ、対応する `(values...)` が合計されます。

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

データをリクエストする際には、`Map` の集約に [sumMap(key, value)](../../../sql-reference/aggregate-functions/reference/summap.md) 関数を使用してください。

ネストされたデータ構造の場合、合計するためのカラムのタプルにそのカラムを指定する必要はありません。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける集約コンビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
