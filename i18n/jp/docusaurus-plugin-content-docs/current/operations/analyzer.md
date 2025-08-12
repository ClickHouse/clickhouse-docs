---
description: 'Page detailing the ClickHouse query analyzer'
keywords:
- 'analyzer'
sidebar_label: 'Analyzer'
slug: '/operations/analyzer'
title: 'Analyzer'
---




# Analyzer

## Known incompatibilities {#known-incompatibilities}

ClickHouseバージョン`24.3`では、新しいクエリアナライザーがデフォルトで有効になりました。
多くのバグを修正し新しい最適化を導入したにもかかわらず、ClickHouseの動作にいくつかの破壊的変更も導入されました。新しいアナライザーに対して、クエリをどのように書き直すかを判断するために、以下の変更点をお読みください。

### Invalid queries are no longer optimized {#invalid-queries-are-no-longer-optimized}

以前のクエリプランニングインフラストラクチャは、クエリ検証ステップの前にASTレベルの最適化を適用していました。
最適化は初期クエリを書き換え、有効なものにし、実行可能なものにすることができました。

新しいアナライザーでは、クエリ検証が最適化ステップの前に行われます。
これは、以前に実行可能だった無効なクエリが現在はサポートされていないことを意味します。
そのような場合、クエリを手動で修正する必要があります。

