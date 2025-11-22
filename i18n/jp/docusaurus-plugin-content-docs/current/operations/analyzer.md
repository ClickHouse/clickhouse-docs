---
description: 'ClickHouse クエリ解析機能の詳細ページ'
keywords: ['analyzer']
sidebar_label: 'アナライザー'
slug: /operations/analyzer
title: 'アナライザー'
doc_type: 'reference'
---



# Analyzer

ClickHouse バージョン `24.3` では、新しいクエリアナライザーがデフォルトで有効です。
その動作の詳細については[こちら](/guides/developer/understanding-query-execution-with-the-analyzer#analyzer)を参照してください。



## 既知の非互換性 {#known-incompatibilities}

多数のバグ修正と新しい最適化の導入により、ClickHouseの動作にいくつかの破壊的変更も導入されています。新しいアナライザーに対応するためにクエリを書き直す方法を判断するために、以下の変更内容をお読みください。

### 無効なクエリは最適化されなくなりました {#invalid-queries-are-no-longer-optimized}

以前のクエリ計画インフラストラクチャでは、クエリ検証ステップの前にASTレベルの最適化が適用されていました。
最適化により、初期クエリが有効で実行可能なものに書き換えられることがありました。

新しいアナライザーでは、最適化ステップの前にクエリ検証が行われます。
これは、以前は実行可能だった無効なクエリが、現在はサポートされなくなったことを意味します。
このような場合、クエリは手動で修正する必要があります。

#### 例 1 {#example-1}

以下のクエリは、集約後に`toString(number)`のみが利用可能であるにもかかわらず、射影リストで列`number`を使用しています。
古いアナライザーでは、`GROUP BY toString(number)`が`GROUP BY number`に最適化され、クエリが有効になっていました。

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```

#### 例 2 {#example-2}

このクエリでも同じ問題が発生します。列`number`は、別のキーで集約された後に使用されています。
以前のクエリアナライザーは、`number > 5`フィルターを`HAVING`句から`WHERE`句に移動することで、このクエリを修正していました。

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

クエリを修正するには、標準SQL構文に準拠するために、非集約列に適用されるすべての条件を`WHERE`セクションに移動する必要があります。

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```

### 無効なクエリを使用した`CREATE VIEW` {#create-view-with-invalid-query}

新しいアナライザーは常に型チェックを実行します。
以前は、無効な`SELECT`クエリで`VIEW`を作成することが可能でした。
その場合、最初の`SELECT`または`INSERT`（`MATERIALIZED VIEW`の場合）の際に失敗していました。

この方法で`VIEW`を作成することはできなくなりました。

#### 例 {#example-view}

```sql
CREATE TABLE source (data String)
ENGINE=MergeTree
ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```

### `JOIN`句の既知の非互換性 {#known-incompatibilities-of-the-join-clause}

#### 射影からの列を使用した`JOIN` {#join-using-column-from-projection}

`SELECT`リストからのエイリアスは、デフォルトでは`JOIN USING`キーとして使用できません。

新しい設定`analyzer_compatibility_join_using_top_level_identifier`を有効にすると、`JOIN USING`の動作が変更され、左側のテーブルの列を直接使用するのではなく、`SELECT`クエリの射影リストからの式に基づいて識別子を解決することが優先されます。

例えば：

```sql
SELECT a + 1 AS b, t2.s
FROM VALUES('a UInt64, b UInt64', (1, 1)) AS t1
JOIN VALUES('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

`analyzer_compatibility_join_using_top_level_identifier`を`true`に設定すると、結合条件は`t1.a + 1 = t2.b`として解釈され、以前のバージョンの動作と一致します。
結果は`2, 'two'`になります。
設定が`false`の場合、結合条件はデフォルトで`t1.b = t2.b`となり、クエリは`2, 'one'`を返します。
`t1`に`b`が存在しない場合、クエリはエラーで失敗します。

#### `JOIN USING`と`ALIAS`/`MATERIALIZED`列の動作の変更 {#changes-in-behavior-with-join-using-and-aliasmaterialized-columns}

新しいアナライザーでは、`ALIAS`または`MATERIALIZED`列を含む`JOIN USING`クエリで`*`を使用すると、デフォルトでこれらの列が結果セットに含まれます。

例えば：

```sql
CREATE TABLE t1 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 VALUES (1), (2);

CREATE TABLE t2 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t2 VALUES (2), (3);

SELECT * FROM t1
FULL JOIN t2 USING (payload);
```


新しいアナライザでは、このクエリの結果には両方のテーブルから`payload`列と`id`が含まれます。
対照的に、以前のアナライザでは、特定の設定(`asterisk_include_alias_columns`または`asterisk_include_materialized_columns`)が有効になっている場合にのみこれらの`ALIAS`列が含まれ、列が異なる順序で表示される可能性がありました。

特に古いクエリを新しいアナライザに移行する際に、一貫性のある期待通りの結果を保証するには、`*`を使用するのではなく、`SELECT`句で列を明示的に指定することを推奨します。

#### `USING`句における列の型修飾子の処理 {#handling-of-type-modifiers-for-columns-in-using-clause}

新しいバージョンのアナライザでは、`USING`句で指定された列の共通スーパータイプを決定するルールが標準化され、特に`LowCardinality`や`Nullable`などの型修飾子を扱う際に、より予測可能な結果が得られるようになりました。

- `LowCardinality(T)`と`T`: `LowCardinality(T)`型の列が`T`型の列と結合される場合、結果として得られる共通スーパータイプは`T`となり、`LowCardinality`修飾子は実質的に破棄されます。
- `Nullable(T)`と`T`: `Nullable(T)`型の列が`T`型の列と結合される場合、結果として得られる共通スーパータイプは`Nullable(T)`となり、null許容プロパティが保持されます。

例:

```sql
SELECT id, toTypeName(id)
FROM VALUES('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN VALUES('id String', ('b')) AS t2
USING (id);
```

このクエリでは、`id`の共通スーパータイプは`String`と決定され、`t1`の`LowCardinality`修飾子は破棄されます。

### 射影列名の変更 {#projection-column-names-changes}

射影名の計算中、エイリアスは置換されません。

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

新しいアナライザでは、型推論は初期クエリ解析中に行われます。
この変更により、型チェックは短絡評価の前に実行されます。したがって、`if`関数の引数は常に共通スーパータイプを持つ必要があります。

例えば、次のクエリは`There is no supertype for types Array(UInt8), String because some of them are Array and some of them are not`というエラーで失敗します:

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```

### 異種クラスタ {#heterogeneous-clusters}

新しいアナライザは、クラスタ内のサーバー間の通信プロトコルを大幅に変更します。したがって、異なる`enable_analyzer`設定値を持つサーバー上で分散クエリを実行することはできません。

### ミューテーションは以前のアナライザによって解釈される {#mutations-are-interpreted-by-previous-analyzer}

ミューテーションは依然として古いアナライザを使用しています。
これは、一部の新しいClickHouse SQL機能がミューテーションで使用できないことを意味します。例えば、`QUALIFY`句などです。
ステータスは[こちら](https://github.com/ClickHouse/ClickHouse/issues/61563)で確認できます。

### サポートされていない機能 {#unsupported-features}

新しいアナライザが現在サポートしていない機能のリストを以下に示します:

- Annoyインデックス。
- Hypothesisインデックス。作業は[こちら](https://github.com/ClickHouse/ClickHouse/pull/48381)で進行中です。
- ウィンドウビューはサポートされていません。将来的にサポートする予定はありません。
