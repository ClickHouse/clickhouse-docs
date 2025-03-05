---
slug: /sql-reference/statements/select/distinct
sidebar_label: DISTINCT
---


# DISTINCT 句

`SELECT DISTINCT` が指定されている場合、クエリ結果にはユニークな行のみが残ります。したがって、完全に一致する行のセットからは、単一の行のみが残ります。

ユニークな値を持つ必要があるカラムのリストを指定できます: `SELECT DISTINCT ON (column1, column2,...)` 。カラムが指定されていない場合は、すべてが考慮されます。

次のテーブルを考えてみましょう:

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

指定されたカラムで `DISTINCT` を使用する場合:

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

ClickHouse は、1 つのクエリ内で異なるカラムに対して `DISTINCT` および `ORDER BY` 句を使用することをサポートしています。 `DISTINCT` 句は、`ORDER BY` 句の前に実行されます。

次のテーブルを考えてみましょう:

``` text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 1 │ 2 │
│ 3 │ 3 │
│ 2 │ 4 │
└───┴───┘
```

データを選択する:

```sql
SELECT DISTINCT a FROM t1 ORDER BY b ASC;
```

``` text
┌─a─┐
│ 2 │
│ 1 │
│ 3 │
└───┘
```
異なるソート方向でデータを選択する:

```sql
SELECT DISTINCT a FROM t1 ORDER BY b DESC;
```

``` text
┌─a─┐
│ 3 │
│ 1 │
│ 2 │
└───┘
```

行 `2, 4` はソート前にカットされました。

クエリをプログラミングする際には、この実装の特性を考慮してください。

## NULL 処理 {#null-processing}

`DISTINCT` は [NULL](/sql-reference/syntax#null) を特定の値として扱い、`NULL==NULL` として機能します。言い換えれば、`DISTINCT` の結果では、`NULL` を含む異なる組み合わせが一度だけ現れます。これは他の多くの文脈における `NULL` の処理とは異なります。

## 代替 {#alternatives}

同じ結果を得るために、指定された `SELECT` 句の同じ値セットに対して [GROUP BY](../../../sql-reference/statements/select/group-by.md) を適用することができますが、集約関数を使用せずに。 ただし、`GROUP BY` アプローチとはいくつかの違いがあります:

- `DISTINCT` は `GROUP BY` とともに適用できます。
- [ORDER BY](../../../sql-reference/statements/select/order-by.md) が省略され、[LIMIT](../../../sql-reference/statements/select/limit.md) が定義されている場合、クエリは必要な数の異なる行が読み取られた後すぐに停止します。
- データブロックは、クエリが完了するのを待つことなく処理されるとして出力されます。
