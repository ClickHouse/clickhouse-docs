---
'description': 'ページの詳細は ClickHouse クエリアナライザーに関するものです'
'keywords':
- 'analyzer'
'sidebar_label': 'Analyzer'
'slug': '/operations/analyzer'
'title': 'Analyzer'
'doc_type': 'reference'
---


# Analyzer

ClickHouse バージョン `24.3` では、新しいクエリアナライザがデフォルトで有効になりました。
その動作についての詳細は [こちら](/guides/developer/understanding-query-execution-with-the-analyzer#analyzer) をご覧ください。

## 既知の非互換性 {#known-incompatibilities}

多くのバグが修正され、新しい最適化が導入された一方で、ClickHouse の動作にいくつかの破壊的変更が加えられました。新しいアナライザのためにクエリをどのように書き直すべきかを判断するために、以下の変更をお読みください。

### 無効なクエリはもはや最適化されない {#invalid-queries-are-no-longer-optimized}

以前のクエリプランニングインフラストラクチャは、クエリ検証ステップの前に AST レベルの最適化を適用していました。
最適化により、初期クエリが有効かつ実行可能になるよう書き換えられることがありました。

新しいアナライザでは、クエリ検証が最適化ステップの前に行われます。
これは、以前は実行可能だった無効なクエリが現在はサポートされないことを意味します。
このような場合、クエリを手動で修正する必要があります。

#### 例 1 {#example-1}

次のクエリは、集約後に利用可能な `toString(number)` のみがあるにもかかわらず、プロジェクションリストでカラム `number` を使用しています。
古いアナライザでは、`GROUP BY toString(number)` が `GROUP BY number,` に最適化され、クエリが有効になりました。

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```

#### 例 2 {#example-2}

このクエリにも同様の問題が発生します。カラム `number` が他のキーで集約された後に使用されています。
以前のクエリアナライザは、`HAVING` 句から `WHERE` 句に `number > 5` フィルタを移動することでこのクエリを修正しました。

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

クエリを修正するには、非集約カラムに適用されるすべての条件を標準 SQL 構文に従い `WHERE` セクションに移動する必要があります：

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```

### 無効なクエリでの `CREATE VIEW` {#create-view-with-invalid-query}

新しいアナライザは常に型チェックを行います。
以前は、無効な `SELECT` クエリで `VIEW` を作成することが可能でした。
その場合、最初の `SELECT` または `INSERT`（`MATERIALIZED VIEW` の場合）で失敗します。

このような方法で `VIEW` を作成することはもはや不可能です。

#### 例 {#example-view}

```sql
CREATE TABLE source (data String)
ENGINE=MergeTree
ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```

### `JOIN` 句の既知の非互換性 {#known-incompatibilities-of-the-join-clause}

#### プロジェクションからのカラムを使用した `JOIN` {#join-using-column-from-projection}

`SELECT` リストからのエイリアスは、デフォルトでは `JOIN USING` キーとして使用できません。

新しい設定 `analyzer_compatibility_join_using_top_level_identifier` を有効にすると、`JOIN USING` の動作が変更され、`SELECT` クエリのプロジェクションリストからの式に基づいて識別子を解決することを優先します。

例えば：

```sql
SELECT a + 1 AS b, t2.s
FROM VALUES('a UInt64, b UInt64', (1, 1)) AS t1
JOIN VALUES('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

`analyzer_compatibility_join_using_top_level_identifier` を `true` に設定すると、結合条件は `t1.a + 1 = t2.b` と解釈され、以前のバージョンの動作と一致します。
結果は `2, 'two'` になります。
設定が `false` の場合、結合条件はデフォルトで `t1.b = t2.b` となり、クエリは `2, 'one'` を返します。
`t1` に `b` が存在しない場合、クエリはエラーで失敗します。

#### `JOIN USING` と `ALIAS`/`MATERIALIZED` カラムの動作の変更 {#changes-in-behavior-with-join-using-and-aliasmaterialized-columns}

新しいアナライザでは、`ALIAS` または `MATERIALIZED` カラムを含む `JOIN USING` クエリで `*` を使用すると、これらのカラムがデフォルトで結果セットに含まれます。

例えば：

```sql
CREATE TABLE t1 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 VALUES (1), (2);

CREATE TABLE t2 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t2 VALUES (2), (3);

SELECT * FROM t1
FULL JOIN t2 USING (payload);
```

新しいアナライザでは、このクエリの結果に両方のテーブルから `id` とともに `payload` カラムが含まれます。
対照的に、以前のアナライザでは、特定の設定（`asterisk_include_alias_columns` または `asterisk_include_materialized_columns`）が有効な場合のみこれらの `ALIAS` カラムが含まれ、
カラムの順序が異なる場合があります。

特に古いクエリを新しいアナライザに移行する際には、一貫した期待される結果を確保するために、`SELECT` 句で明示的にカラムを指定することが推奨されます。

#### `USING` 句のカラムに対する型修飾子の取り扱い {#handling-of-type-modifiers-for-columns-in-using-clause}

新しいアナライザのバージョンでは、`USING` 句に指定されたカラムの共通スーパーテイプを決定するルールが標準化され、より予測可能な結果を生成するようになりました。
特に、`LowCardinality` および `Nullable` のような型修飾子を扱う際に。

- `LowCardinality(T)` と `T`: `LowCardinality(T)` 型のカラムと `T` 型のカラムが結合されると、結果の共通スーパーテイプは `T` となり、`LowCardinality` 修飾子は無視されます。
- `Nullable(T)` と `T`: `Nullable(T)` 型のカラムと `T` 型のカラムが結合されると、結果の共通スーパーテイプは `Nullable(T)` となり、ヌラブルプロパティが保持されます。

例えば：

```sql
SELECT id, toTypeName(id)
FROM VALUES('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN VALUES('id String', ('b')) AS t2
USING (id);
```

このクエリでは、`id` の共通スーパーテイプは `String` と決定され、`t1` の `LowCardinality` 修飾子は無視されます。

### プロジェクションカラム名の変更 {#projection-column-names-changes}

プロジェクション名計算中に、エイリアスは置き換えられません。

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

新しいアナライザでは、型推論が初期クエリ分析中に行われます。
この変更により、型チェックはショートサーキット評価の前に行われるため、`if` 関数の引数は常に共通スーパーテイプを持つ必要があります。

例えば、次のクエリは `Array(UInt8)` と `String` の型のスーパーテイプは存在しないため、失敗します：

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```

### 異種クラスター {#heterogeneous-clusters}

新しいアナライザは、クラスター内のサーバー間の通信プロトコルを大きく変更します。そのため、異なる `enable_analyzer` 設定値を持つサーバーで分散クエリを実行することは不可能です。

### 変異は以前のアナライザによって解釈される {#mutations-are-interpreted-by-previous-analyzer}

変異はまだ古いアナライザを使用しています。
これは、新しい ClickHouse SQL 機能の一部が変異で使用できないことを意味します。たとえば、`QUALIFY` 句です。
そのステータスは [こちら](https://github.com/ClickHouse/ClickHouse/issues/61563) で確認できます。

### サポートされていない機能 {#unsupported-features}

新しいアナライザが現在サポートしていない機能のリストは以下の通りです：

- Annoy インデックス。
- Hypothesis インデックス。作業進行中 [こちら](https://github.com/ClickHouse/ClickHouse/pull/48381)。
- ウィンドウビューはサポートされていません。将来的にサポートする計画はありません。
