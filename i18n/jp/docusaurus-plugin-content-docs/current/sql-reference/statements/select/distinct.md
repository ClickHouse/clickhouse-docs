---
slug: /sql-reference/statements/select/distinct
sidebar_label: DISTINCT
---


# DISTINCT 句

`SELECT DISTINCT` が指定されると、クエリ結果にはユニークな行のみが残ります。したがって、結果内の完全に一致する行のセットの中から唯一の行が残ります。

ユニークな値を持つカラムのリストを指定することもできます: `SELECT DISTINCT ON (column1, column2,...)`。カラムが指定されていない場合は、すべてのカラムが考慮されます。

テーブルを考慮してください:

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

カラムを指定せずに `DISTINCT` を使用:

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

指定したカラムで `DISTINCT` を使用:

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

ClickHouse は、1つのクエリ内で異なるカラムに対して `DISTINCT` と `ORDER BY` 句を使用することをサポートしています。`DISTINCT` 句は `ORDER BY` 句の前に実行されます。

テーブルを考慮してください:

``` text
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

``` text
┌─a─┐
│ 2 │
│ 1 │
│ 3 │
└───┘
```
異なるソート方向でデータを選択:

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

クエリをプログラミングする際にはこの実装の特性を考慮してください。

## NULL 処理 {#null-processing}

`DISTINCT` は [NULL](/sql-reference/syntax#null) を特定の値であるかのように扱い、`NULL==NULL` と見なします。言い換えれば、`DISTINCT` の結果において、`NULL` を含む異なる組み合わせは一度だけ現れます。これは他の多くの文脈における `NULL` 処理とは異なります。

## 代替手段 {#alternatives}

同じ結果を得るために [GROUP BY](/sql-reference/statements/select/group-by) を使用して、`SELECT` 句で指定した同じ値セットを適用することもできますが、集約関数を使用しない必要があります。ただし、`GROUP BY` アプローチとはいくつかの違いがあります:

- `DISTINCT` は `GROUP BY` と一緒に適用できます。
- [ORDER BY](../../../sql-reference/statements/select/order-by.md) を省略し、[LIMIT](../../../sql-reference/statements/select/limit.md) が定義されている場合、必要な異なる行数が読み込まれ次第、クエリの実行が直ちに停止します。
- データブロックは、クエリ全体の処理が完了するのを待たずに、処理される際にそのまま出力されます。
