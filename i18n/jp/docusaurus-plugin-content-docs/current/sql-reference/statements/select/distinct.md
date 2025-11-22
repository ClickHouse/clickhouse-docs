---
description: 'DISTINCT 句に関するドキュメント'
sidebar_label: 'DISTINCT'
slug: /sql-reference/statements/select/distinct
title: 'DISTINCT 句'
doc_type: 'reference'
---



# DISTINCT 句

`SELECT DISTINCT` が指定されている場合、クエリ結果には重複のない行のみが残ります。したがって、結果中で完全に一致する行の集合ごとに、1 行だけが残ります。

値が一意であるべき列のリストを指定できます: `SELECT DISTINCT ON (column1, column2,...)`。列が指定されていない場合は、すべての列が考慮されます。

次のテーブルを例にします:

```text
┌─a─┬─b─┬─c─┐
│ 1 │ 1 │ 1 │
│ 1 │ 1 │ 1 │
│ 2 │ 2 │ 2 │
│ 2 │ 2 │ 2 │
│ 1 │ 1 │ 2 │
│ 1 │ 2 │ 2 │
└───┴───┴───┘
```

`DISTINCT` を列を指定せずに使用する場合:

```sql
SELECT DISTINCT * FROM t1;
```

```text
┌─a─┬─b─┬─c─┐
│ 1 │ 1 │ 1 │
│ 2 │ 2 │ 2 │
│ 1 │ 1 │ 2 │
│ 1 │ 2 │ 2 │
└───┴───┴───┘
```

特定の列を指定した `DISTINCT` の使用：

```sql
SELECT DISTINCT ON (a,b) * FROM t1;
```

```text
┌─a─┬─b─┬─c─┐
│ 1 │ 1 │ 1 │
│ 2 │ 2 │ 2 │
│ 1 │ 2 │ 2 │
└───┴───┴───┘
```


## DISTINCTとORDER BY {#distinct-and-order-by}

ClickHouseは、1つのクエリ内で異なる列に対して`DISTINCT`句と`ORDER BY`句を使用することをサポートしています。`DISTINCT`句は`ORDER BY`句よりも前に実行されます。

次のテーブルを考えます:

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 1 │ 2 │
│ 3 │ 3 │
│ 2 │ 4 │
└───┴───┘
```

データの選択:

```sql
SELECT DISTINCT a FROM t1 ORDER BY b ASC;
```

```text
┌─a─┐
│ 2 │
│ 1 │
│ 3 │
└───┘
```

異なるソート方向でのデータの選択:

```sql
SELECT DISTINCT a FROM t1 ORDER BY b DESC;
```

```text
┌─a─┐
│ 3 │
│ 1 │
│ 2 │
└───┘
```

行`2, 4`はソート前に除外されました。

クエリを記述する際には、この実装の特性を考慮してください。


## NULL処理 {#null-processing}

`DISTINCT`は[NULL](/sql-reference/syntax#null)を特定の値として扱い、`NULL==NULL`として動作します。言い換えると、`DISTINCT`の結果では、`NULL`を含む異なる組み合わせは一度だけ出現します。これは、他のほとんどのコンテキストにおける`NULL`処理とは異なります。


## 代替手段 {#alternatives}

集約関数を使用せずに、`SELECT`句で指定されたものと同じ値のセットに対して[GROUP BY](/sql-reference/statements/select/group-by)を適用することで、同じ結果を得ることができます。ただし、`GROUP BY`アプローチとはいくつかの違いがあります:

- `DISTINCT`は`GROUP BY`と併用できます。
- [ORDER BY](../../../sql-reference/statements/select/order-by.md)が省略され、[LIMIT](../../../sql-reference/statements/select/limit.md)が定義されている場合、必要な数の異なる行が読み取られた時点で、クエリの実行が即座に停止します。
- データブロックは、クエリ全体の実行完了を待たずに、処理されるごとに出力されます。
