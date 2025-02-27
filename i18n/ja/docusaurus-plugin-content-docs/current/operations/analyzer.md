---
slug: /operations/analyzer
sidebar_label: アナライザー
title: アナライザー
description: ClickHouse のクエリアナライザーに関する詳細
keywords: [アナライザー]
---

# アナライザー

## 既知の非互換性 {#known-incompatibilities}

ClickHouse バージョン `24.3` では、新しいクエリアナライザーがデフォルトで有効になりました。
多数のバグを修正し新しい最適化を導入したものの、ClickHouse の動作にいくつかの破壊的変更も導入されています。新しいアナライザー用にクエリを書き換える方法を決定するために、以下の変更をお読みください。

### 無効なクエリは最適化されない {#invalid-queries-are-no-longer-optimized}

以前のクエリ計画インフラは、クエリ検証ステップの前に AST レベルの最適化を適用していました。
最適化により、初期クエリを書き換えて有効にし、実行できるようにすることが可能でした。

新しいアナライザーでは、最適化ステップの前にクエリ検証が行われます。
これは、以前実行可能だった無効なクエリが現在はサポートされないことを意味します。
そのような場合、クエリは手動で修正する必要があります。

**例 1:**

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```

このクエリは、集約後に `toString(number)` のみが利用可能なプロジェクションリストでカラム `number` を使用しています。
旧アナライザーでは、`GROUP BY toString(number)` が `GROUP BY number,` に最適化され、クエリは有効になりました。

**例 2:**

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

このクエリでも同じ問題が発生します：`number` カラムが別のキーとの集約後に使用されています。
以前のクエリアナライザーは、`HAVING` 句から `WHERE` 句に `number > 5` フィルターを移動することによりこのクエリを修正しました。

クエリを修正するには、標準 SQL 構文に従って非集約列に適用されるすべての条件を `WHERE` セクションに移動する必要があります：
```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```

### 無効なクエリを持つ CREATE VIEW {#create-view-with-invalid-query}

新しいアナライザーは常に型チェックを行います。
以前は、無効な `SELECT` クエリを持つ `VIEW` を作成することが可能でした。それは最初の `SELECT` または `INSERT`（`MATERIALIZED VIEW` の場合）で失敗します。

現在、そのような `VIEW` を作成することはできません。

**例:**

```sql
CREATE TABLE source (data String) ENGINE=MergeTree ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```

### `JOIN` 句の既知の非互換性 {#known-incompatibilities-of-the-join-clause}

#### プロジェクションからのカラムを使用した JOIN {#join-using-column-from-projection}

`SELECT` リストからのエイリアスをデフォルトでは `JOIN USING` キーとして使用することはできません。

新しい設定 `analyzer_compatibility_join_using_top_level_identifier` を有効にすると、`JOIN USING` の動作が変更され、`SELECT` クエリのプロジェクションリストからの式に基づいて識別子を解決することが優先されます。

**例:**

```sql
SELECT a + 1 AS b, t2.s
FROM Values('a UInt64, b UInt64', (1, 1)) AS t1
JOIN Values('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

`analyzer_compatibility_join_using_top_level_identifier` を `true` に設定すると、結合条件は `t1.a + 1 = t2.b` と解釈され、以前のバージョンの動作に一致します。したがって、結果は `2, 'two'` になります。
設定が `false` の場合、結合条件は `t1.b = t2.b` にデフォルトとなり、クエリは `2, 'one'` を返します。
`b` が `t1` に存在しない場合、クエリはエラーで失敗します。

#### `JOIN USING` および `ALIAS`/`MATERIALIZED` カラムの動作の変更 {#changes-in-behavior-with-join-using-and-aliasmaterialized-columns}

新しいアナライザーでは、`ALIAS` または `MATERIALIZED` カラムを含む `JOIN USING` クエリで `*` を使用すると、これらのカラムが結果セットにデフォルトで含まれます。

**例:**

```sql
CREATE TABLE t1 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 VALUES (1), (2);

CREATE TABLE t2 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t2 VALUES (2), (3);

SELECT * FROM t1
FULL JOIN t2 USING (payload);
```

新しいアナライザーでは、このクエリの結果は両方のテーブルから `id` と共に `payload` カラムを含みます。それに対し、以前のアナライザーは特定の設定（`asterisk_include_alias_columns` または `asterisk_include_materialized_columns`）が有効になっている場合にのみこれらの `ALIAS` カラムを含み、カラムの順序が異なる場合があります。

特に古いクエリを新しいアナライザーに移行する際に、一貫して期待される結果を得るためには、`*` を使用するのではなく、`SELECT` 句でカラムを明示的に指定することをお勧めします。

#### `USING` 句のカラムの型修飾子の取り扱い {#handling-of-type-modifiers-for-columns-in-using-clause}

新しいアナライザーでは、`USING` 句で指定されたカラムの共通のスーパークラスを決定するためのルールが標準化され、特に `LowCardinality` や `Nullable` のような型修飾子を扱う際に予測可能な結果をもたらすようになりました。

- `LowCardinality(T)` および `T`： `LowCardinality(T)` 型のカラムが `T` 型のカラムと結合されると、結果の共通スーパークラスは `T` となり、`LowCardinality` 修飾子が効果的に破棄されます。

- `Nullable(T)` および `T`： `Nullable(T)` 型のカラムが `T` 型のカラムと結合されると、結果の共通スーパークラスは `Nullable(T)` となり、nullable 属性が保持されます。

**例:**

```sql
SELECT id, toTypeName(id) FROM Values('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN Values('id String', ('b')) AS t2
USING (id);
```

このクエリでは、`id` の共通スーパークラスは `String` と判断され、`t1` から `LowCardinality` 修飾子が破棄されます。

### プロジェクションカラム名の変更 {#projection-column-names-changes}

プロジェクション名の計算中に、エイリアスは置換されません。

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

### 非互換な関数引数の型 {#incompatible-function-arguments-types}

新しいアナライザーでは、型推論が初期クエリ分析中に行われます。
この変更により、型チェックがショートサーキット評価の前に実行されるため、`if` 関数の引数は常に共通スーパークラスを持つ必要があります。

**例:**

次のクエリは `Array(UInt8)` と `String` の型には共通のスーパータイプがないため失敗します：

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```

### 異種クラスター {#heterogeneous-clusters}

新しいアナライザーは、クラスタ内のサーバー間の通信プロトコルを大幅に変更しました。そのため、異なる `enable_analyzer` 設定値を持つサーバーで分散クエリを実行することは不可能です。

### 変更は以前のアナライザーで解釈される {#mutations-are-interpreted-by-previous-analyzer}

変更は旧アナライザーを使用しています。
これは、新しい ClickHouse SQL 機能が変更内で使用できないことを意味します。例えば、`QUALIFY` 句がそれに該当します。
ステータスは [こちら](https://github.com/ClickHouse/ClickHouse/issues/61563) で確認できます。

### サポートされていない機能 {#unsupported-features}

新しいアナライザーが現在サポートしていない機能のリスト：

- Annoy インデックス。
- Hypothesis インデックス。進行中の作業は [こちら](https://github.com/ClickHouse/ClickHouse/pull/48381) にあります。
- ウィンドウビューはサポートされていません。将来的にサポートする計画はありません。
