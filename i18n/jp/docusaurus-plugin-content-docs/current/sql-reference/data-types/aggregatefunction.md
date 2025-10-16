---
'description': 'ClickHouse における AggregateFunction データ型のドキュメントで、集約関数の中間状態を保存します'
'keywords':
- 'AggregateFunction'
- 'Type'
'sidebar_label': 'AggregateFunction'
'sidebar_position': 46
'slug': '/sql-reference/data-types/aggregatefunction'
'title': 'AggregateFunction タイプ'
'doc_type': 'reference'
---


# AggregateFunction Type

## 説明 {#description}

ClickHouseのすべての [Aggregate functions](/sql-reference/aggregate-functions) は、特定の実装に基づいた中間状態を持ち、これをシリアル化して `AggregateFunction` データ型としてテーブルに保存できます。通常、これは [materialized view](../../sql-reference/statements/create/view.md) を通じて行われます。

`AggregateFunction` 型と一般的に使用される2つの集約関数 [combinators](/sql-reference/aggregate-functions/combinators) があります：

- [`-State`](/sql-reference/aggregate-functions/combinators#-state) 集約関数コンビネーターは、集約関数名に追加されると、`AggregateFunction` の中間状態を生成します。
- [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 集約関数コンビネーターは、中間状態から集約の最終結果を得るために使用されます。

## 構文 {#syntax}

```sql
AggregateFunction(aggregate_function_name, types_of_arguments...)
```

**パラメータ**

- `aggregate_function_name` - 集約関数の名前。関数がパラメトリックの場合、そのパラメータも指定する必要があります。
- `types_of_arguments` - 集約関数引数の型。

例えば：

```sql
CREATE TABLE t
(
    column1 AggregateFunction(uniq, UInt64),
    column2 AggregateFunction(anyIf, String, UInt8),
    column3 AggregateFunction(quantiles(0.5, 0.9), UInt64)
) ENGINE = ...
```

## 使用法 {#usage}

### データ挿入 {#data-insertion}

`AggregateFunction` 型のカラムを持つテーブルにデータを挿入するには、集約関数と [`-State`](/sql-reference/aggregate-functions/combinators#-state) 集約関数コンビネーターを使用して `INSERT SELECT` を利用できます。

例えば、`AggregateFunction(uniq, UInt64)` および `AggregateFunction(quantiles(0.5, 0.9), UInt64)` 型のカラムに挿入するには、次の集約関数とコンビネーターを使用します。

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

関数 `uniq` と `quantiles` と対照的に、`uniqState` および `quantilesState` （`-State` コンビネーターが追加されたもの）は、最終値ではなく状態を返します。言い換えれば、これらは `AggregateFunction` 型の値を返します。

`SELECT` クエリの結果では、`AggregateFunction` 型の値は、すべての ClickHouse 出力形式に対して実装固有のバイナリ表現を持っています。

例えば、`TabSeparated` 形式にデータをダンプする際、`SELECT` クエリを使用してダンプした後、このダンプは `INSERT` クエリを使って再読み込みできます。

### データ選択 {#data-selection}

`AggregatingMergeTree` テーブルからデータを選択する場合、`GROUP BY` 句を使用し、データを挿入した際と同じ集約関数を使用しますが、[`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) コンビネーターを使用します。

`-Merge` コンビネーターが追加された集約関数は、中間状態のセットを取得し、それらを結合して完全なデータ集約の結果を返します。

例えば、次の2つのクエリは同じ結果を返します：

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```

## 使用例 {#usage-example}

[AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) エンジンの説明を参照してください。

## 参考コンテンツ {#related-content}

- ブログ: [ClickHouseでのAggregate Combinatorsの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate) コンビネーター。
- [State](/sql-reference/aggregate-functions/combinators#-state) コンビネーター。
