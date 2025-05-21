---
description: 'DISTINCT句に関するドキュメント'
sidebar_label: 'DISTINCT'
slug: /sql-reference/statements/select/distinct
title: 'DISTINCT句'
---


# DISTINCT句

`SELECT DISTINCT`が指定されると、クエリ結果にはユニークな行のみが残ります。したがって、完全に一致する行の全てのセットの中から1つの行のみが残ります。

ユニークな値を持つ必要があるカラムのリストを指定できます: `SELECT DISTINCT ON (column1, column2,...)`。カラムが指定されない場合は、全てのカラムが考慮されます。

次のテーブルを考慮してください:

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

カラムを指定せずに`DISTINCT`を使用する場合:

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

指定されたカラムで`DISTINCT`を使用する場合:

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

ClickHouseでは、異なるカラムに対して`DISTINCT`と`ORDER BY`句を同じクエリで使用することがサポートされています。`DISTINCT`句は`ORDER BY`句の前に実行されます。

次のテーブルを考慮してください:

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

行`2, 4`はソート前にカットされました。

クエリをプログラミングする際には、この実装の特異性を考慮してください。

## Null処理 {#null-processing}

`DISTINCT`は[NULL](/sql-reference/syntax#null)を特定の値として扱い、`NULL==NULL`とします。言い換えれば、`DISTINCT`の結果において、`NULL`を含む異なる組み合わせは一度だけ発生します。これは、ほとんどの他のコンテキストでの`NULL`処理とは異なります。

## 代替手段 {#alternatives}

同じ結果を得るために、集約関数を使用せずに`SELECT`句で指定された同じ値のセットに対して[GROUP BY](/sql-reference/statements/select/group-by)を適用することが可能です。しかし、`GROUP BY`アプローチとのいくつかの違いがあります:

- `DISTINCT`は`GROUP BY`と一緒に適用できます。
- [ORDER BY](../../../sql-reference/statements/select/order-by.md)が省略され、[LIMIT](../../../sql-reference/statements/select/limit.md)が指定されている場合、必要な異なる行の数が読み取られ次第、クエリは即座に終了します。
- データブロックは、クエリ全体の実行が終了するのを待つことなく、処理されると同時に出力されます。
