---
slug: /sql-reference/statements/select/distinct
sidebar_label: DISTINCT
---

# DISTINCT 句

`SELECT DISTINCT` が指定されている場合、クエリ結果には一意の行のみが残ります。したがって、結果の中で完全に一致する行のセットからは、1 行だけが残ります。

一意の値を持つ必要のあるカラムのリストを指定できます: `SELECT DISTINCT ON (column1, column2,...)`。カラムが指定されていない場合は、すべてのカラムが考慮されます。

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

ClickHouse では、1 つのクエリ内で `DISTINCT` と `ORDER BY` 句を異なるカラムに対して使用することがサポートされています。`DISTINCT` 句は `ORDER BY` 句の前に実行されます。

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

行 `2, 4` はソート前に削除されました。

クエリをプログラムする際には、この実装の特性に留意してください。

## NULL 処理 {#null-processing}

`DISTINCT` は [NULL](../../../sql-reference/syntax.md#null-literal) を特定の値のように扱い、`NULL==NULL` とみなします。言い換えれば、`DISTINCT` の結果では、`NULL` を含む異なる組み合わせは一度だけ発生します。これはほとんどの他の文脈における `NULL` の処理とは異なります。

## 代替手段 {#alternatives}

同じ値のセットで [GROUP BY](../../../sql-reference/statements/select/group-by.md) を適用することによって同じ結果を得ることが可能ですが、集約関数を使用せずに指定された `SELECT` 句に対して適用する必要があります。ただし、`GROUP BY` アプローチとの違いがいくつかあります:

- `DISTINCT` は `GROUP BY` と一緒に適用できます。
- [ORDER BY](../../../sql-reference/statements/select/order-by.md) が省略されている場合、[LIMIT](../../../sql-reference/statements/select/limit.md) が定義されていると、クエリは異なる行の必要数が読み取られた後すぐに停止します。
- データブロックは全体のクエリが完了するのを待たずに処理されたとおりに出力されます。
