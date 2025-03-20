---
slug: /operations/analyzer
sidebar_label: アナライザー
title: アナライザー
description: ClickHouseのクエリアナライザーに関する詳細
keywords: [analyzer]
---


# アナライザー

## 既知の非互換性 {#known-incompatibilities}

ClickHouse バージョン `24.3` から、新しいクエリアナライザーがデフォルトで有効になりました。
多くのバグ修正と新しい最適化の導入が行われましたが、ClickHouseの動作にいくつかの破壊的な変更ももたらしました。新しいアナライザー向けにクエリをどのように書き換えるかを判断するために、以下の変更をお読みください。

### 無効なクエリはもはや最適化されません {#invalid-queries-are-no-longer-optimized}

以前のクエリプランニングインフラは、クエリバリデーションステップの前にASTレベルの最適化を適用していました。
最適化により、初期クエリが書き換えられ、正当化（実行可能）となりました。

新しいアナライザーでは、クエリバリデーションは最適化ステップの前に行われます。
これにより、以前は実行可能だった無効なクエリは、サポートされなくなりました。
そのような場合、クエリを手動で修正する必要があります。

**例 1:**

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```

次のクエリは、集計後に `toString(number)` のみが利用可能な場合に、プロジェクションリストでカラム `number` を使用しています。
旧アナライザーでは、`GROUP BY toString(number)` は `GROUP BY number` に最適化され、クエリが有効になりました。

**例 2:**

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

このクエリでも同様の問題が発生します：カラム `number` は、別のキーで集約された後に使用されています。
以前のクエリアナライザーは、このクエリを修正するために `HAVING` 句から `WHERE` 句に `number > 5` フィルターを移動しました。

クエリを修正するには、集約されていないカラムに適用されるすべての条件を `WHERE` セクションに移動して、標準SQL構文に準拠する必要があります：
```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```

### 無効なクエリでの CREATE VIEW {#create-view-with-invalid-query}

新しいアナライザーでは、常に型チェックが行われます。
以前は、無効な `SELECT` クエリを持つ `VIEW` を作成することが可能でした。それは、最初の `SELECT` または `INSERT` （`MATERIALIZED VIEW` の場合）で失敗しました。

現在では、そのような `VIEW` を作成することは不可能です。

**例:**

```sql
CREATE TABLE source (data String) ENGINE=MergeTree ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```

### `JOIN` 句の既知の非互換性 {#known-incompatibilities-of-the-join-clause}

#### プロジェクションからのカラムを使用した結合 {#join-using-column-from-projection}

デフォルトでは、`SELECT` リストのエイリアスは `JOIN USING` キーとして使用できません。

新しい設定 `analyzer_compatibility_join_using_top_level_identifier` を有効にすると、結合条件が `SELECT` クエリのプロジェクションリストからの式に基づいて識別子を解決することを好むようになります。

**例:**

```sql
SELECT a + 1 AS b, t2.s
FROM Values('a UInt64, b UInt64', (1, 1)) AS t1
JOIN Values('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

`analyzer_compatibility_join_using_top_level_identifier` が `true` に設定されている場合、結合条件は `t1.a + 1 = t2.b` と解釈され、以前のバージョンの動作に一致します。したがって、結果は `2, 'two'` になります。
設定が `false` の場合、結合条件はデフォルトで `t1.b = t2.b` となり、クエリは `2, 'one'` を返します。
もし `b` が `t1` に存在しない場合、クエリはエラーで失敗します。

#### `JOIN USING` と `ALIAS`/`MATERIALIZED` カラムの動作の変更 {#changes-in-behavior-with-join-using-and-aliasmaterialized-columns}

新しいアナライザーでは、`ALIAS` または `MATERIALIZED` カラムを含む `JOIN USING` クエリで `*` を使用すると、デフォルトで結果セットにこれらのカラムが含まれるようになります。

**例:**

```sql
CREATE TABLE t1 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 VALUES (1), (2);

CREATE TABLE t2 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t2 VALUES (2), (3);

SELECT * FROM t1
FULL JOIN t2 USING (payload);
```

新しいアナライザーでは、このクエリの結果には両方のテーブルからの `id` と共に `payload` カラムが含まれます。対照的に、以前のアナライザーは、特定の設定（`asterisk_include_alias_columns` または `asterisk_include_materialized_columns`）が有効にされている場合のみ、これらの `ALIAS` カラムを含め、カラムが異なる順序で表示されることもありました。

古いクエリを新しいアナライザーに移行する際、一貫した期待どおりの結果を保証するために、`SELECT` 句でカラムを明示的に指定することをお勧めします。

#### `USING` 句のカラムに対する型修飾子の処理 {#handling-of-type-modifiers-for-columns-in-using-clause}

新しいバージョンのアナライザーでは、`USING` 句に指定されたカラムの共通のスーパータイプを決定するルールが標準化され、`LowCardinality` や `Nullable` などの型修飾子を扱う際により予測可能な結果が得られます。

- `LowCardinality(T)` と `T`：型 `LowCardinality(T)` のカラムが型 `T` のカラムと結合されると、結果の共通スーパータイプは `T` となり、`LowCardinality` 修飾子が効果的に無視されます。

- `Nullable(T)` と `T`：型 `Nullable(T)` のカラムが型 `T` のカラムと結合されると、結果の共通スーパータイプは `Nullable(T)` となり、nullable プロパティが保持されます。

**例:**

```sql
SELECT id, toTypeName(id) FROM Values('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN Values('id String', ('b')) AS t2
USING (id);
```

このクエリでは、`id` の共通スーパータイプが `String` と決定され、`t1` から `LowCardinality` 修飾子が無視されます。

### プロジェクションカラム名の変更 {#projection-column-names-changes}

プロジェクション名の計算中に、エイリアスは置き換えられません。

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
この変更により、型チェックが短絡評価の前に行われるため、`if` 関数の引数は常に共通スーパータイプを持っている必要があります。

**例:**

次のクエリは `There is no supertype for types Array(UInt8), String because some of them are Array and some of them are not` というエラーで失敗します：

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```

### 異種クラスタ {#heterogeneous-clusters}

新しいアナライザーは、クラスタ内のサーバー間の通信プロトコルを大幅に変更しました。したがって、異なる `enable_analyzer` 設定値を持つサーバーで分散クエリを実行することは不可能です。

### 変更は以前のアナライザーに解釈されます {#mutations-are-interpreted-by-previous-analyzer}

ミューテーションは依然として旧アナライザーを使用しています。これにより、一部の新しい ClickHouse SQL 機能は、ミューテーション内では使用できません。例えば、`QUALIFY` 句などです。
ステータスは [こちら](https://github.com/ClickHouse/ClickHouse/issues/61563) で確認できます。

### サポートされていない機能 {#unsupported-features}

新しいアナライザーが現在サポートしていない機能のリスト：

- Annoy インデックス。
- Hypothesis インデックス。作業中 [こちら](https://github.com/ClickHouse/ClickHouse/pull/48381)。
- ウィンドウビューはサポートされていません。今後のサポート計画はありません。