**例 1:**

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```

以下のクエリは、集約後に`toString(number)`しか利用できない場合に、プロジェクションリストで`number`カラムを使用しています。
古いアナライザーでは、`GROUP BY toString(number)`は`GROUP BY number,`へ最適化され、クエリは有効になりました。

**例 2:**

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

このクエリでも同様の問題が発生します:  `number`カラムが他のキーで集約後に使用されています。
以前のクエリアナライザーは、`HAVING`句から`WHERE`句に`number > 5`フィルタを移動させてこのクエリを修正しました。

クエリを修正するには、非集約カラムに適用されるすべての条件を`WHERE`セクションに移動して、標準のSQL構文に従う必要があります:
```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```

### CREATE VIEW with invalid query {#create-view-with-invalid-query}

新しいアナライザーは常に型チェックを実行します。
以前は、無効な`SELECT`クエリで`VIEW`を作成することが可能でした。このVIEWは最初の`SELECT`または`INSERT`（`MATERIALIZED VIEW`の場合）で失敗していました。

現在は、そのような`VIEW`を作成することはできません。

**例:**

```sql
CREATE TABLE source (data String) ENGINE=MergeTree ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```

### Known incompatibilities of the `JOIN` clause {#known-incompatibilities-of-the-join-clause}

#### Join using column from projection {#join-using-column-from-projection}

投影リストからのエイリアスは、デフォルトでは`JOIN USING`キーとして使用できません。

新しい設定`analyzer_compatibility_join_using_top_level_identifier`が有効になると、`JOIN USING`の動作が変更され、`SELECT`クエリの投影リストの式に基づいて識別子を解決することが優先されます。

**例:**

```sql
SELECT a + 1 AS b, t2.s
FROM Values('a UInt64, b UInt64', (1, 1)) AS t1
JOIN Values('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

`analyzer_compatibility_join_using_top_level_identifier`が`true`に設定されている場合、結合条件は`t1.a + 1 = t2.b`として解釈され、以前のバージョンの動作と一致します。この場合、結果は`2, 'two'`になります。
設定が`false`の場合、結合条件は`t1.b = t2.b`にデフォルトされ、クエリは`2, 'one'`を返します。
`t1`に`b`が存在しない場合、クエリはエラーで失敗します。

#### Changes in behavior with `JOIN USING` and `ALIAS`/`MATERIALIZED` columns {#changes-in-behavior-with-join-using-and-aliasmaterialized-columns}

新しいアナライザーでは、`ALIAS`または`MATERIALIZED`カラムを含む`JOIN USING`クエリで`*`を使用すると、デフォルトでそれらのカラムが結果セットに含まれます。

**例:**

```sql
CREATE TABLE t1 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 VALUES (1), (2);

CREATE TABLE t2 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t2 VALUES (2), (3);

SELECT * FROM t1
FULL JOIN t2 USING (payload);
```

新しいアナライザーでは、このクエリの結果には両方のテーブルからの`id`と`payload`カラムが含まれます。対照的に、以前のアナライザーは、特定の設定（`asterisk_include_alias_columns`または`asterisk_include_materialized_columns`）が有効である場合にのみ、これらの`ALIAS`カラムを含むことがあり、カラムは別の順序で表示される可能性があります。

特に古いクエリを新しいアナライザーに移行する際に、一貫性のある期待通りの結果を保証するためには、`*`を使用するのではなく、`SELECT`句でカラムを明示的に指定することが推奨されます。

#### Handling of Type Modifiers for columns in `USING` Clause {#handling-of-type-modifiers-for-columns-in-using-clause}

新しいアナライザーのバージョンでは、`USING`句で指定されたカラムの共通スーパタイプを決定するルールが標準化され、特に`LowCardinality`や`Nullable`のような型修飾子を扱う際により予測可能な結果を生み出します。

- `LowCardinality(T)`と`T`: 型`LowCardinality(T)`のカラムが型`T`のカラムと結合されると、結果の共通スーパタイプは`T`となり、`LowCardinality`修飾子が無効化されます。

- `Nullable(T)`と`T`: 型`Nullable(T)`のカラムが型`T`のカラムと結合されると、結果の共通スーパタイプは`Nullable(T)`となり、nullableプロパティが保持されます。

**例:**

```sql
SELECT id, toTypeName(id) FROM Values('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN Values('id String', ('b')) AS t2
USING (id);
```

このクエリでは、`id`の共通スーパタイプが`String`とされ、`t1`からの`LowCardinality`修飾子が無視されます。

### Projection column names changes {#projection-column-names-changes}

投影名の計算中に、エイリアスは置き換えられません。

```sql
SELECT
    1 + 1 AS x,
    x + 1
SETTINGS enable_analyzer = 0
FORMAT PrettyCompact

   ┌─x─┬─plus(plus(1, 1), 1)─┐
1. │ 2 │                   3 │
   └───┴─────────────────────┘

SELECT
    1 + 1 AS x,
    x + 1
SETTINGS enable_analyzer = 1
FORMAT PrettyCompact

   ┌─x─┬─plus(x, 1)─┐
1. │ 2 │          3 │
   └───┴────────────┘
```

### Incompatible function arguments types {#incompatible-function-arguments-types}

新しいアナライザーでは、型推論は初期クエリ分析中に行われます。
この変更により、型チェックはショートサーキット評価の前に行われるため、`if`関数の引数は常に共通スーパタイプを持っていなければなりません。

**例:**

以下のクエリは、`There is no supertype for types Array(UInt8), String because some of them are Array and some of them are not`というエラーで失敗します：

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```

### Heterogeneous clusters {#heterogeneous-clusters}

新しいアナライザーは、クラスタ内のサーバ間の通信プロトコルを大幅に変更しました。そのため、異なる`enable_analyzer`設定値を持つサーバで分散クエリを実行することは不可能です。

### Mutations are interpreted by previous analyzer {#mutations-are-interpreted-by-previous-analyzer}

マテーションは依然として古いアナライザーを使用しています。
つまり、新しいClickHouse SQL機能のいくつかはマテーションでは使用できません。例えば、`QUALIFY`句。
ステータスは[こちら](https://github.com/ClickHouse/ClickHouse/issues/61563)で確認できます。

### Unsupported features {#unsupported-features}

新しいアナライザーが現在サポートしていない機能のリスト:

- Annoy index.
- Hypothesis index. 現在進行中 [こちら](https://github.com/ClickHouse/ClickHouse/pull/48381).
- Window viewはサポートされていません。将来的にサポートする予定はありません。
