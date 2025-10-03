---
description: 'SummingMergeTree inherits from the MergeTree engine. Its key feature
  is the ability to automatically sum numeric data during part merges.'
sidebar_label: 'SummingMergeTree'
sidebar_position: 50
slug: '/engines/table-engines/mergetree-family/summingmergetree'
title: 'SummingMergeTree'
---




# SummingMergeTree

このエンジンは [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) から継承されています。違いは、`SummingMergeTree` テーブルのデータパーツをマージする際に、ClickHouse が同じ主キーのすべての行（より正確には、同じ [ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)）を持つ行を、数値データ型のカラムの合計値を持つ1行に置き換える点です。ソートキーが単一のキー値に大きな数の行が対応するように構成されている場合、これによりストレージボリュームが大幅に削減され、データ選択が迅速になります。

エンジンは `MergeTree` と共に使用することをお勧めします。すべてのデータを `MergeTree` テーブルに保存し、集計データを保存するために `SummingMergeTree` を使用します。たとえば、レポートを作成するときです。このアプローチにより、誤って構成された主キーによる貴重なデータ損失を防ぐことができます。

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

### SummingMergeTree のパラメータ {#parameters-of-summingmergetree}

#### columns {#columns}

`columns` - 値が合計されるカラムの名前のタプル。オプションのパラメータです。
カラムは数値型でなければならず、パーティションまたはソートキーに含まれてはいけません。

`columns` が指定されない場合、ClickHouse はソートキーに含まれないすべての数値データ型のカラムの値を合計します。

### クエリ句 {#query-clauses}

`SummingMergeTree` テーブルを作成する際には、`MergeTree` テーブルを作成する時と同じ [句](../../../engines/table-engines/mergetree-family/mergetree.md) が必要です。

<details markdown="1">

<summary>テーブルを作成するための非推奨メソッド</summary>

:::note
このメソッドは新しいプロジェクトでは使用しないでください。可能であれば、古いプロジェクトを上記に記載した方法に切り替えてください。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] SummingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

すべてのパラメータは `MergeTree` での意味と同じです。

- `columns` - 合計されるカラムの名前のタプル。オプションのパラメータです。詳細は上記のテキストを参照してください。

</details>

## 使用例 {#usage-example}

次のテーブルを考えてみましょう。

```sql
CREATE TABLE summtt
(
    key UInt32,
    value UInt32
)
ENGINE = SummingMergeTree()
ORDER BY key
```

データを挿入します。

```sql
INSERT INTO summtt Values(1,1),(1,2),(2,1)
```

ClickHouse はすべての行を完全に合計しない場合があります（[下記参照](#data-processing)）。そのため、クエリ内で集計関数 `sum` と `GROUP BY` 句を使用します。

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

データがテーブルに挿入されると、それらはそのまま保存されます。ClickHouse は挿入されたデータパーツを定期的にマージし、この際に同じ主キーを持つ行が合計され、それぞれのデータパーツごとに1つに置き換えられます。

ClickHouse はデータパーツをマージできるため、異なる結果のデータパーツが同じ主キーを持つ行で構成されることがあります。すなわち、合計が不完全になる可能性があります。そのため、クエリ内で集計関数 [sum()](/sql-reference/aggregate-functions/reference/sum) と `GROUP BY` 句を使用する必要があります。上記の例のように。

### 合計に関する一般規則 {#common-rules-for-summation}

数値データ型のカラムの値が合計されます。カラムのセットは `columns` パラメータによって定義されます。

合計のためのカラムのすべての値が 0 である場合、その行は削除されます。

カラムが主キーに含まれておらず、合計されない場合、既存の値から任意の値が選択されます。

主キーのカラムについては、値は合計されません。

### 集約関数カラムでの合計 {#the-summation-in-the-aggregatefunction-columns}

[AggregateFunction 型](../../../sql-reference/data-types/aggregatefunction.md) のカラムについて、ClickHouse はその関数に従って集約する [AggregatingMergeTree](../../../engines/table-engines/mergetree-family/aggregatingmergetree.md) エンジンのように動作します。

### ネストされた構造 {#nested-structures}

テーブルは特別な方法で処理されるネストされたデータ構造を持つことができます。

ネストされたテーブルの名前が `Map` で終わり、少なくとも次の条件を満たす2カラム以上を含む場合：

- 最初のカラムは数値型 `(*Int*, Date, DateTime)` または文字列 `(String, FixedString)` で、これを `key` と呼びます。
- 他のカラムは算術型 `(*Int*, Float32/64)` で、これを `(values...)` と呼びます。

このネストされたテーブルは `key => (values...)` のマッピングとして解釈され、行をマージするときに、2つのデータセットの要素が `key` によってマージされ、対応する `(values...)` の合計が計算されます。

例：

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

データを要求する際には、`Map` の集計には [sumMap(key, value)](../../../sql-reference/aggregate-functions/reference/summap.md) 関数を使用します。

ネストされたデータ構造では、合計のためのカラムのタプルにそのカラムを指定する必要はありません。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における集約関数コンビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
