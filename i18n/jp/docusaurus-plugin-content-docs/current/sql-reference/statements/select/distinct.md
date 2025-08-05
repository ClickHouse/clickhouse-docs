---
description: 'DISTINCT 句のドキュメント'
sidebar_label: 'DISTINCT'
slug: '/sql-reference/statements/select/distinct'
title: 'DISTINCT Clause'
---




# DISTINCT 句

`SELECT DISTINCT` が指定されている場合、クエリの結果にはユニークな行のみが残ります。したがって、結果内の完全に一致する行のセットからは1つの行のみが残ります。

ユニークな値を持つ必要があるカラムのリストを指定することができます: `SELECT DISTINCT ON (column1, column2,...)`。カラムが指定されていない場合、すべてのカラムが考慮されます。

テーブルを考えてみましょう:

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

カラムを指定せずに `DISTINCT` を使用する場合:

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

指定したカラムで `DISTINCT` を使用する場合:

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

## DISTINCT と ORDER BY {#distinct-and-order-by}

ClickHouse は、`DISTINCT` と `ORDER BY` 句を異なるカラムに対して1つのクエリで使用することをサポートしています。`DISTINCT` 句は、`ORDER BY` 句の前に実行されます。

テーブルを考えてみましょう:

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 1 │ 2 │
│ 3 │ 3 │
│ 2 │ 4 │
└───┴───┘
```

データを選択する場合:

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
異なるソート方向でデータを選択する場合:

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

行 `2, 4` はソートの前にカットされました。

クエリをプログラミングする際にはこの実装の仕様を考慮してください。

## NULL 処理 {#null-processing}

`DISTINCT` は、[NULL](/sql-reference/syntax#null) が特定の値として扱われ、`NULL==NULL` のように動作します。言い換えれば、`DISTINCT` の結果では、`NULL` を含む異なる組み合わせが1回だけ発生します。これは他のほとんどの文脈における `NULL` 処理とは異なります。

## 代替手段 {#alternatives}

同じ結果を得るために、集約関数を使用せずに `SELECT` 句で指定された同じ値のセットに対して [GROUP BY](/sql-reference/statements/select/group-by) を適用することもできます。しかし、`GROUP BY` アプローチにはいくつかの違いがあります:

- `DISTINCT` は `GROUP BY` と一緒に適用できます。
- [ORDER BY](../../../sql-reference/statements/select/order-by.md) が省略され、[LIMIT](../../../sql-reference/statements/select/limit.md) が定義されている場合、クエリは必要な異なる行の数が読み取られた後、すぐに実行が停止します。
- データブロックは、クエリ全体が完了するのを待つことなく、処理されるとすぐに出力されます。
