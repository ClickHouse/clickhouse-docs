---
'description': 'SummingMergeTree は MergeTree エンジンから継承されています。その主な特徴は、パーツのマージ中に数値データを自動的に合計する機能です。'
'sidebar_label': 'SummingMergeTree'
'sidebar_position': 50
'slug': '/engines/table-engines/mergetree-family/summingmergetree'
'title': 'SummingMergeTree'
'doc_type': 'reference'
---


# SummingMergeTree

このエンジンは [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) を継承します。違いは、`SummingMergeTree` テーブルのデータパーツをマージする際に、ClickHouse は同じ主キーを持つすべての行（より正確には、同じ [ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md) を持つ行）を、数値データ型のカラムの合計値を含む1つの行に置き換える点です。ソートキーが特定のキー値に対応する大量の行を含むように構成されている場合、ストレージボリュームが大幅に削減され、データの選択が迅速になります。

このエンジンを `MergeTree` と一緒に使用することをお勧めします。完全なデータは `MergeTree` テーブルに保存し、集約データの格納には `SummingMergeTree` を使用します。たとえば、レポートを準備する場合です。このアプローチにより、不適切に構成された主キーによる貴重なデータの損失を防ぐことができます。

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

リクエストパラメータの説明については、[リクエストの説明](../../../sql-reference/statements/create/table.md) を参照してください。

### SummingMergeTree のパラメータ {#parameters-of-summingmergetree}

#### カラム {#columns}

`columns` - 値が合計されるカラムの名前を持つタプル。オプションのパラメータです。
カラムは数値型である必要があり、パーティションまたはソートキーには含まれていない必要があります。

 `columns` が指定されていない場合、ClickHouse はソートキーに含まれていないすべての数値データ型のカラムの値を合計します。

### クエリ句 {#query-clauses}

`SummingMergeTree` テーブルを作成する際には、`MergeTree` テーブルを作成する場合と同じ [句](../../../engines/table-engines/mergetree-family/mergetree.md) が必要です。

<details markdown="1">

<summary>テーブル作成のための非推奨メソッド</summary>

:::note
新しいプロジェクトではこの方法を使用せず、可能であれば従来のプロジェクトを上記の方法に切り替えてください。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] SummingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

`columns` を除くすべてのパラメータは、`MergeTree` と同じ意味を持ちます。

- `columns` — 合計されるカラムの名前を持つタプル。オプションのパラメータです。説明については上記のテキストを参照してください。

</details>

## 使用例 {#usage-example}

以下のテーブルを考慮してください：

```sql
CREATE TABLE summtt
(
    key UInt32,
    value UInt32
)
ENGINE = SummingMergeTree()
ORDER BY key
```

データを挿入します：

```sql
INSERT INTO summtt VALUES(1,1),(1,2),(2,1)
```

ClickHouse はすべての行を完全には合計できない場合があるため、([以下を参照](#data-processing)) クエリでは集約関数 `sum` と `GROUP BY` 句を使用します。

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

データがテーブルに挿入されると、それはそのまま保存されます。ClickHouse は挿入されたデータパーツを定期的にマージし、この時に同じ主キーを持つ行が合計され、各結果データパーツのために1つに置き換えられます。

ClickHouse はデータパーツをマージする際に、異なる結果パーツが同じ主キーを持つ行を含むことがあるので、合計が不完全になる場合があります。したがって、クエリでは集約関数 [sum()](/sql-reference/aggregate-functions/reference/sum) と `GROUP BY` 句を使用する必要があります。これは上記の例で説明されています。

### 合計の一般規則 {#common-rules-for-summation}

数値データ型のカラムの値が合計されます。カラムのセットは `columns` パラメータによって定義されます。

もし合計のためのカラムのすべての値が0であれば、その行は削除されます。

カラムが主キーに含まれておらず、合計されない場合は、既存の値の中から任意の値が選択されます。

主キーに含まれるカラムの値は合計されません。

### AggregateFunction カラムにおける合計 {#the-summation-in-the-aggregatefunction-columns}

[AggregateFunction 型](../../../sql-reference/data-types/aggregatefunction.md) のカラムに対して、ClickHouse は [AggregatingMergeTree](../../../engines/table-engines/mergetree-family/aggregatingmergetree.md) エンジンのように、その関数に基づいて集約します。

### ネスト構造 {#nested-structures}

テーブルは特別な方法で処理されるネストしたデータ構造を持つことができます。

ネストしたテーブルの名前が `Map` で終わり、以下の基準を満たすカラムが少なくとも2つある場合：

- 最初のカラムが数値 `(*Int*, Date, DateTime)` または文字列 `(String, FixedString)` である場合、これを `key` と呼びます。
- 他のカラムは算術的 `(*Int*, Float32/64)` であり、これを `(values...)` と呼びます。

この場合、ネストしたテーブルは `key => (values...)` のマッピングとして解釈され、行をマージする際に2つのデータセットの要素は `key` によってマージされ、その対応する `(values...)` が合計されます。

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

OPTIMIZE TABLE nested_sum FINAL; -- emulate merge 

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

データをリクエストする際には、`Map` の集約に対して [sumMap(key, value)](../../../sql-reference/aggregate-functions/reference/summap.md) 関数を使用します。

ネストしたデータ構造については、合計のためのカラムのタプルにそのカラムを指定する必要はありません。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける集約関数コンビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
