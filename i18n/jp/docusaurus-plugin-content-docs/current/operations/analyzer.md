---
description: 'ClickHouseのクエリアナライザーの詳細ページ'
keywords: ['analyzer']
sidebar_label: 'アナライザー'
slug: /operations/analyzer
title: 'アナライザー'
---


# アナライザー

## 知られている非互換性 {#known-incompatibilities}

ClickHouse バージョン `24.3` では、新しいクエリアナライザーがデフォルトで有効になりました。
多くのバグを修正し、新しい最適化を導入したにもかかわらず、ClickHouse の動作にいくつかの破壊的変更をもたらしています。新しいアナライザーに対してクエリをどのように書き直すかを判断するために、以下の変更をお読みください。

### 無効なクエリは最適化されなくなりました {#invalid-queries-are-no-longer-optimized}

以前のクエリプランニングインフラストラクチャは、クエリの検証ステップの前に AST レベルの最適化を適用していました。
最適化により、初期クエリが書き換えられることで有効となり、実行可能になります。

新しいアナライザーでは、クエリの検証が最適化ステップの前に行われます。
これにより、以前は実行可能だった無効なクエリが現在はサポートされなくなりました。
そのような場合、クエリを手動で修正する必要があります。

**例 1:**

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```

次のクエリは、集約後に利用可能な `toString(number)` のみがあるときに、投影リストでカラム `number` を使用しています。
古いアナライザーでは、`GROUP BY toString(number)` は `GROUP BY number` に最適化され、クエリが有効となっていました。

**例 2:**

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

同じ問題がこのクエリにも発生します：カラム `number` が別のキーとともに集約の後に使用されています。
以前のクエリアナライザーは、`HAVING` 句から `WHERE` 句に `number > 5` フィルターを移動することでこのクエリを修正していました。

クエリを修正するには、非集約カラムに適用されるすべての条件を `WHERE` セクションに移動して標準 SQL 構文に準拠させる必要があります：
```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```

### 無効なクエリでの CREATE VIEW {#create-view-with-invalid-query}

新しいアナライザーは常に型チェックを行います。
以前は無効な `SELECT` クエリで `VIEW` を作成することができました。その場合、最初の `SELECT` または `INSERT` (この場合は `MATERIALIZED VIEW`) 時に失敗します。

今では、そのような `VIEW` を作成することはできません。

**例:**

```sql
CREATE TABLE source (data String) ENGINE=MergeTree ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```

### `JOIN` 句の知られている非互換性 {#known-incompatibilities-of-the-join-clause}

#### 投影からのカラムを使用した結合 {#join-using-column-from-projection}

`SELECT` リストのエイリアスはデフォルトでは `JOIN USING` キーとして使用できません。

新しい設定である `analyzer_compatibility_join_using_top_level_identifier` を有効にすると、`JOIN USING` の動作が変更され、`SELECT` クエリの投影リストからの式に基づいて識別子を解決することが優先され、左のテーブルからのカラムを直接使用することはなくなります。

**例:**

```sql
SELECT a + 1 AS b, t2.s
FROM Values('a UInt64, b UInt64', (1, 1)) AS t1
JOIN Values('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

`analyzer_compatibility_join_using_top_level_identifier` が `true` に設定されている場合、結合条件は `t1.a + 1 = t2.b` と解釈され、以前のバージョンの動作と一致します。したがって、結果は `2, 'two'` になります。
設定が `false` の場合、結合条件は `t1.b = t2.b` となり、クエリは `2, 'one'` を返します。
もし `b` が `t1` に存在しない場合、クエリはエラーで失敗します。

#### `JOIN USING` と `ALIAS`/`MATERIALIZED` カラムの動作の変更 {#changes-in-behavior-with-join-using-and-aliasmaterialized-columns}

新しいアナライザーでは、`JOIN USING` クエリで `ALIAS` または `MATERIALIZED` カラムを含む `*` を使用すると、デフォルトでそれらのカラムも結果セットに含まれます。

**例:**

```sql
CREATE TABLE t1 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 VALUES (1), (2);

CREATE TABLE t2 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t2 VALUES (2), (3);

SELECT * FROM t1
FULL JOIN t2 USING (payload);
```

新しいアナライザーでは、このクエリの結果には両方のテーブルの `id` と `payload` カラムが含まれます。一方、以前のアナライザーでは、特定の設定 (`asterisk_include_alias_columns` または `asterisk_include_materialized_columns`) が有効でない限り、これらの `ALIAS` カラムは含まれず、カラムの出現順も異なる場合があります。

旧クエリを新しいアナライザーに移行する際には、特に一貫した期待される結果を得るために、`SELECT` 句でカラムを明示的に指定することが推奨されます。

#### `USING` 句内のカラムに対する型修飾子の取り扱い {#handling-of-type-modifiers-for-columns-in-using-clause}

新しいアナライザーでは、`USING` 句に指定されたカラムの共通スーパークラスを決定するルールが標準化され、特に `LowCardinality` や `Nullable` のような型修飾子に対してより予測可能な結果を生み出すようになりました。

- `LowCardinality(T)` および `T`：`LowCardinality(T)` 型のカラムが `T` 型のカラムと結合されると、結果の共通スーパークラスは `T` となり、`LowCardinality` 修飾子は無視されます。

- `Nullable(T)` および `T`：`Nullable(T)` 型のカラムが `T` 型のカラムと結合されると、結果の共通スーパークラスは `Nullable(T)` となり、nullable プロパティが保持されます。

**例:**

```sql
SELECT id, toTypeName(id) FROM Values('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN Values('id String', ('b')) AS t2
USING (id);
```

このクエリでは、`id` の共通スーパークラスは `String` として決定され、`t1` からの `LowCardinality` 修飾子は無視されます。

### 投影カラム名の変更 {#projection-column-names-changes}

投影名計算中に、エイリアスは置換されません。

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

### 不互換な関数引数の型 {#incompatible-function-arguments-types}

新しいアナライザーでは、型推論が初期クエリ分析中に行われます。
この変更により、型チェックはショートサーキット評価の前に行われるため、`if` 関数の引数は常に共通スーパークラスを持たなければなりません。

**例:**

次のクエリは `Array(UInt8)` と `String` のためのスーパークラスが存在しないため失敗します：

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```

### 異種クラスタ {#heterogeneous-clusters}

新しいアナライザーは、クラスタ内のサーバー間の通信プロトコルを大幅に変更しました。したがって、異なる `enable_analyzer` 設定値を持つサーバーで分散クエリを実行することは不可能です。

### 変更は以前のアナライザーによって解釈されます {#mutations-are-interpreted-by-previous-analyzer}

変更は依然として古いアナライザーを使用しています。
このため、一部の新しい ClickHouse SQL 機能は、変更中に使用できません。例えば、`QUALIFY` 句などです。
ステータスは [こちら](https://github.com/ClickHouse/ClickHouse/issues/61563) で確認できます。

### サポートされていない機能 {#unsupported-features}

新しいアナライザーが現在サポートしていない機能のリスト：

- Annoy インデックス。
- Hypothesis インデックス。進行中 [こちら](https://github.com/ClickHouse/ClickHouse/pull/48381)。
- ウィンドウビューはサポートされていません。将来的にサポートする予定はありません。
