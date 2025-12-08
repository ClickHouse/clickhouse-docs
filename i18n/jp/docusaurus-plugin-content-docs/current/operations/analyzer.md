---
description: 'ClickHouse クエリ アナライザーの詳細ページ'
keywords: ['analyzer']
sidebar_label: 'アナライザー'
slug: /operations/analyzer
title: 'アナライザー'
doc_type: 'reference'
---

# Analyzer {#analyzer}

ClickHouse バージョン `24.3` では、新しいクエリアナライザーがデフォルトで有効になりました。
その動作の詳細については[こちら](/guides/developer/understanding-query-execution-with-the-analyzer#analyzer)を参照してください。

## 既知の非互換性 {#known-incompatibilities}

多数のバグ修正と新しい最適化を導入した一方で、ClickHouse の動作には後方互換性を破る変更もいくつか含まれています。新しいアナライザ用にクエリを書き換える方法を判断するために、以下の変更点を確認してください。

### 無効なクエリはこれ以上最適化されない {#invalid-queries-are-no-longer-optimized}

以前のクエリプランニング基盤では、クエリの検証ステップより前に AST レベルの最適化が適用されていました。
この最適化により、元のクエリを書き換えて有効かつ実行可能にできる場合がありました。

新しいアナライザでは、最適化ステップより前にクエリ検証が行われます。
これは、以前は実行可能だった無効なクエリが、現在はサポートされなくなったことを意味します。
そのような場合、そのクエリは手動で修正する必要があります。

#### 例 1 {#example-1}

次のクエリは、集約後に利用可能なのが `toString(number)` だけであるにもかかわらず、SELECT 句でカラム `number` を使用しています。
旧アナライザでは、`GROUP BY toString(number)` は `GROUP BY number` に最適化され、その結果クエリは有効になっていました。

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```

#### 例 2 {#example-2}

このクエリでも同じ問題が発生します。列 `number` は、別のキーと一緒に集約した後に使用されています。
以前のクエリアナライザーは、`number > 5` というフィルタを `HAVING` 句から `WHERE` 句に移動することで、このクエリを修正しました。

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

このクエリを修正するには、標準的な SQL 構文に従うよう、集約されていない列に適用されるすべての条件を `WHERE` 句に移動する必要があります。

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```

### 無効なクエリを指定した `CREATE VIEW` {#create-view-with-invalid-query}

新しいアナライザは常に型チェックを行います。
以前は、無効な `SELECT` クエリを含む `VIEW` を作成できていました。
その場合、最初の `SELECT` または（`MATERIALIZED VIEW` の場合は）`INSERT` で失敗していました。

このような形で `VIEW` を作成することは、もはやできません。

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

#### プロジェクションの列を使用する `JOIN` {#join-using-column-from-projection}

`SELECT` リスト内のエイリアスは、デフォルトでは `JOIN USING` のキーとして使用できません。

新しい設定 `analyzer_compatibility_join_using_top_level_identifier` を有効にすると、`JOIN USING` の動作が変更され、左側テーブルの列を直接使用するのではなく、`SELECT` クエリのプロジェクションリストに含まれる式を基に識別子を優先的に解決するようになります。

例：

```sql
SELECT a + 1 AS b, t2.s
FROM VALUES('a UInt64, b UInt64', (1, 1)) AS t1
JOIN VALUES('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

`analyzer_compatibility_join_using_top_level_identifier` を `true` に設定すると、結合条件は `t1.a + 1 = t2.b` と解釈され、以前のバージョンと同じ動作になります。
結果は `2, 'two'` になります。
設定が `false` の場合、結合条件はデフォルトで `t1.b = t2.b` となり、クエリは `2, 'one'` を返します。
`b` が `t1` に存在しない場合、クエリはエラーとなって失敗します。

#### `JOIN USING` と `ALIAS` / `MATERIALIZED` カラムにおける動作の変更 {#changes-in-behavior-with-join-using-and-aliasmaterialized-columns}

新しいアナライザでは、`ALIAS` または `MATERIALIZED` カラムを含む `JOIN USING` クエリで `*` を使用すると、それらのカラムもデフォルトで結果セットに含まれます。

例えば次のようになります。

```sql
CREATE TABLE t1 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 VALUES (1), (2);

CREATE TABLE t2 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t2 VALUES (2), (3);

SELECT * FROM t1
FULL JOIN t2 USING (payload);
```

新しいアナライザーでは、このクエリの結果には、両方のテーブルからの `id` 列に加えて `payload` 列が含まれます。
これに対して、以前のアナライザーでは、特定の設定（`asterisk_include_alias_columns` または `asterisk_include_materialized_columns`）が有効になっている場合にのみ、これらの `ALIAS` 列が結果に含まれ、
かつ列の並び順が異なる場合がありました。

特に古いクエリを新しいアナライザーに移行する際に、一貫性があり期待どおりの結果を得るためには、`*` を使うのではなく、`SELECT` 句で列を明示的に指定することを推奨します。

#### `USING` 句内の列に対する型修飾子の扱い {#handling-of-type-modifiers-for-columns-in-using-clause}

新しいバージョンのアナライザーでは、`USING` 句で指定された列に対して共通スーパータイプを決定するための規則が標準化されており、
特に `LowCardinality` や `Nullable` といった型修飾子を扱う際に、より予測しやすい結果が得られるようになっています。

* `LowCardinality(T)` と `T`: 型 `LowCardinality(T)` の列が型 `T` の列と結合される場合、結果の共通スーパータイプは `T` となり、`LowCardinality` 修飾子は実質的に破棄されます。
* `Nullable(T)` と `T`: 型 `Nullable(T)` の列が型 `T` の列と結合される場合、結果の共通スーパータイプは `Nullable(T)` となり、NULL 許容であるという性質が保持されます。

例：

```sql
SELECT id, toTypeName(id)
FROM VALUES('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN VALUES('id String', ('b')) AS t2
USING (id);
```

このクエリでは、`id` の共通スーパータイプは `String` として判定され、`t1` では `LowCardinality` 修飾子が除外されます。

### Projection 列名の変更 {#projection-column-names-changes}

Projection 列名を計算する際、エイリアスは展開されません。

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

### 互換性のない関数引数の型 {#incompatible-function-arguments-types}

新しいアナライザーでは、型推論はクエリの初期解析中に行われます。
この変更により、短絡評価の前に型チェックが行われるようになり、その結果、`if` 関数の引数は常に共通の上位型（スーパータイプ）を持つ必要があります。

例えば、次のクエリは `There is no supertype for types Array(UInt8), String because some of them are Array and some of them are not` というエラーで失敗します。

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```

### 異種クラスタ {#heterogeneous-clusters}

新しい analyzer は、クラスタ内のサーバー間の通信プロトコルを大きく変更します。\
そのため、`enable_analyzer` の設定値が異なるサーバー間で分散クエリを実行することはできません。

### ミューテーションは旧 analyzer によって解釈される {#mutations-are-interpreted-by-previous-analyzer}

ミューテーションは依然として古い analyzer を使用します。\
これは、一部の新しい ClickHouse SQL 機能（たとえば `QUALIFY` 句）がミューテーションでは使用できないことを意味します。\
対応状況は[こちら](https://github.com/ClickHouse/ClickHouse/issues/61563)で確認できます。

### 未サポートの機能 {#unsupported-features}

新しい analyzer が現在サポートしていない機能の一覧は以下のとおりです。

* Annoy インデックス。
* Hypothesis インデックス。作業状況は[こちら](https://github.com/ClickHouse/ClickHouse/pull/48381)。
* Window view はサポートされていません。今後もサポートする予定はありません。
