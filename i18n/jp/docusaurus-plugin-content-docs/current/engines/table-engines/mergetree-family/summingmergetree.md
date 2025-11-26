---
description: 'SummingMergeTree は MergeTree エンジンを継承します。その主な機能は、パーツのマージ時に数値データを自動的に合計できることです。'
sidebar_label: 'SummingMergeTree'
sidebar_position: 50
slug: /engines/table-engines/mergetree-family/summingmergetree
title: 'SummingMergeTree テーブルエンジン'
doc_type: 'reference'
---



# SummingMergeTree テーブルエンジン

このエンジンは [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) を継承しています。違いは、`SummingMergeTree` テーブルでデータパーツをマージする際に、ClickHouse が同じ主キー（より正確には同じ [ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)）を持つすべての行を、数値データ型のカラムの値を合計した 1 行に置き換える点です。ソートキーの構成によって、1 つのキー値に多数の行が対応する場合、これにより必要なストレージ容量を大幅に削減し、データ取得の高速化を実現できます。

このエンジンは `MergeTree` と組み合わせて使用することを推奨します。生データ（完全なデータ）は `MergeTree` テーブルに保存し、集計済みデータの保存には `SummingMergeTree` を使用します（たとえばレポートを作成する場合など）。このようなアプローチにより、不適切に構成された主キーが原因で貴重なデータを失うことを防止できます。



## テーブルを作成する

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

### SummingMergeTree のパラメータ

#### カラム

`columns` - 値を集計（合計）するカラム名を含むタプルです。省略可能なパラメータです。
カラムは数値型である必要があり、パーティションキーまたはソートキーに含めることはできません。

`columns` が指定されていない場合、ClickHouse はソートキーに含まれていない数値データ型のすべてのカラムの値を集計します。

### クエリ句

`SummingMergeTree` テーブルを作成する際には、`MergeTree` テーブルを作成する場合と同じ [句](../../../engines/table-engines/mergetree-family/mergetree.md) を指定する必要があります。

<details markdown="1">
  <summary>テーブル作成の非推奨メソッド</summary>

  :::note
  新しいプロジェクトではこの方法を使用しないでください。可能であれば、既存のプロジェクトも上で説明した方法に切り替えてください。
  :::

  ```sql
  CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
  (
      name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
      name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
      ...
  ) ENGINE [=] SummingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
  ```

  `columns` 以外のすべてのパラメータは、`MergeTree` における意味と同じです。

  * `columns` — 値を集計（合計）するカラム名を含むタプルです。省略可能なパラメータです。詳細は上記を参照してください。
</details>


## 使用例

次のテーブルを例にします。

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

ClickHouse はすべての行を完全には集計しない場合があります（[後述](#data-processing) を参照してください）。そのため、クエリでは集約関数 `sum` と `GROUP BY` 句を使用します。

```sql
SELECT key, sum(value) FROM summtt GROUP BY key
```

```text
┌─key─┬─sum(value)─┐
│   2 │          1 │
│   1 │          3 │
└─────┴────────────┘
```


## データ処理

データがテーブルに挿入されると、そのままの形で保存されます。ClickHouse は挿入されたデータパートを定期的にマージし、その際に同じ主キーを持つ行が合計され、各結果データパートごとに 1 行に置き換えられます。

ClickHouse はデータパートをマージする際、マージの結果として異なるデータパート同士に同じ主キーを持つ行が分かれて存在する場合があります。つまり、合計処理が不完全になる可能性があります。そのため、上記の例で説明したように、クエリでは集約関数 [`sum()`](/sql-reference/aggregate-functions/reference/sum) と `GROUP BY` 句を組み合わせて使用する必要があります。

### 集計に関する共通ルール

数値データ型の列に含まれる値は合計されます。対象となる列の集合はパラメータ `columns` で定義されます。

合計対象となるすべての列の値が 0 であった場合、その行は削除されます。

列が主キーに含まれておらず、かつ合計対象でもない場合、既存の値の中から任意の値が選択されます。

主キーに含まれる列の値は合計されません。

### AggregateFunction 列における集計

[AggregateFunction 型](../../../sql-reference/data-types/aggregatefunction.md)の列に対しては、ClickHouse は [AggregatingMergeTree](../../../engines/table-engines/mergetree-family/aggregatingmergetree.md) エンジンと同様に、関数に従って集約処理を行います。

### ネストした構造

テーブルには特別な方法で処理されるネストしたデータ構造を含めることができます。

ネストしたテーブル名が `Map` で終わり、かつ次の条件を満たす 2 列以上を含んでいる場合:

* 1 列目が数値型 `(*Int*, Date, DateTime)` または文字列型 `(String, FixedString)` である列（これを `key` と呼びます）,
* その他の列が算術型 `(*Int*, Float32/64)` である列（これらを `(values...)` と呼びます）、

このネストしたテーブルは `key => (values...)` という対応関係を表すものとして解釈されます。このテーブルの行をマージする際には、2 つのデータセットの要素が `key` を基準にマージされ、それに対応する `(values...)` が合計されます。

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


データを取得する際は、`Map` を集計するために [sumMap(key, value)](../../../sql-reference/aggregate-functions/reference/summap.md) 関数を使用します。

ネストされたデータ構造の場合、集計対象のカラムのタプル内で、その構造に含まれるカラムを個別に指定する必要はありません。



## 関連コンテンツ {#related-content}

- ブログ記事: [Using Aggregate Combinators in ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
