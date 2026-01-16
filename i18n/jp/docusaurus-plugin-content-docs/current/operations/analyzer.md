---
description: 'ClickHouse クエリ アナライザーの詳細ページ'
keywords: ['analyzer']
sidebar_label: 'アナライザー'
slug: /operations/analyzer
title: 'アナライザー'
doc_type: 'reference'
---

# Analyzer \{#analyzer\}

ClickHouse バージョン `24.3` では、新しいクエリアナライザーがデフォルトで有効になりました。
その動作の詳細については[こちら](/guides/developer/understanding-query-execution-with-the-analyzer#analyzer)を参照してください。

## 既知の非互換性 \\{#known-incompatibilities\\}

多数のバグ修正と新しい最適化を導入した一方で、ClickHouse の動作には後方互換性を破る変更もいくつか含まれています。新しいアナライザ用にクエリを書き換える方法を判断するために、以下の変更点を確認してください。

### 無効なクエリはこれ以上最適化されない \\{#invalid-queries-are-no-longer-optimized\\}

以前のクエリプランニング基盤では、クエリの検証ステップより前に AST レベルの最適化が適用されていました。
この最適化により、元のクエリを書き換えて有効かつ実行可能にできる場合がありました。

新しいアナライザでは、最適化ステップより前にクエリ検証が行われます。
これは、以前は実行可能だった無効なクエリが、現在はサポートされなくなったことを意味します。
そのような場合、そのクエリは手動で修正する必要があります。

#### 例 1 \{#example-1\}

次のクエリは、集約後に利用可能なのが `toString(number)` だけであるにもかかわらず、SELECT 句でカラム `number` を使用しています。
旧アナライザでは、`GROUP BY toString(number)` は `GROUP BY number,` に最適化され、その結果クエリは有効になっていました。

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```


#### 例 2 \{#example-2\}

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


### 無効なクエリを指定した `CREATE VIEW` \\{#create-view-with-invalid-query\\}

新しいアナライザは常に型チェックを行います。
以前は、無効な `SELECT` クエリを含む `VIEW` を作成できていました。
その場合、最初の `SELECT` または（`MATERIALIZED VIEW` の場合は）`INSERT` で失敗していました。

このような形で `VIEW` を作成することは、もはやできません。

#### 例 \{#example-view\}

```sql
CREATE TABLE source (data String)
ENGINE=MergeTree
ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```


### `JOIN` 句の既知の非互換性 \\{#known-incompatibilities-of-the-join-clause\\}

#### プロジェクションの列を使用する `JOIN` \{#join-using-column-from-projection\}

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
`b` が `t1` に存在しない場合、クエリはエラーで失敗します。


#### `JOIN USING` と `ALIAS` / `MATERIALIZED` カラムにおける動作の変更 \{#changes-in-behavior-with-join-using-and-aliasmaterialized-columns\}

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

新しいアナライザでは、このクエリの結果には、両方のテーブルの `id` とともに `payload` カラムが含まれます。
対照的に、以前のアナライザでは、特定の設定（`asterisk_include_alias_columns` または `asterisk_include_materialized_columns`）が有効な場合にのみこれらの `ALIAS` カラムが含まれ、
また、カラムの並び順が異なる場合もありました。

特に古いクエリを新しいアナライザへ移行する際に、一貫性があり予測可能な結果を得るためには、`*` を使用するのではなく、`SELECT` 句でカラムを明示的に指定することを推奨します。


#### `USING` 句内の列に対する型修飾子の扱い \{#handling-of-type-modifiers-for-columns-in-using-clause\}

新しいバージョンのアナライザーでは、`USING` 句で指定された列に対して共通スーパータイプを決定するための規則が標準化されており、
特に `LowCardinality` や `Nullable` といった型修飾子を扱う際に、より予測しやすい結果が得られるようになっています。

* `LowCardinality(T)` と `T`: 型 `LowCardinality(T)` の列が型 `T` の列と結合される場合、結果の共通スーパータイプは `T` となり、`LowCardinality` 修飾子は実質的に破棄されます。
* `Nullable(T)` と `T`: 型 `Nullable(T)` の列が型 `T` の列と結合される場合、結果の共通スーパータイプは `Nullable(T)` となり、NULL を許容するという性質が保持されます。

例：

```sql
SELECT id, toTypeName(id)
FROM VALUES('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN VALUES('id String', ('b')) AS t2
USING (id);
```

このクエリでは、`id` の共通スーパータイプは `String` として判定され、`t1` からは `LowCardinality` 修飾子が取り除かれます。


### Projection 列名の変更 \{#projection-column-names-changes\}

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


### 互換性のない関数引数の型 \{#incompatible-function-arguments-types\}

新しいアナライザーでは、型推論はクエリの初期解析中に行われます。
この変更により、短絡評価の前に型チェックが行われるようになり、その結果、`if` 関数の引数は常に共通の上位型（スーパータイプ）を持つ必要があります。

例えば、次のクエリは `There is no supertype for types Array(UInt8), String because some of them are Array and some of them are not` というエラーになり失敗します。

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```


### 異種クラスタ \\{#heterogeneous-clusters\\}

新しい analyzer は、クラスタ内のサーバー間の通信プロトコルを大きく変更します。\
そのため、`enable_analyzer` の設定値が異なるサーバー間で分散クエリを実行することはできません。

### ミューテーションは旧 analyzer によって解釈される \\{#mutations-are-interpreted-by-previous-analyzer\\}

ミューテーションは依然として古い analyzer を使用します。\
これは、一部の新しい ClickHouse SQL 機能（たとえば `QUALIFY` 句）がミューテーションでは使用できないことを意味します。\
対応状況は[こちら](https://github.com/ClickHouse/ClickHouse/issues/61563)で確認できます。

### 未サポートの機能 \\{#unsupported-features\\}

新しい analyzer が現在サポートしていない機能の一覧は以下のとおりです。

* Annoy インデックス。
* Hypothesis インデックス。作業状況は[こちら](https://github.com/ClickHouse/ClickHouse/pull/48381)。
* Window view はサポートされていません。今後もサポートする予定はありません。

## Cloud Migration \\{#cloud-migration\\}

現在無効になっているすべてのインスタンスで新しいクエリアナライザーを有効化し、新たな機能面および性能面での最適化をサポートします。この変更により、より厳密な SQL のスコープルールが適用されるため、規則に準拠していないクエリはお客様にて手動で更新していただく必要があります。

### マイグレーションワークフロー \{#migration-workflow\}

1. `normalized_query_hash` を使用して `system.query_log` を絞り込み、クエリを特定します。

```sql
SELECT query 
FROM clusterAllReplicas(default, system.query_log)
WHERE normalized_query_hash='{hash}' 
LIMIT 1 
SETTINGS skip_unavailable_shards=1
```

2. これらの設定を追加し、analyzer を有効にした状態でクエリを実行します。

```sql
SETTINGS
    enable_analyzer=1,
    analyzer_compatibility_join_using_top_level_identifier=1
```

3. アナライザーを無効にした状態で生成される出力と一致することを確認できるよう、クエリ結果を書き換えて検証します。

社内テストで頻繁に見られた非互換事項を参照してください。


### 不明な式識別子 \\{#unknown-expression-identifier\\}

エラー: `Unknown expression identifier ... in scope ... (UNKNOWN_IDENTIFIER)`。例外コード: 47

原因: フィルター内で計算済みエイリアスを参照する、あいまいなサブクエリの射影、あるいは「動的な」CTE スコープなど、非標準で寛容なレガシー動作に依存するクエリは、現在は正しく無効なものとして検出され、即座に拒否されます。   

解決策: 次のように SQL パターンを更新します:

- フィルターロジック: 結果に対してフィルターする場合はロジックを WHERE から HAVING に移動するか、元データに対してフィルターする場合は WHERE 句側にも同じ式を記述します。
- サブクエリスコープ: 外側のクエリで必要となるすべてのカラムを明示的に SELECT します。
- JOIN キー: キーがエイリアスの場合は、`USING` ではなく完全な式を指定した `ON` を使用します。
- 外側のクエリでは、内部のテーブルではなく、サブクエリ / CTE 自体のエイリアスを参照します。

### GROUP BY で集約されていないカラム \{#non-aggregated-columns-in-group-by\}

Error: `Column ... is not under aggregate function and not in GROUP BY keys (NOT_AN_AGGREGATE)`. Exception code: 215

原因: 旧アナライザーでは、GROUP BY 句に含まれていないカラムを選択することが許可されており（多くの場合、任意の値が選択される）、エラーにはなりませんでした。新しいアナライザーは標準 SQL に従い、SELECT 句で指定されるすべてのカラムは集約関数で囲まれているか、グルーピングキーである必要があります。

解決策: 対象のカラムを `any()` や `argMax()` で囲むか、そのカラムを GROUP BY に追加してください。

```sql
/* ORIGINAL QUERY */
-- device_id is ambiguous
SELECT user_id, device_id FROM table GROUP BY user_id

/* FIXED QUERY */
SELECT user_id, any(device_id) FROM table GROUP BY user_id
-- OR
SELECT user_id, device_id FROM table GROUP BY user_id, device_id
```


### 重複した CTE 名 \{#duplicate-cte-names\}

Error: `CTE with name ... already exists (MULTIPLE_EXPRESSIONS_FOR_ALIAS)`. Exception code: 179

原因: 旧アナライザでは、同じ名前の複数の Common Table Expressions（WITH ...）を、前に定義されたものを上書きする形で定義することが許可されていました。新しいアナライザでは、このような曖昧さは許可されません。

解決策: 重複している CTE の名前を一意になるように変更してください。

```sql
/* ORIGINAL QUERY */
WITH 
  data AS (SELECT 1 AS id), 
  data AS (SELECT 2 AS id) -- Redefined
SELECT * FROM data;

/* FIXED QUERY */
WITH 
  raw_data AS (SELECT 1 AS id), 
  processed_data AS (SELECT 2 AS id)
SELECT * FROM processed_data;
```


### 曖昧なカラム識別子 \{#ambiguous-column-identifiers\}

エラー: `JOIN [JOIN TYPE] ambiguous identifier ... (AMBIGUOUS_IDENTIFIER)` 例外コード: 207

原因: クエリが `JOIN` で結合されている複数のテーブルに存在する同名のカラムを、どのテーブル由来かを指定せずに参照しています。旧アナライザーは内部ロジックに基づいてカラムを推測していましたが、新アナライザーでは明示的な指定が必要です。

解決策: カラムを table&#95;alias.column&#95;name の形式で完全修飾します。

```sql
/* ORIGINAL QUERY */
SELECT table1.ID AS ID FROM table1, table2 WHERE ID...

/* FIXED QUERY */
SELECT table1.ID AS ID_RENAMED FROM table1, table2 WHERE ID_RENAMED...
```


### FINAL の不正な使用 \{#invalid-usage-of-final\}

Error: `Table expression modifiers FINAL are not supported for subquery...` または `Storage ... doesn't support FINAL` (`UNSUPPORTED_METHOD`). Exception codes: 1, 181

Cause: FINAL はテーブルストレージ（特に [Shared]ReplacingMergeTree）用の修飾子です。新しいアナライザーは、次のような場合に適用された FINAL を拒否します：

* サブクエリまたは派生テーブル（例: FROM (SELECT ...) FINAL）
* FINAL をサポートしないテーブルエンジン（例: SharedMergeTree）

Solution: FINAL はサブクエリ内のソーステーブルにのみ適用するか、そのエンジンが FINAL をサポートしていない場合は削除してください。

```sql
/* ORIGINAL QUERY */
SELECT * FROM (SELECT * FROM my_table) AS subquery FINAL ...

/* FIXED QUERY */
SELECT * FROM (SELECT * FROM my_table FINAL) AS subquery ...
```


### `countDistinct()` 関数の大文字・小文字の扱い \\{#countdistinct-case-insensitivity\\}

エラー: `Function with name countdistinct does not exist (UNKNOWN_FUNCTION)`. 例外コード: 46

原因: 新しい analyzer では関数名は大文字・小文字を区別し、厳密にマッピングされます。`countdistinct`（すべて小文字）はもはや自動的に解決されなくなりました。

解決策: 標準の `countDistinct`（camelCase）か、ClickHouse 固有の `uniq` を使用してください。